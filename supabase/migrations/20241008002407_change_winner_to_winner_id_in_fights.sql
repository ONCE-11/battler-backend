alter table "public"."fights" drop constraint "fights_winner_fkey";

alter table "public"."fights" drop column "winner";

alter table "public"."fights" add column "winner_id" uuid;

alter table "public"."fights" add constraint "fights_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES characters(id) not valid;

alter table "public"."fights" validate constraint "fights_winner_id_fkey";


