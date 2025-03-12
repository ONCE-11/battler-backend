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

type ArchetypeWithAbilities = Tables<"archetypes"> & {
  weak_ability: AbilityWithMetadata;
  strong_ability: AbilityWithMetadata;
  special_ability: AbilityWithMetadata;
};

function generateRandomValue(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickArchetype(
  archetypes: ArchetypeWithAbilities[],
): ArchetypeWithAbilities {
  return archetypes[generateRandomValue(0, archetypes.length - 1)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  try {
    const { userId } = await req.json();

    const [
      { count: charactersCount, error: charactersCountError },
      { data: archetypes, error: archetypesError },
    ] = await Promise.all([
      supabase
        .from("characters")
        .select("*", { count: "exact", head: true })
        .eq("alive", true)
        .eq("user_id", userId),
      supabase.from("archetypes").select(
        "*, weak_ability:weak_ability_id(*), strong_ability:strong_ability_id(*), special_ability:special_ability_id(*)",
      ).returns<ArchetypeWithAbilities[]>(),
    ]);

    if (charactersCountError) throw charactersCountError;
    if (archetypesError) throw archetypesError;

    if (charactersCount! > 0) {
      throw Error("You cannot have more than one character alive");
    }

    const {
      name,
      avatar_filename,
      strength,
      defense,
      health,
      weak_ability_id,
      strong_ability_id,
      special_ability_id,
      weak_ability,
      strong_ability,
      special_ability,
    } = pickArchetype(archetypes);

    const {
      data: { publicUrl: avatarUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatar_filename);

    const { data: newCharacterData, error: characterInsertError } =
      await supabase
        .from("characters")
        .insert({
          attack: strength,
          defense: defense,
          max_health: health,
          current_health: health,
          user_id: userId,
          ability_1_id: weak_ability_id,
          ability_2_id: strong_ability_id,
          ability_3_id: special_ability_id,
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

    console.log(newCharacterData);

    if (characterInsertError) throw characterInsertError;

    const response: CharacterWithAbilities = {
      ...newCharacterData,
      ability1: weak_ability,
      ability2: strong_ability,
      ability3: special_ability,
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
