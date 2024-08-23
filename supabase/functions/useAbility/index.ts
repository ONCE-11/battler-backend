import { corsHeaders } from "../_shared/cors.ts";
import { generateSupabaseClient } from "../_shared/supabaseClient.ts";
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
    return new Response("ok", { headers: corsHeaders });
  }

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
    opponentProxy.current_health = opponent.current_health -
      Math.round(player.attack * ability.metadata.attack);

    // console.log(
    //   "currentHealth",
    //   opponent.current_health,
    // );
  }

  if (ability.metadata.health) {
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

  return new Response(
    JSON.stringify(reqParams),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/useAbility' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
