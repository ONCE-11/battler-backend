import { Database } from "./supabaseTypes.ts";
import { createClient } from "supabase";

export const generateSupabaseClient = () => {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    // TODO: switch SUPABASE_ANON_KEY here (only for initial work)
    // {
    //   global: {
    //     headers: { Authorization: req.headers.get("Authorization")! },
    //   },
    // }
  );
};
