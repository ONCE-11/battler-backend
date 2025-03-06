import {
  functionResponse,
  preflightResponse,
  supabase,
} from "../_shared/utils.ts";
import {
  AbilityWithMetadata,
  CharacterWithAbilities,
} from "../_shared/types.ts";

// const supabase = generateSupabaseClient();

function generateRandomValue(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomValueAndRemove(
  abilities: AbilityWithMetadata[],
): AbilityWithMetadata {
  const randomIndex = generateRandomValue(0, abilities.length - 1);
  const randomValue = abilities[randomIndex];
  abilities.splice(randomIndex, 1);

  return randomValue;
}

async function generateCharacterName(): Promise<string> {
  const { data: names, error } = await supabase.from("archetypes").select("*");
  if (error) throw error;

  const { prefix, suffix } = names[generateRandomValue(0, names.length - 1)];

  return `${prefix} ${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  try {
    const { userId } = await req.json();

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
      supabase.from("abilities").select("*").returns<AbilityWithMetadata[]>(),
      supabase.storage.from("avatars").list(),
    ]);

    if (charactersCountError) throw charactersCountError;
    if (abilitiesError) throw abilitiesError;
    if (avatarsError) throw avatarsError;

    if (charactersCount! > 0) {
      throw Error("You cannot have more than one character alive");
    }

    const health = generateRandomValue(75, 125);
    const avatarUrlIndex = generateRandomValue(0, avatars.length - 1);
    const avatarFilename = avatars[avatarUrlIndex].name;
    const {
      data: { publicUrl: avatarUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarFilename);

    const ability1 = generateRandomValueAndRemove(abilities);
    const ability2 = generateRandomValueAndRemove(abilities);
    const ability3 = generateRandomValueAndRemove(abilities);

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
          avatar_url: Deno.env.get("DENO_ENV") == "development"
            ? avatarUrl.replace(
              Deno.env.get("SUPABASE_URL")!,
              Deno.env.get("LOCAL_BUCKET_URL")!,
            )
            : avatarUrl,
          avatar_path: avatarUrl.replace(
            Deno.env.get("SUPABASE_URL")!,
            "",
          ),
          name: await generateCharacterName(),
        })
        .select(
          "*",
        )
        .single();

    if (characterInsertError) throw characterInsertError;

    const response: CharacterWithAbilities = {
      ...newCharacterData,
      ability1,
      ability2,
      ability3,
    };

    return functionResponse(response, 201);
  } catch (error) {
    let message;

    if (error instanceof Error) {
      console.error(error);
      message = error.message;
    } else {
      message = "Unknown error";
    }

    return functionResponse({ error: message }, 500);
  }
});
