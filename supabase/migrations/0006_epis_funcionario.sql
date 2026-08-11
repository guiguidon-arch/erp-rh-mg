-- Controle de EPIs entregues por funcionário
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

create table epis_funcionario (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  tipo_epi text not null,
  quantidade integer not null default 1,
  numero_ca text,
  fabricante text,
  data_entrega date not null default current_date,
  data_devolucao date,
  created_at timestamptz not null default now()
);

create index epis_funcionario_funcionario_id_idx on epis_funcionario(funcionario_id);

alter table epis_funcionario enable row level security;

create policy "Usuários autenticados podem ver EPIs"
  on epis_funcionario for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar EPIs"
  on epis_funcionario for all
  to authenticated
  using (true)
  with check (true);
