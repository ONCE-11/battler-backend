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
  const randomValue = abilities[randomIndex];
  abilities.splice(randomIndex, 1);

  return randomValue;
};

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const supabase = generateSupabaseClient();

    const [
      { count: charactersCount, error: charactersCountError },
      { data: abilities, error: abilitiesError },
      { data: avatars, error: avatarsError },
    ] = await Promise.all([
      supabase
        .from("characters")
        .select("*", { count: "exact", head: true })
        .eq("alive", true)
        .eq("user_id", userId),
      supabase.from("abilities").select(),
      supabase.storage.from("avatars").list(),
    ]);

    if (charactersCountError) throw charactersCountError;
    if (abilitiesError) throw abilitiesError;
    if (avatarsError) throw avatarsError;

    if (charactersCount! > 0)
      throw Error("You cannot have more than one character alive");

    const health = generateRandomValue(75, 125);
    const avatarUrlIndex = generateRandomValue(0, avatars!.length - 1);
    const {
      data: { publicUrl: avatarUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatars![avatarUrlIndex].name);

    const ability1 = generateRandomValueAndRemove(abilities!);
    const ability2 = generateRandomValueAndRemove(abilities!);
    const ability3 = generateRandomValueAndRemove(abilities!);

    const { data: newCharacterData, error: characterInsertError } =
      await supabase
        .from("characters")
        .insert({
          attack: generateRandomValue(1, 10),
          defense: generateRandomValue(1, 10),
          max_health: health,
          current_health: health,
          user_id: userId,
          ability_1_id: ability1.id,
          ability_2_id: ability2.id,
          ability_3_id: ability3.id,
          // on development SUPABASE_URL is set to http://kong:8000 which is the url to talk to docker
          avatar_url:
            Deno.env.get("DENO_ENV") == "development"
              ? avatarUrl.replace(
                  Deno.env.get("SUPABASE_URL")!,
                  Deno.env.get("LOCAL_BUCKET_URL")!
                )
              : avatarUrl,
        })
        .select(
          "id, attack, defense, max_health, current_health, avatar_url, created_at"
        )
        .single();

    if (characterInsertError) throw characterInsertError;

    const response = {
      id: newCharacterData.id,
      attack: newCharacterData.attack,
      defense: newCharacterData.defense,
      maxHealth: newCharacterData.max_health,
      currentHealth: newCharacterData.current_health,
      avatarUrl: newCharacterData.avatar_url,
      createdAt: newCharacterData.created_at,
      ability1,
      ability2,
      ability3,
    };

    console.log(response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
