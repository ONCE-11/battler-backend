alter table "public"."abilities" alter column "metadata" set not null;

create policy "Enable read access for all users"
on "public"."fights"
as permissive
for select
to authenticated
using (true);



