create table if not exists public.settings (
  key text primary key,
  value boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'settings_select_public'
  ) then
    create policy settings_select_public on public.settings
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'settings_upsert_public'
  ) then
    create policy settings_upsert_public on public.settings
      for insert
      to public
      with check (true);

    create policy settings_update_public on public.settings
      for update
      to public
      using (true)
      with check (true);
  end if;
end $$;
