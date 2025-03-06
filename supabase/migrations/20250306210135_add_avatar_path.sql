alter table "public"."characters" add column "avatar_path" text not null;

CREATE UNIQUE INDEX names_id_key ON public.names USING btree (id);

alter table "public"."names" add constraint "names_id_key" UNIQUE using index "names_id_key";


