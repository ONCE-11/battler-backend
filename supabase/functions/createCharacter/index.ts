import { corsHeaders } from "../_shared/cors.ts";
import { generateSupabaseClient } from "../_shared/supabaseClient.ts";
import { Database } from "../_shared/supabaseTypes.ts";

const generateRandomValue = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomValueAndRemove = (
  abilities: Database["public"]["Tables"]["abilities"]["Row"][]
) => {
  const randomIndex = generateRandomValue(0, abilities.length - 1);
  const randomValue = abilities[randomIndex].id;
  abilities.splice(randomIndex, 1);

  return randomValue;
};

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    const supabase = generateSupabaseClient();

    const [
      { data: characters, error: characterSelectError },
      { data: abilities, error: abilitiesError },
    ] = await Promise.all([
      supabase.from("characters").select().eq("alive", true),
      supabase.from("abilities").select(),
    ]);

    if (characterSelectError) throw characterSelectError;
    if (abilitiesError) throw abilitiesError;

    if (characters!.length > 0)
      throw Error("You cannot have more than one character alive");

    const health = generateRandomValue(75, 125);

    const { error: characterInsertError } = await supabase
      .from("characters")
      .insert({
        attack: generateRandomValue(1, 10),
        defense: generateRandomValue(1, 10),
        max_health: health,
        current_health: health,
        user_id,
        ability_1_id: generateRandomValueAndRemove(abilities!),
        ability_2_id: generateRandomValueAndRemove(abilities!),
        ability_3_id: generateRandomValueAndRemove(abilities!),
      });

    if (characterInsertError) throw characterInsertError;

    return new Response(JSON.stringify({ data: "Character created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
