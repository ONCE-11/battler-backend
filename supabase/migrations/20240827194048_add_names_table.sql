create table "public"."names" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "prefix" text not null,
    "suffix" text default ''::text
);


alter table "public"."names" enable row level security;

CREATE UNIQUE INDEX names_pkey ON public.names USING btree (id, prefix);

alter table "public"."names" add constraint "names_pkey" PRIMARY KEY using index "names_pkey";

grant delete on table "public"."names" to "anon";

grant insert on table "public"."names" to "anon";

grant references on table "public"."names" to "anon";

grant select on table "public"."names" to "anon";

grant trigger on table "public"."names" to "anon";

grant truncate on table "public"."names" to "anon";

grant update on table "public"."names" to "anon";

grant delete on table "public"."names" to "authenticated";

grant insert on table "public"."names" to "authenticated";

grant references on table "public"."names" to "authenticated";

grant select on table "public"."names" to "authenticated";

grant trigger on table "public"."names" to "authenticated";

grant truncate on table "public"."names" to "authenticated";

grant update on table "public"."names" to "authenticated";

grant delete on table "public"."names" to "service_role";

grant insert on table "public"."names" to "service_role";

grant references on table "public"."names" to "service_role";

grant select on table "public"."names" to "service_role";

grant trigger on table "public"."names" to "service_role";

grant truncate on table "public"."names" to "service_role";

grant update on table "public"."names" to "service_role";


