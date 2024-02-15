create type "public"."item_type" as enum ('attack', 'defense', 'accessory', 'consumable');

create table "public"."abilities" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text not null,
    "metadata" jsonb
);


alter table "public"."abilities" enable row level security;

create table "public"."character_items" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "item_id" uuid not null,
    "character_id" uuid not null
);


alter table "public"."character_items" enable row level security;

create table "public"."characters" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "attack_item_id" uuid,
    "defense_item_id" uuid,
    "accessory_item_id" uuid,
    "consumable_id" uuid,
    "attack" smallint not null,
    "defense" smallint not null,
    "max_health" smallint not null,
    "current_health" smallint not null,
    "user_id" uuid not null,
    "ability_1_id" uuid,
    "ability_2_id" uuid,
    "ability_3_id" uuid
);


alter table "public"."characters" enable row level security;

create table "public"."fights" (
    "created_at" timestamp with time zone not null default now(),
    "player1_id" uuid not null,
    "player2_id" uuid not null,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."fights" enable row level security;

create table "public"."items" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text not null,
    "metadata" jsonb,
    "item_type" item_type not null,
    "price" smallint
);


alter table "public"."items" enable row level security;

alter table "public"."profiles" alter column "first_name" set data type text using "first_name"::text;

alter table "public"."profiles" alter column "last_name" set data type text using "last_name"::text;

CREATE UNIQUE INDEX abilities_pkey ON public.abilities USING btree (id);

CREATE UNIQUE INDEX character_items_pkey ON public.character_items USING btree (id);

CREATE UNIQUE INDEX characters_pkey ON public.characters USING btree (id);

CREATE UNIQUE INDEX fights_pkey ON public.fights USING btree (id);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id);

alter table "public"."abilities" add constraint "abilities_pkey" PRIMARY KEY using index "abilities_pkey";

alter table "public"."character_items" add constraint "character_items_pkey" PRIMARY KEY using index "character_items_pkey";

alter table "public"."characters" add constraint "characters_pkey" PRIMARY KEY using index "characters_pkey";

alter table "public"."fights" add constraint "fights_pkey" PRIMARY KEY using index "fights_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."character_items" add constraint "character_items_character_id_fkey" FOREIGN KEY (character_id) REFERENCES characters(id) not valid;

alter table "public"."character_items" validate constraint "character_items_character_id_fkey";

alter table "public"."character_items" add constraint "character_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) not valid;

alter table "public"."character_items" validate constraint "character_items_item_id_fkey";

alter table "public"."characters" add constraint "characters_ability_1_id_fkey" FOREIGN KEY (ability_1_id) REFERENCES abilities(id) not valid;

alter table "public"."characters" validate constraint "characters_ability_1_id_fkey";

alter table "public"."characters" add constraint "characters_ability_2_id_fkey" FOREIGN KEY (ability_2_id) REFERENCES abilities(id) not valid;

alter table "public"."characters" validate constraint "characters_ability_2_id_fkey";

alter table "public"."characters" add constraint "characters_ability_3_id_fkey" FOREIGN KEY (ability_3_id) REFERENCES abilities(id) not valid;

alter table "public"."characters" validate constraint "characters_ability_3_id_fkey";

alter table "public"."characters" add constraint "characters_accessory_item_id_fkey" FOREIGN KEY (accessory_item_id) REFERENCES items(id) not valid;

alter table "public"."characters" validate constraint "characters_accessory_item_id_fkey";

alter table "public"."characters" add constraint "characters_attack_item_id_fkey" FOREIGN KEY (attack_item_id) REFERENCES items(id) not valid;

alter table "public"."characters" validate constraint "characters_attack_item_id_fkey";

alter table "public"."characters" add constraint "characters_consumable_id_fkey" FOREIGN KEY (consumable_id) REFERENCES items(id) not valid;

alter table "public"."characters" validate constraint "characters_consumable_id_fkey";

alter table "public"."characters" add constraint "characters_defense_item_id_fkey" FOREIGN KEY (defense_item_id) REFERENCES items(id) not valid;

alter table "public"."characters" validate constraint "characters_defense_item_id_fkey";

alter table "public"."characters" add constraint "characters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."characters" validate constraint "characters_user_id_fkey";

alter table "public"."fights" add constraint "fights_player1_id_fkey" FOREIGN KEY (player1_id) REFERENCES characters(id) not valid;

alter table "public"."fights" validate constraint "fights_player1_id_fkey";

alter table "public"."fights" add constraint "fights_player2_id_fkey" FOREIGN KEY (player2_id) REFERENCES characters(id) not valid;

alter table "public"."fights" validate constraint "fights_player2_id_fkey";

grant delete on table "public"."abilities" to "anon";

grant insert on table "public"."abilities" to "anon";

grant references on table "public"."abilities" to "anon";

grant select on table "public"."abilities" to "anon";

grant trigger on table "public"."abilities" to "anon";

grant truncate on table "public"."abilities" to "anon";

grant update on table "public"."abilities" to "anon";

grant delete on table "public"."abilities" to "authenticated";

grant insert on table "public"."abilities" to "authenticated";

grant references on table "public"."abilities" to "authenticated";

grant select on table "public"."abilities" to "authenticated";

grant trigger on table "public"."abilities" to "authenticated";

grant truncate on table "public"."abilities" to "authenticated";

grant update on table "public"."abilities" to "authenticated";

grant delete on table "public"."abilities" to "service_role";

grant insert on table "public"."abilities" to "service_role";

grant references on table "public"."abilities" to "service_role";

grant select on table "public"."abilities" to "service_role";

grant trigger on table "public"."abilities" to "service_role";

grant truncate on table "public"."abilities" to "service_role";

grant update on table "public"."abilities" to "service_role";

grant delete on table "public"."character_items" to "anon";

grant insert on table "public"."character_items" to "anon";

grant references on table "public"."character_items" to "anon";

grant select on table "public"."character_items" to "anon";

grant trigger on table "public"."character_items" to "anon";

grant truncate on table "public"."character_items" to "anon";

grant update on table "public"."character_items" to "anon";

grant delete on table "public"."character_items" to "authenticated";

grant insert on table "public"."character_items" to "authenticated";

grant references on table "public"."character_items" to "authenticated";

grant select on table "public"."character_items" to "authenticated";

grant trigger on table "public"."character_items" to "authenticated";

grant truncate on table "public"."character_items" to "authenticated";

grant update on table "public"."character_items" to "authenticated";

grant delete on table "public"."character_items" to "service_role";

grant insert on table "public"."character_items" to "service_role";

grant references on table "public"."character_items" to "service_role";

grant select on table "public"."character_items" to "service_role";

grant trigger on table "public"."character_items" to "service_role";

grant truncate on table "public"."character_items" to "service_role";

grant update on table "public"."character_items" to "service_role";

grant delete on table "public"."characters" to "anon";

grant insert on table "public"."characters" to "anon";

grant references on table "public"."characters" to "anon";

grant select on table "public"."characters" to "anon";

grant trigger on table "public"."characters" to "anon";

grant truncate on table "public"."characters" to "anon";

grant update on table "public"."characters" to "anon";

grant delete on table "public"."characters" to "authenticated";

grant insert on table "public"."characters" to "authenticated";

grant references on table "public"."characters" to "authenticated";

grant select on table "public"."characters" to "authenticated";

grant trigger on table "public"."characters" to "authenticated";

grant truncate on table "public"."characters" to "authenticated";

grant update on table "public"."characters" to "authenticated";

grant delete on table "public"."characters" to "service_role";

grant insert on table "public"."characters" to "service_role";

grant references on table "public"."characters" to "service_role";

grant select on table "public"."characters" to "service_role";

grant trigger on table "public"."characters" to "service_role";

grant truncate on table "public"."characters" to "service_role";

grant update on table "public"."characters" to "service_role";

grant delete on table "public"."fights" to "anon";

grant insert on table "public"."fights" to "anon";

grant references on table "public"."fights" to "anon";

grant select on table "public"."fights" to "anon";

grant trigger on table "public"."fights" to "anon";

grant truncate on table "public"."fights" to "anon";

grant update on table "public"."fights" to "anon";

grant delete on table "public"."fights" to "authenticated";

grant insert on table "public"."fights" to "authenticated";

grant references on table "public"."fights" to "authenticated";

grant select on table "public"."fights" to "authenticated";

grant trigger on table "public"."fights" to "authenticated";

grant truncate on table "public"."fights" to "authenticated";

grant update on table "public"."fights" to "authenticated";

grant delete on table "public"."fights" to "service_role";

grant insert on table "public"."fights" to "service_role";

grant references on table "public"."fights" to "service_role";

grant select on table "public"."fights" to "service_role";

grant trigger on table "public"."fights" to "service_role";

grant truncate on table "public"."fights" to "service_role";

grant update on table "public"."fights" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

create policy "Enable select for authenticated users only"
on "public"."items"
as permissive
for select
to authenticated
using (true);



