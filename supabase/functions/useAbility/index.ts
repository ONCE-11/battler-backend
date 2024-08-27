import {
  functionResponse,
  generateSupabaseClient,
  preflightResponse,
} from "../_shared/utils.ts";
import { Tables } from "../_shared/supabaseTypes.ts";

type ReqParams = {
  abilityNumber: 1 | 2 | 3;
  playerId: string;
  opponentId: string;
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
  winner?: Tables<"fights">["winner"];
};

type CharactersWithAbilites = {
  id: Tables<"characters">["id"];
  attack: Tables<"characters">["attack"];
  defense: Tables<"characters">["defense"];
  current_health: Tables<"characters">["current_health"];
  max_health: Tables<"characters">["max_health"];
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

    const supabase = generateSupabaseClient();

    const playerCharacterQuery = supabase.from("characters").select(
      "id, attack, defense, current_health, max_health, ability1:ability_1_id (*), ability2:ability_2_id (*), ability3:ability_3_id (*)",
    ).eq(
      "id",
      reqParams.playerId,
    ).returns<CharactersWithAbilites[]>().single();

    const opponentCharacterQuery = supabase.from("characters").select(
      "id, attack, defense, current_health, max_health, ability1:ability_1_id (*), ability2:ability_2_id (*), ability3:ability_3_id (*)",
    ).eq(
      "id",
      reqParams.opponentId,
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

    if (playerError) throw playerError;
    if (opponentError) throw opponentError;
    if (fightsError) throw fightsError;

    const ability = player[`ability${reqParams.abilityNumber}`];
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

    let gameOver = false;
    let winner: Tables<"fights">["winner"];

    if (playerChanged) {
      let playerAlive = true;

      if (player.current_health === 0) {
        playerAlive = false;
        // winner = "2";
        winner = opponent.id === fight.player1_id ? "1" : "2";
        gameOver = true;
      }

      const { error: playerUpdateError } = await supabase
        .from("characters").update(
          {
            attack: player.attack,
            defense: player.defense,
            current_health: player.current_health,
            max_health: player.max_health,
            alive: playerAlive,
          },
        ).eq(
          "id",
          player.id,
        );

      if (playerUpdateError) throw playerUpdateError;
    }

    if (opponentChanged) {
      let opponentAlive = true;

      if (opponent.current_health === 0) {
        opponentAlive = false;
        winner = player.id === fight.player1_id ? "1" : "2";
        gameOver = true;
      }

      const { error: opponentUpdateError } = await supabase
        .from("characters").update(
          {
            attack: opponent.attack,
            defense: opponent.defense,
            current_health: opponent.current_health,
            max_health: opponent.max_health,
            alive: opponentAlive,
          },
        ).eq(
          "id",
          opponent.id,
        );

      if (opponentUpdateError) throw opponentUpdateError;
    }

    const fightUpdatefields: FightUpdateFields = {
      game_over: gameOver,
      turn: fight.turn + 1,
    };

    // this code is weird, probably need to change this
    if (winner!) {
      fightUpdatefields.winner = winner;
    }

    const { error: fightsUpdateError } = await supabase
      .from("fights").update(
        fightUpdatefields,
      ).eq(
        "id",
        reqParams.fightId,
      );

    if (fightsUpdateError) throw fightsUpdateError;

    return functionResponse({ successful: true }, 200);
  } catch (error) {
    console.error(error);
    return functionResponse({ successful: false, error: error.message }, 500);
  }
});
