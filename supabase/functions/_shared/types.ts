import { Tables } from "./supabaseTypes.ts";

type Metadata = {
  metadata: {
    attack?: number;
    defense?: number;
    health?: number;
    miss?: number;
  };
};

export type AbilityWithMetadata = Tables<"abilities"> & Metadata;

export type CharacterWithAbilities = Tables<"characters"> & {
  ability1: AbilityWithMetadata;
  ability2: AbilityWithMetadata;
  ability3: AbilityWithMetadata;
};
