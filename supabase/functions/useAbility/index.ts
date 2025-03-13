import {
  createPGError,
  functionResponse,
  preflightResponse,
  supabase,
} from "../_shared/utils.ts";
import { Tables } from "../_shared/supabaseTypes.ts";
import { CharacterWithAbilities } from "../_shared/types.ts";

type ReqParams = {
  abilityNumber: 1 | 2 | 3;
  initiatorId: Tables<"characters">["id"];
  receiverId: Tables<"characters">["id"];
  fightId: Tables<"fights">["id"];
};

type FightUpdateFields = {
  game_over: Tables<"fights">["game_over"];
  turn: Tables<"fights">["turn"];
  current_turn_player_id: Tables<"fights">["current_turn_player_id"];
  winner_id: Tables<"fights">["winner_id"];
};

type FightWithPlayers = Tables<"fights"> & {
  player1: CharacterWithAbilities;
  player2: CharacterWithAbilities;
};

function rollChance(chance: number | undefined) {
  return chance === undefined ? false : Math.random() <= chance;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  const SAVE_FIELDS = Deno.env.get("SAVE_FIELDS") === "true" ||
      typeof Deno.env.get("SAVE_FIELDS") === "undefined"
    ? true
    : false;

  console.log({ SAVE_FIELDS });

  try {
    const reqParams: ReqParams = await req.json();
    let initiator: CharacterWithAbilities,
      receiver: CharacterWithAbilities;

    if (![1, 2, 3].includes(reqParams.abilityNumber)) {
      throw new Error("abilityNumber can only be 1, 2 or 3");
    }

    const { data: fight, error: fetchFightError } = await supabase.from(
      "fights",
    ).select(
      "*, player1:player1_id (*, ability1:ability_1_id (*), ability2:ability_2_id (*), ability3:ability_3_id (*)), player2:player2_id(*, ability1:ability_1_id (*), ability2:ability_2_id (*), ability3:ability_3_id (*))",
    ).eq(
      "id",
      reqParams.fightId,
    ).returns<FightWithPlayers[]>().single();

    if (fetchFightError) throw createPGError(fetchFightError);

    console.log({ fight });

    let missed;

    if (reqParams.initiatorId === fight.player1_id) {
      initiator = fight.player1;
      receiver = fight.player2;
    } else {
      initiator = fight.player2;
      receiver = fight.player1;
    }

    const ability = initiator[`ability${reqParams.abilityNumber}`] as
      | CharacterWithAbilities[
        "ability1"
      ]
      | CharacterWithAbilities[
        "ability2"
      ]
      | CharacterWithAbilities[
        "ability3"
      ];

    // check if attack missed
    if (rollChance(ability.metadata.miss)) {
      missed = true;
    } else if (ability.metadata.attack) {
      missed = false;

      // health should not exceed max health
      receiver.current_health = Math.max(
        0,
        receiver.current_health -
          Math.round(initiator.attack * ability.metadata.attack),
      );
      console.log({ receiver });
    }

    if (ability.metadata.health) {
      // health should not be less than 0
      initiator.current_health = Math.min(
        initiator.max_health,
        initiator.current_health +
          ability.metadata.health,
      );
    }

    // setting these variables becuase they will be used as values to update below
    let gameOver = false;
    let winnerId: Tables<"fights">["winner_id"] = null;

    if (initiator.current_health === 0 || receiver.current_health === 0) {
      gameOver = true;
      initiator.fighting = false;
      receiver.fighting = false;
    }

    if (initiator.current_health === 0) {
      winnerId = receiver.id;
      initiator.alive = false;
    }

    if (SAVE_FIELDS) {
      const { error: playerUpdateError } = await supabase
        .from("characters").update(
          {
            attack: initiator.attack,
            defense: initiator.defense,
            current_health: initiator.current_health,
            max_health: initiator.max_health,
            alive: initiator.alive,
            fighting: initiator.fighting,
          },
        ).eq(
          "id",
          initiator.id,
        );

      if (playerUpdateError) throw createPGError(playerUpdateError);
    }

    // TODO: account for the situation where initiator may kills themselves
    //  using a skill that hurts them as well
    if (receiver.current_health === 0) {
      winnerId = initiator.id;
      receiver.alive = false;
    }

    if (SAVE_FIELDS) {
      const { error: opponentUpdateError } = await supabase
        .from("characters").update(
          {
            attack: receiver.attack,
            defense: receiver.defense,
            current_health: receiver.current_health,
            max_health: receiver.max_health,
            alive: receiver.alive,
            fighting: receiver.fighting,
          },
        ).eq(
          "id",
          receiver.id,
        );

      if (opponentUpdateError) throw createPGError(opponentUpdateError);
    }

    const fightUpdatefields: FightUpdateFields = {
      game_over: gameOver,
      current_turn_player_id: rollChance(ability.metadata.skip)
        ? initiator.id
        : receiver.id,
      turn: fight.turn + 1,
      winner_id: winnerId,
    };

    if (SAVE_FIELDS) {
      const { error: fightsUpdateError } = await supabase
        .from("fights").update(
          fightUpdatefields,
        ).eq(
          "id",
          reqParams.fightId,
        );

      if (fightsUpdateError) throw createPGError(fightsUpdateError);
    } else {
      const { error: fightsUpdateError } = await supabase
        .from("fights").update(
          {
            turn: fightUpdatefields.turn,
          },
        ).eq(
          "id",
          reqParams.fightId,
        );

      if (fightsUpdateError) throw createPGError(fightsUpdateError);
    }

    let player1, player2;

    if (initiator.id === fight.player1_id) {
      player1 = initiator;
      player2 = receiver;
    } else {
      player1 = receiver;
      player2 = initiator;
    }

    const { error: actionsInsertError } = await supabase.from("actions").insert(
      {
        initiator: initiator.id,
        type: "ability",
        metadata: {
          ...fightUpdatefields,
          player_1: player1,
          player_2: player2,
          winner_id: winnerId,
          missed,
        },
      },
    );

    if (actionsInsertError) throw createPGError(actionsInsertError);

    return functionResponse({ successful: true }, 200);
  } catch (error) {
    let message;

    if (error instanceof Error) {
      console.error(error);
      message = error.message;
    } else {
      message = "Unknown error";
    }
    return functionResponse({ successful: false, error: message }, 500);
  }
});
