alter table "public"."characters" add column "fighting" boolean not null default false;

alter table "public"."fights" alter column "winner" set data type uuid using "winner"::uuid;

drop type "public"."player_slot";

alter table "public"."fights" add constraint "fights_winner_fkey" FOREIGN KEY (winner) REFERENCES characters(id) not valid;

alter table "public"."fights" validate constraint "fights_winner_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.start_beefin(character_id uuid, opponent_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN

-- insert new entry into fights table
INSERT INTO fights (player1_id, player2_id)
VALUES (character_id, opponent_id);

-- update both character fighting states to true
UPDATE characters c
SET fighting = true 
where 
  id = character_id OR
  id = opponent_id;

END;$function$
;

create policy "Enable update for authenticated users only"
on "public"."characters"
as permissive
for update
to authenticated
using (true);



