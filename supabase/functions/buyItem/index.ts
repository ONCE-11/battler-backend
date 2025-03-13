import {
  functionResponse,
  preflightResponse,
  supabase,
} from "../_shared/utils.ts";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  try {
    const { characterId, userId, itemId } = await req.json();

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

    return functionResponse({ remainingPesos }, 200);
  } catch (error) {
    let message;

    if (error instanceof Error) {
      console.error(error);
      message = error.message;
    } else {
      message = "Unknown error";
    }
    return functionResponse({ successful: false, error: message }, 500);
  }
});
