alter table "public"."archetypes" drop column "prefix";

alter table "public"."archetypes" add column "name" text not null;


