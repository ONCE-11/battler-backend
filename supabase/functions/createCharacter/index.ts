import {
  functionResponse,
  preflightResponse,
  supabase,
} from "../_shared/utils.ts";
import {
  AbilityWithMetadata,
  CharacterWithAbilities,
} from "../_shared/types.ts";
import { Tables } from "../_shared/supabaseTypes.ts";

// const supabase = generateSupabaseClient();

function generateRandomValue(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSpecialAbility(abilities: AbilityWithMetadata[]) {
  const specialAbilities = abilities.filter((ability) =>
    ability.type === "special"
  );
  const randomIndex = generateRandomValue(0, specialAbilities.length - 1);
  return specialAbilities[randomIndex];
}

function pickStrongAbility(abilities: AbilityWithMetadata[]) {
  const strongAbilities = abilities.filter((ability) =>
    ability.type === "strong"
  );
  const randomIndex = generateRandomValue(0, strongAbilities.length - 1);
  return strongAbilities[randomIndex];
}

function pickWeakAbility(abilities: AbilityWithMetadata[]) {
  const weakAbilities = abilities.filter((ability) => ability.type === "weak");
  const randomIndex = generateRandomValue(0, weakAbilities.length - 1);
  return weakAbilities[randomIndex];
}

function pickArchetype(
  archetypes: Tables<"archetypes">[],
): Tables<"archetypes"> {
  return archetypes[generateRandomValue(0, archetypes.length - 1)];
}

async function generateCharacterName(): Promise<string> {
  const { data: archetypes, error } = await supabase.from("archetypes").select(
    "*",
  );
  if (error) throw error;

  const { name } = archetypes[generateRandomValue(0, archetypes.length - 1)];

  return name;
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
      { data: archetypes, error: archetypesError },
    ] = await Promise.all([
      supabase
        .from("characters")
        .select("*", { count: "exact", head: true })
        .eq("alive", true)
        .eq("user_id", userId),
      supabase.from("abilities").select("*").returns<AbilityWithMetadata[]>(),
      supabase.from("archetypes").select("*"),
    ]);

    // const { name, avatar_filename: avatarFilename } = await pickArchetype();

    if (charactersCountError) throw charactersCountError;
    if (abilitiesError) throw abilitiesError;
    if (archetypesError) throw archetypesError;

    if (charactersCount! > 0) {
      throw Error("You cannot have more than one character alive");
    }

    const health = generateRandomValue(75, 125);

    const ability1 = pickWeakAbility(abilities);
    const ability2 = pickStrongAbility(abilities);
    const ability3 = pickSpecialAbility(abilities);
    const { name, avatar_filename } = pickArchetype(archetypes);

    const {
      data: { publicUrl: avatarUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatar_filename);

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
          avatar_path: avatarUrl.replace(
            Deno.env.get("SUPABASE_URL")!,
            "",
          ),
          name,
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
