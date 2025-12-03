create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  email text not null,
  telefone text not null,
  quer_camisa boolean not null default false,
  tamanho_camisa text null
);

alter table public.registrations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_select_public'
  ) then
    create policy registrations_select_public on public.registrations
      for select
      to public
      using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'registrations' and policyname = 'registrations_insert_public'
  ) then
    create policy registrations_insert_public on public.registrations
      for insert
      to public
      with check (true);
  end if;
end $$;

create index if not exists registrations_created_at_idx on public.registrations(created_at desc);
