create type "public"."ability_type" as enum ('weak', 'strong', 'special');

alter table "public"."abilities" add column "type" ability_type not null;


