-- Documentos anexados por funcionário (upload) + registro de acesso
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

create table documentos_funcionario (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  categoria text not null check (categoria in (
    'contrato', 'rg_cpf', 'atestado', 'comprovante', 'aso', 'cnh',
    'ficha_registro', 'contrato_experiencia', 'contrato_prestacao_servicos', 'ficha_epi', 'outro'
  )),
  nome_arquivo text not null,
  storage_path text not null,
  data_vencimento date,
  enviado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index documentos_funcionario_funcionario_id_idx on documentos_funcionario(funcionario_id);

alter table documentos_funcionario enable row level security;

create policy "Usuários autenticados podem ver documentos"
  on documentos_funcionario for select
  to authenticated
  using (true);

create policy "Usuários autenticados podem gerenciar documentos"
  on documentos_funcionario for all
  to authenticated
  using (true)
  with check (true);

-- Bucket de Storage para os arquivos (privado — sem acesso público)
insert into storage.buckets (id, name, public)
values ('documentos-funcionarios', 'documentos-funcionarios', false)
on conflict (id) do nothing;

-- Só usuários autenticados podem ler/enviar/apagar arquivos deste bucket
create policy "Usuários autenticados podem ler arquivos de funcionários"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos-funcionarios');

create policy "Usuários autenticados podem enviar arquivos de funcionários"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos-funcionarios');

create policy "Usuários autenticados podem apagar arquivos de funcionários"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documentos-funcionarios');
