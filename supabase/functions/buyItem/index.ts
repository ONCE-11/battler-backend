import { corsHeaders } from "../_shared/cors.ts";
import { generateSupabaseClient } from "../_shared/supabase.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// import { supabase } from "../../../src/utilities.ts";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, itemId } = await req.json();

    // const request = new Request("https://pokeapi.co/api/v2/pokemon/ditto", {
    //   method: "GET",
    //   // body: JSON.stringify({
    //   //   message: "Hello world!",
    //   // }),
    //   // headers: {
    //   //   "content-type": "application/json",
    //   // },
    // });

    // const response = await fetch("http://127.0.0.1:54321/rest/v1/profiles", {
    //   headers: {
    //     accept: "application/json",
    //   },
    // });

    // const body = await response.json();

    // console.log({ body });

    // return new Response(JSON.stringify(body), {
    //   headers: { ...corsHeaders, "Content-Type": "application/json" },
    //   status: 200,
    // });

    console.log({
      url: Deno.env.get("SUPABASE_URL"),
      key: Deno.env.get("SUPABASE_ANON_KEY"),
    });
    // console.log({ userId, itemId });
    // console.log({ Authorization: req.headers.get("Authorization") });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // console.log(supabase);

    const response = await supabase.from("abilities").select("*");
    // const profilesResponse = await supabase.from("profiles").select();
    // .eq("user_id", userId)
    // .single();

    // const itemsResponse = await supabase.from("items").select();
    // .eq("id", itemId)
    // .single();

    // console.log({ response });

    if (response.error) {
      console.error(response.error);
      throw response.error;
    }

    // if (profilesResponse.error) {
    //   console.error(profilesResponse.error);
    //   throw profilesResponse.error;
    // }

    // const { error } = await supabase
    //   .from("profiles")
    //   .update({ pesos: pesos - 100 })
    //   .eq("user_id", currentUser.id);

    // console.log({ error });

    const data = {
      message: `Hellorrrr!`,
    };

    return new Response(JSON.stringify(response.data), {
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
