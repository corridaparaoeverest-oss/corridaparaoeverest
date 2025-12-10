-- Add columns 'sexo' and 'tempo' to public.registrations
-- 'sexo' as text (e.g., 'M' or 'F'); 'tempo' as integer (seconds)

alter table if exists public.registrations
  add column if not exists sexo text,
  add column if not exists tempo integer;

comment on column public.registrations.sexo is 'Sexo do atleta (ex.: M/F)';
comment on column public.registrations.tempo is 'Tempo total em segundos';