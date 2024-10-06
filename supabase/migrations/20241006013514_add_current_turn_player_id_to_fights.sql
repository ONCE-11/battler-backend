alter table "public"."fights" add column "current_turn_player_id" uuid;

alter table "public"."fights" add constraint "fights_current_turn_player_id_fkey" FOREIGN KEY (current_turn_player_id) REFERENCES characters(id) not valid;

alter table "public"."fights" validate constraint "fights_current_turn_player_id_fkey";


