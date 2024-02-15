import { createClient } from "https://esm.sh/@supabase/supabase-js";

export const generateSupabaseClient = (authorizationHeaders: string) => {
  console.log({
    DENO_SUPABASE_URL: Deno.env.get("DENO_SUPABASE_URL"),
    DENO_SUPABASE_SERVICE_ROLE_KEY: Deno.env.get(
      "DENO_SUPABASE_SERVICE_ROLE_KEY"
    ),
  });

  return createClient(
    Deno.env.get("DENO_SUPABASE_URL") ?? "",
    Deno.env.get("DENO_SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: { headers: { Authorization: authorizationHeaders } },
    }
  );
};
