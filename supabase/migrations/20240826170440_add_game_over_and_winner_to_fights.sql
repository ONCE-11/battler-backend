create type "public"."player_slot" as enum ('1', '2');

alter table "public"."fights" add column "game_over" boolean not null default false;

alter table "public"."fights" add column "winner" player_slot;


