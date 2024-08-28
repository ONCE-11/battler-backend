create type "public"."action_type" as enum ('ability', 'item');

alter table "public"."names" drop constraint "names_pkey";

drop index if exists "public"."names_pkey";

create table "public"."actions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "initiator" uuid not null,
    "metadata" json not null default '{}'::json,
    "type" action_type not null
);


alter table "public"."actions" enable row level security;

alter table "public"."abilities" alter column "metadata" set default '{}'::jsonb;

alter table "public"."names" alter column "suffix" set not null;

CREATE UNIQUE INDEX actions_pkey ON public.actions USING btree (id, initiator);

CREATE UNIQUE INDEX names_pkey ON public.names USING btree (id);

alter table "public"."actions" add constraint "actions_pkey" PRIMARY KEY using index "actions_pkey";

alter table "public"."names" add constraint "names_pkey" PRIMARY KEY using index "names_pkey";

alter table "public"."actions" add constraint "actions_initiator_fkey" FOREIGN KEY (initiator) REFERENCES characters(id) not valid;

alter table "public"."actions" validate constraint "actions_initiator_fkey";

grant delete on table "public"."actions" to "anon";

grant insert on table "public"."actions" to "anon";

grant references on table "public"."actions" to "anon";

grant select on table "public"."actions" to "anon";

grant trigger on table "public"."actions" to "anon";

grant truncate on table "public"."actions" to "anon";

grant update on table "public"."actions" to "anon";

grant delete on table "public"."actions" to "authenticated";

grant insert on table "public"."actions" to "authenticated";

grant references on table "public"."actions" to "authenticated";

grant select on table "public"."actions" to "authenticated";

grant trigger on table "public"."actions" to "authenticated";

grant truncate on table "public"."actions" to "authenticated";

grant update on table "public"."actions" to "authenticated";

grant delete on table "public"."actions" to "service_role";

grant insert on table "public"."actions" to "service_role";

grant references on table "public"."actions" to "service_role";

grant select on table "public"."actions" to "service_role";

grant trigger on table "public"."actions" to "service_role";

grant truncate on table "public"."actions" to "service_role";

grant update on table "public"."actions" to "service_role";

create policy "Enable read access for authenticated users"
on "public"."actions"
as permissive
for select
to authenticated
using (true);



