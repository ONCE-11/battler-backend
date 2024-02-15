drop policy "Enable read access for all users" on "public"."profiles";

revoke delete on table "public"."character_items" from "anon";

revoke insert on table "public"."character_items" from "anon";

revoke references on table "public"."character_items" from "anon";

revoke select on table "public"."character_items" from "anon";

revoke trigger on table "public"."character_items" from "anon";

revoke truncate on table "public"."character_items" from "anon";

revoke update on table "public"."character_items" from "anon";

revoke delete on table "public"."character_items" from "authenticated";

revoke insert on table "public"."character_items" from "authenticated";

revoke references on table "public"."character_items" from "authenticated";

revoke select on table "public"."character_items" from "authenticated";

revoke trigger on table "public"."character_items" from "authenticated";

revoke truncate on table "public"."character_items" from "authenticated";

revoke update on table "public"."character_items" from "authenticated";

revoke delete on table "public"."character_items" from "service_role";

revoke insert on table "public"."character_items" from "service_role";

revoke references on table "public"."character_items" from "service_role";

revoke select on table "public"."character_items" from "service_role";

revoke trigger on table "public"."character_items" from "service_role";

revoke truncate on table "public"."character_items" from "service_role";

revoke update on table "public"."character_items" from "service_role";

alter table "public"."character_items" drop constraint "character_items_character_id_fkey";

alter table "public"."character_items" drop constraint "character_items_item_id_fkey";

alter table "public"."character_items" drop constraint "character_items_pkey";

drop index if exists "public"."character_items_pkey";

drop table "public"."character_items";

create table "public"."inventories" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "item_id" uuid not null,
    "character_id" uuid not null
);


alter table "public"."inventories" enable row level security;

alter table "public"."items" alter column "price" set default '0'::smallint;

alter table "public"."items" alter column "price" set not null;

alter table "public"."profiles" add column "pesos" smallint not null default '0'::smallint;

CREATE UNIQUE INDEX character_items_pkey ON public.inventories USING btree (id);

alter table "public"."inventories" add constraint "character_items_pkey" PRIMARY KEY using index "character_items_pkey";

alter table "public"."inventories" add constraint "inventories_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) not valid;

alter table "public"."inventories" validate constraint "inventories_character_id_fkey";

alter table "public"."inventories" add constraint "inventories_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) not valid;

alter table "public"."inventories" validate constraint "inventories_item_id_fkey";

grant delete on table "public"."inventories" to "anon";

grant insert on table "public"."inventories" to "anon";

grant references on table "public"."inventories" to "anon";

grant select on table "public"."inventories" to "anon";

grant trigger on table "public"."inventories" to "anon";

grant truncate on table "public"."inventories" to "anon";

grant update on table "public"."inventories" to "anon";

grant delete on table "public"."inventories" to "authenticated";

grant insert on table "public"."inventories" to "authenticated";

grant references on table "public"."inventories" to "authenticated";

grant select on table "public"."inventories" to "authenticated";

grant trigger on table "public"."inventories" to "authenticated";

grant truncate on table "public"."inventories" to "authenticated";

grant update on table "public"."inventories" to "authenticated";

grant delete on table "public"."inventories" to "service_role";

grant insert on table "public"."inventories" to "service_role";

grant references on table "public"."inventories" to "service_role";

grant select on table "public"."inventories" to "service_role";

grant trigger on table "public"."inventories" to "service_role";

grant truncate on table "public"."inventories" to "service_role";

grant update on table "public"."inventories" to "service_role";

create policy "Enable select for authenticated users only"
on "public"."abilities"
as permissive
for select
to authenticated
using (true);


create policy "Enable select access for authenticated users"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);



