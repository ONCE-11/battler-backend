import {
  createPGError,
  functionResponse,
  preflightResponse,
  supabase,
} from "../_shared/utils.ts";
import { Tables } from "../_shared/supabaseTypes.ts";

type ReqParams = {
  abilityNumber: 1 | 2 | 3;
  initiatorId: string;
  receiverId: string;
  fightId: string;
};

type AbilityMetadata = {
  metadata: {
    attack?: number;
    defense?: number;
    health?: number;
  };
};

type FightUpdateFields = {
  game_over: Tables<"fights">["game_over"];
  turn: Tables<"fights">["turn"];
  current_turn_player_id: Tables<"fights">["current_turn_player_id"];
  winner?: Tables<"fights">["winner"];
};

// type CharactersWithAbilites = {
//   id: Tables<"characters">["id"];
//   attack: Tables<"characters">["attack"];
//   defense: Tables<"characters">["defense"];
//   current_health: Tables<"characters">["current_health"];
//   max_health: Tables<"characters">["max_health"];
//   ability1: Tables<"abilities"> & AbilityMetadata;
//   ability2: Tables<"abilities"> & AbilityMetadata;
//   ability3: Tables<"abilities"> & AbilityMetadata;
// };

type CharactersWithAbilites = Tables<"characters"> & {
  ability1: Tables<"abilities"> & AbilityMetadata;
  ability2: Tables<"abilities"> & AbilityMetadata;
  ability3: Tables<"abilities"> & AbilityMetadata;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  try {
    const reqParams: ReqParams = await req.json();

    if (![1, 2, 3].includes(reqParams.abilityNumber)) {
      throw new Error("abilityNumber can only be 1, 2 or 3");
    }

    const playerCharacterQuery = supabase.from("characters").select(
      "*, ability1:ability_1_id (*), ability2:ability_2_id (*), ability3:ability_3_id (*)",
    ).eq(
      "id",
      reqParams.initiatorId,
    ).returns<CharactersWithAbilites[]>().single();

    const opponentCharacterQuery = supabase.from("characters").select(
      "*, ability1:ability_1_id (*), ability2:ability_2_id (*), ability3:ability_3_id (*)",
    ).eq(
      "id",
      reqParams.receiverId,
    ).returns<CharactersWithAbilites[]>().single();

    const fightQuery = supabase.from("fights").select("*").eq(
      "id",
      reqParams.fightId,
    ).returns<Tables<"fights">[]>().single();

    const [
      { data: player, error: playerError },
      { data: opponent, error: opponentError },
      { data: fight, error: fightsError },
    ] = await Promise
      .all([
        playerCharacterQuery,
        opponentCharacterQuery,
        fightQuery,
      ]);

    if (playerError) throw createPGError(playerError);
    if (opponentError) throw createPGError(opponentError);
    if (fightsError) throw createPGError(fightsError);

    const ability = player[`ability${reqParams.abilityNumber}`] as
      | CharactersWithAbilites[
        "ability1"
      ]
      | CharactersWithAbilites[
        "ability2"
      ]
      | CharactersWithAbilites[
        "ability3"
      ];
    let playerChanged = false;
    let opponentChanged = false;

    console.log({ ability });

    // check if player or opponent data has changed
    const playerProxy = new Proxy(player, {
      set(...args) {
        playerChanged = true;
        return Reflect.set(...args);
      },
    });

    const opponentProxy = new Proxy(opponent, {
      set(...args) {
        opponentChanged = true;
        return Reflect.set(...args);
      },
    });

    if (ability.metadata.attack) {
      // health should not exceed max health
      opponentProxy.current_health = Math.max(
        0,
        opponent.current_health -
          Math.round(player.attack * ability.metadata.attack),
      );
    }

    if (ability.metadata.health) {
      // health should not be less than 0
      playerProxy.current_health = Math.min(
        player.max_health,
        player.current_health +
          ability.metadata.health,
      );
    }

    // setting these variables becuase they will be used as values to update below
    let gameOver = false;
    let winner: Tables<"fights">["winner"] = null;

    if (playerChanged) {
      if (player.current_health === 0) {
        winner = opponent.id;
        gameOver = true;
        player.alive = false;
      }

      const { error: playerUpdateError } = await supabase
        .from("characters").update(
          {
            attack: player.attack,
            defense: player.defense,
            current_health: player.current_health,
            max_health: player.max_health,
            alive: player.alive,
          },
        ).eq(
          "id",
          player.id,
        );

      if (playerUpdateError) throw createPGError(playerUpdateError);
    }

    if (opponentChanged) {
      if (opponent.current_health === 0) {
        winner = player.id;
        gameOver = true;
        opponent.alive = false;
      }

      const { error: opponentUpdateError } = await supabase
        .from("characters").update(
          {
            attack: opponent.attack,
            defense: opponent.defense,
            current_health: opponent.current_health,
            max_health: opponent.max_health,
            alive: opponent.alive,
          },
        ).eq(
          "id",
          opponent.id,
        );

      if (opponentUpdateError) throw createPGError(opponentUpdateError);
    }

    console.log({ fight });

    console.log(
      "current turn player id: ",
      fight.turn % 2 === 0 ? fight.player1_id : fight.player2_id,
    );

    const fightUpdatefields: FightUpdateFields = {
      game_over: gameOver,
      current_turn_player_id: fight.turn % 2 === 0
        ? fight.player1_id
        : fight.player2_id,
      turn: fight.turn + 1,
      winner,
    };

    // const { error: fightsUpdateError } = await supabase
    //   .from("fights").update(
    //     { turn: fight.turn + 1 },
    //   ).eq(
    //     "id",
    //     reqParams.fightId,
    //   );

    const { error: fightsUpdateError } = await supabase
      .from("fights").update(
        fightUpdatefields,
      ).eq(
        "id",
        reqParams.fightId,
      );

    if (fightsUpdateError) throw createPGError(fightsUpdateError);

    let player1, player2;

    if (player.id === fight.player1_id) {
      player1 = player;
      player2 = opponent;
    } else {
      player1 = opponent;
      player2 = player;
    }

    const { error: actionsInsertError } = await supabase.from("actions").insert(
      {
        initiator: player.id,
        type: "ability",
        metadata: {
          fight: fightUpdatefields,
          player1,
          player2,
          winnerId: winner,
        },
      },
    );

    if (actionsInsertError) throw createPGError(actionsInsertError);

    return functionResponse({ successful: true }, 200);
  } catch (error) {
    console.error(error);
    return functionResponse({ successful: false, error: error.message }, 500);
  }
});
