import { Database } from "./supabaseTypes.ts";
import { createClient, PostgrestError } from "supabase";

const allowedHeaders = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
];

// for local tunneling using ngrok
if (Deno.env.get("DENO_ENV") === "development") {
  allowedHeaders.push("ngrok-skip-browser-warning");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": allowedHeaders.join(", "),
};

export const supabase = createClient<Database>(
  // TODO: switch SUPABASE_ANON_KEY here (only for initial work)
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

export const preflightResponse = () => {
  return new Response("ok", { headers: corsHeaders });
};

export const functionResponse = (response: object, status: number) => {
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: status,
  });
};

export function createPGError(error: PostgrestError): Error {
  return new Error(error.message, {
    cause: JSON.stringify(error),
  });
}
