create table
  public.profiles (
    id uuid not null default gen_random_uuid (),
    first_name character varying null,
    last_name character varying null,
    user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint profiles_pkey primary key (id),
    constraint profiles_user_id_fkey foreign key (user_id) references auth.users (id) on update cascade on delete cascade
  ) tablespace pg_default;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO public
USING (true);