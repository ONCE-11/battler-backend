revoke delete on table "public"."names" from "anon";

revoke insert on table "public"."names" from "anon";

revoke references on table "public"."names" from "anon";

revoke select on table "public"."names" from "anon";

revoke trigger on table "public"."names" from "anon";

revoke truncate on table "public"."names" from "anon";

revoke update on table "public"."names" from "anon";

revoke delete on table "public"."names" from "authenticated";

revoke insert on table "public"."names" from "authenticated";

revoke references on table "public"."names" from "authenticated";

revoke select on table "public"."names" from "authenticated";

revoke trigger on table "public"."names" from "authenticated";

revoke truncate on table "public"."names" from "authenticated";

revoke update on table "public"."names" from "authenticated";

revoke delete on table "public"."names" from "service_role";

revoke insert on table "public"."names" from "service_role";

revoke references on table "public"."names" from "service_role";

revoke select on table "public"."names" from "service_role";

revoke trigger on table "public"."names" from "service_role";

revoke truncate on table "public"."names" from "service_role";

revoke update on table "public"."names" from "service_role";

alter table "public"."names" drop constraint "names_id_key";

alter table "public"."names" drop constraint "names_pkey";

drop index if exists "public"."names_id_key";

drop index if exists "public"."names_pkey";

drop table "public"."names";

create table "public"."archetypes" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "prefix" text not null,
    "suffix" text not null default ''::text
);


alter table "public"."archetypes" enable row level security;

CREATE UNIQUE INDEX names_id_key ON public.archetypes USING btree (id);

CREATE UNIQUE INDEX names_pkey ON public.archetypes USING btree (id);

alter table "public"."archetypes" add constraint "names_pkey" PRIMARY KEY using index "names_pkey";

alter table "public"."archetypes" add constraint "names_id_key" UNIQUE using index "names_id_key";

grant delete on table "public"."archetypes" to "anon";

grant insert on table "public"."archetypes" to "anon";

grant references on table "public"."archetypes" to "anon";

grant select on table "public"."archetypes" to "anon";

grant trigger on table "public"."archetypes" to "anon";

grant truncate on table "public"."archetypes" to "anon";

grant update on table "public"."archetypes" to "anon";

grant delete on table "public"."archetypes" to "authenticated";

grant insert on table "public"."archetypes" to "authenticated";

grant references on table "public"."archetypes" to "authenticated";

grant select on table "public"."archetypes" to "authenticated";

grant trigger on table "public"."archetypes" to "authenticated";

grant truncate on table "public"."archetypes" to "authenticated";

grant update on table "public"."archetypes" to "authenticated";

grant delete on table "public"."archetypes" to "service_role";

grant insert on table "public"."archetypes" to "service_role";

grant references on table "public"."archetypes" to "service_role";

grant select on table "public"."archetypes" to "service_role";

grant trigger on table "public"."archetypes" to "service_role";

grant truncate on table "public"."archetypes" to "service_role";

grant update on table "public"."archetypes" to "service_role";


