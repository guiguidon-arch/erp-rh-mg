-- Cadastro de prestadores de serviço (CNPJ) e contratos de empreitada
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

create table prestadores (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  cnpj text not null unique,
  responsavel_nome text,
  endereco text,
  telefone text,
  email text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger prestadores_set_updated_at
  before update on prestadores
  for each row execute function set_updated_at();

alter table prestadores enable row level security;

create policy "Usuários autenticados podem ver prestadores"
  on prestadores for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar prestadores"
  on prestadores for all
  to authenticated
  using (true)
  with check (true);

create table contratos_prestador (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references prestadores(id) on delete cascade,
  obra_id uuid references obras(id) on delete set null,
  escopo_servico text not null,
  valor_total numeric(12, 2),
  forma_pagamento text,
  prazo_dias integer,
  data_inicio date,
  local_assinatura text,
  data_assinatura date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contratos_prestador_prestador_id_idx on contratos_prestador(prestador_id);

create trigger contratos_prestador_set_updated_at
  before update on contratos_prestador
  for each row execute function set_updated_at();

alter table contratos_prestador enable row level security;

create policy "Usuários autenticados podem ver contratos de prestador"
  on contratos_prestador for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar contratos de prestador"
  on contratos_prestador for all
  to authenticated
  using (true)
  with check (true);
