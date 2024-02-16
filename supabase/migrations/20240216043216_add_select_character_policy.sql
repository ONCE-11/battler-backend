create policy "Enable select for authenticated users only"
on "public"."characters"
as permissive
for select
to authenticated
using (true);



