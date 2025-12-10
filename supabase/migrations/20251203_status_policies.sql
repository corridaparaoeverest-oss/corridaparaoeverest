alter table public.registrations
  add column if not exists status_pagamento text not null default 'pendente';

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

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_delete_public'
  ) then
    create policy registrations_delete_public on public.registrations
      for delete
      to public
      using (true);
  end if;
end $$;
