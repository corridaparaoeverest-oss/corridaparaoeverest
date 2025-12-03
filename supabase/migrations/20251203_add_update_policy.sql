do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_update_public'
  ) then
    create policy registrations_update_public on public.registrations
      for update
      to public
      using (true)
      with check (true);
  end if;
end $$;
