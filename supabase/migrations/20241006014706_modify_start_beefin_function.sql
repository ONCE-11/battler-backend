set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.start_beefin(character_id uuid, opponent_id uuid)
 RETURNS SETOF fights
 LANGUAGE plpgsql
AS $function$BEGIN

-- insert new entry into fights table
  RETURN QUERY INSERT INTO fights (player1_id, player2_id, current_turn_player_id)
  VALUES (character_id, opponent_id, character_id)
  RETURNING *;

  -- update both character fighting states to true
  UPDATE characters
  SET fighting = true
  WHERE id = character_id OR id = opponent_id;

  -- return 
  RETURN;

END;$function$
;


