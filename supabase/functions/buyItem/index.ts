import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { Database } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { characterId, userId, itemId } = await req.json();

    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      // TODO: switch SUPABASE_ANON_KEY here (only for initial work)
      // {
      //   global: {
      //     headers: { Authorization: req.headers.get("Authorization")! },
      //   },
      // }
    );

    // load our most current data
    const { data: itemsData, error: itemsError } = await supabase
      .from("items")
      .select("price")
      .eq("id", itemId)
      .single();

    if (itemsError) throw itemsError;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select()
      .eq("user_id", userId)
      .single();

    if (profileError) throw profileError;

    // check to see if character has enough pesos
    const remainingPesos = profileData.pesos - itemsData.price;

    if (remainingPesos >= 0) {
      remainingPesos;

      const { error } = await supabase
        .from("profiles")
        .update({
          pesos: remainingPesos,
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      throw Error("Character does not have enough pesos");
    }

    const { error: inventoryUpdateError } = await supabase
      .from("inventories")
      .insert([
        {
          item_id: itemId,
          character_id: characterId,
        },
      ]);

    if (inventoryUpdateError) throw inventoryUpdateError;

    const data = {};

    return new Response(JSON.stringify(data), {
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
