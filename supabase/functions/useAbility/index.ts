import {
  functionResponse,
  generateSupabaseClient,
  preflightResponse,
} from "../_shared/utils.ts";
import { Tables } from "../_shared/supabaseTypes.ts";

interface ReqParams {
  abilityNumber: 1 | 2 | 3;
  playerId: string;
  opponentId: string;
}

interface AbilityMetadata {
  metadata: {
    attack?: number;
    defense?: number;
    health?: number;
  };
}

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

    const [
      { data: player, error: playerError },
      { data: opponent, error: opponentError },
    ] = await Promise
      .all([
        playerCharacterQuery,
        opponentCharacterQuery,
      ]);

    if (playerError) throw playerError;
    if (opponentError) throw opponentError;

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

      // console.log(
      //   "currentHealth",
      //   opponent.current_health,
      // );
    }

    if (ability.metadata.health) {
      // health should not be less than 0
      playerProxy.current_health = Math.min(
        player.max_health,
        player.current_health +
          ability.metadata.health,
      );

      // console.log(
      //   "currentHealth",
      //   opponent.current_health,
      // );
    }

    if (playerChanged) {
      const { error: playerUpdateError } = await supabase
        .from("characters").update(
          {
            attack: player.attack,
            defense: player.defense,
            current_health: player.current_health,
            max_health: player.max_health,
          },
        ).eq(
          "id",
          player.id,
        );

      if (playerUpdateError) throw playerUpdateError;
    }

    if (opponentChanged) {
      const { error: opponentUpdateError } = await supabase
        .from("characters").update(
          {
            attack: opponent.attack,
            defense: opponent.defense,
            current_health: opponent.current_health,
            max_health: opponent.max_health,
          },
        ).eq(
          "id",
          opponent.id,
        );

      if (opponentUpdateError) throw opponentUpdateError;
    }

    return functionResponse({ successful: true }, 200);
  } catch (error) {
    console.error(error);
    return functionResponse({ successful: false, error: error.message }, 500);
  }
});
