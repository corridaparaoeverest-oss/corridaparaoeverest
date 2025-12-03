alter table public.registrations
  add column if not exists status_pagamento text not null default 'pendente';
