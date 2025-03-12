alter table "public"."archetypes" add column "agility" smallint not null;

alter table "public"."archetypes" add column "defense" smallint not null;

alter table "public"."archetypes" add column "health" smallint not null;

alter table "public"."archetypes" add column "mental" smallint not null;

alter table "public"."archetypes" add column "special_ability_id" uuid not null;

alter table "public"."archetypes" add column "strength" smallint not null;

alter table "public"."archetypes" add column "strong_ability_id" uuid not null;

alter table "public"."archetypes" add column "weak_ability_id" uuid not null;

alter table "public"."archetypes" add constraint "archetypes_special_ability_fkey" FOREIGN KEY (special_ability_id) REFERENCES abilities(id) not valid;

alter table "public"."archetypes" validate constraint "archetypes_special_ability_fkey";

alter table "public"."archetypes" add constraint "archetypes_strong_ability_fkey" FOREIGN KEY (strong_ability_id) REFERENCES abilities(id) not valid;

alter table "public"."archetypes" validate constraint "archetypes_strong_ability_fkey";

alter table "public"."archetypes" add constraint "archetypes_weak_ability_fkey" FOREIGN KEY (weak_ability_id) REFERENCES abilities(id) not valid;

alter table "public"."archetypes" validate constraint "archetypes_weak_ability_fkey";


