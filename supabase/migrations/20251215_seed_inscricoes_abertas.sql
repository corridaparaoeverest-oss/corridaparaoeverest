insert into public.settings (key, value, updated_at)
values ('inscricoes_abertas', true, now())
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();
