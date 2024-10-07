import { Database } from "./supabaseTypes.ts";
import { createClient, PostgrestError } from "supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const supabase = createClient<Database>(
  // TODO: switch SUPABASE_ANON_KEY here (only for initial work)
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

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

export const preflightResponse = () => {
  return new Response("ok", { headers: corsHeaders });
};

export const functionResponse = (response: object, status: number) => {
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: status,
  });
};

export function createPGError(error: PostgrestError): void {
  throw new Error(error.message, {
    cause: JSON.stringify(error),
  });
}
