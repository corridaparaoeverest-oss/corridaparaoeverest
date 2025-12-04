do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_delete_public'
  ) then
    create policy registrations_delete_public on public.registrations
      for delete
      to public
      using (true);
  end if;
end $$;
