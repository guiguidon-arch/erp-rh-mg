-- Histórico de documentos enviados para assinatura eletrônica (Autentique)
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

create table envios_assinatura (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid references funcionarios(id) on delete cascade,
  prestador_id uuid references prestadores(id) on delete cascade,
  contrato_prestador_id uuid references contratos_prestador(id) on delete cascade,
  tipo_documento text not null check (tipo_documento in (
    'ficha_registro', 'contrato_experiencia', 'contrato_prestacao', 'ficha_epi'
  )),
  autentique_document_id text not null,
  status text not null default 'enviado' check (status in ('enviado', 'assinado', 'rejeitado')),
  link_documento text,
  enviado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint envio_tem_um_dono check (
    (funcionario_id is not null and prestador_id is null) or
    (funcionario_id is null and prestador_id is not null)
  )
);

create index envios_assinatura_funcionario_id_idx on envios_assinatura(funcionario_id);
create index envios_assinatura_prestador_id_idx on envios_assinatura(prestador_id);

create trigger envios_assinatura_set_updated_at
  before update on envios_assinatura
  for each row execute function set_updated_at();

alter table envios_assinatura enable row level security;

create policy "Usuários autenticados podem ver envios de assinatura"
  on envios_assinatura for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar envios de assinatura"
  on envios_assinatura for all
  to authenticated
  using (true)
  with check (true);
