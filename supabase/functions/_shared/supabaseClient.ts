import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { Database } from "./supabaseTypes.ts";

export const generateSupabaseClient = () => {
  return createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    // TODO: switch SUPABASE_ANON_KEY here (only for initial work)
    // {
    //   global: {
    //     headers: { Authorization: req.headers.get("Authorization")! },
    //   },
    // }
  );
};
