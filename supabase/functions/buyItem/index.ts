import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "supabase";
import { Database } from "../_shared/supabaseTypes.ts";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { characterId, userId, itemId } = await req.json();

    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      // TODO: switch to SUPABASE_ANON_KEY here (only for initial work)
      // {
      //   global: {
      //     headers: { Authorization: req.headers.get("Authorization")! },
      //   },
      // }
    );

    // load our most current data
    const [
      { data: itemsData, error: itemsError },
      { data: profileData, error: profileError },
    ] = await Promise.all([
      supabase.from("items").select("price").eq("id", itemId).single(),
      supabase.from("profiles").select().eq("user_id", userId).single(),
    ]);

    console.log({
      itemsData,
      itemsError,
      profileData,
      profileError,
    });

    if (itemsError) throw itemsError;
    if (profileError) throw profileError;

    // check to see if character has enough pesos
    const remainingPesos = profileData!.pesos - itemsData!.price;

    if (remainingPesos < 0) {
      throw Error(`Character ${characterId} does not have enough pesos`);
    }

    const [{ error: profileUpdateError }, { error: inventoryUpdateError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .update({
            pesos: remainingPesos,
          })
          .eq("user_id", userId),
        supabase.from("inventories").insert([
          {
            item_id: itemId,
            character_id: characterId,
          },
        ]),
      ]);

    if (profileUpdateError) throw profileUpdateError;
    if (inventoryUpdateError) throw inventoryUpdateError;

    return new Response(JSON.stringify({ remainingPesos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
