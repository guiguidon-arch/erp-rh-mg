-- Módulo de funcionários: obras, funcionários, dependentes e histórico de alterações
-- Execute este arquivo inteiro no Supabase: Dashboard > SQL Editor > New query > colar > Run

-- Função auxiliar para manter "updated_at" sempre atualizado
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- OBRAS (canteiros de obra / projetos)
-- ============================================================
create table obras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text,
  status text not null default 'ativa' check (status in ('ativa', 'pausada', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger obras_set_updated_at
  before update on obras
  for each row execute function set_updated_at();

alter table obras enable row level security;

create policy "Usuários autenticados podem ver obras"
  on obras for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar obras"
  on obras for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- FUNCIONÁRIOS
-- ============================================================
create table funcionarios (
  id uuid primary key default gen_random_uuid(),

  -- Dados pessoais
  nome text not null,
  cpf text not null unique,
  rg text,
  data_nascimento date,
  endereco text,
  telefone text,
  email text,

  -- Dados contratuais
  cargo text,
  departamento text,
  salario numeric(12, 2),
  data_admissao date,
  tipo_contrato text check (tipo_contrato in ('CLT', 'PJ', 'Estágio', 'Temporário')),
  jornada text,
  obra_id uuid references obras(id) on delete set null,

  -- Status
  status text not null default 'ativo' check (status in ('ativo', 'afastado', 'ferias', 'desligado')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index funcionarios_obra_id_idx on funcionarios(obra_id);
create index funcionarios_status_idx on funcionarios(status);

create trigger funcionarios_set_updated_at
  before update on funcionarios
  for each row execute function set_updated_at();

alter table funcionarios enable row level security;

create policy "Usuários autenticados podem ver funcionários"
  on funcionarios for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar funcionários"
  on funcionarios for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- DEPENDENTES
-- ============================================================
create table dependentes (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  nome text not null,
  data_nascimento date,
  parentesco text,
  created_at timestamptz not null default now()
);

create index dependentes_funcionario_id_idx on dependentes(funcionario_id);

alter table dependentes enable row level security;

create policy "Usuários autenticados podem ver dependentes"
  on dependentes for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar dependentes"
  on dependentes for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- HISTÓRICO DE ALTERAÇÕES (promoções, reajustes, mudança de obra/status)
-- ============================================================
create table historico_funcionario (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  tipo text not null check (tipo in ('promocao', 'reajuste_salarial', 'mudanca_obra', 'mudanca_status', 'outro')),
  campo text,
  valor_anterior text,
  valor_novo text,
  data date not null default current_date,
  observacao text,
  criado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index historico_funcionario_funcionario_id_idx on historico_funcionario(funcionario_id);

alter table historico_funcionario enable row level security;

create policy "Usuários autenticados podem ver histórico"
  on historico_funcionario for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar histórico"
  on historico_funcionario for all
  to authenticated
  using (true)
  with check (true);
