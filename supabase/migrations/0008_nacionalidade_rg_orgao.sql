-- Campos adicionais exigidos pelo novo modelo de contrato (nacionalidade, órgão emissor do RG)
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

alter table funcionarios
  add column nacionalidade text default 'Brasileiro(a)',
  add column rg_orgao_emissor text;
