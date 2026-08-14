-- Guarda o caminho do PDF assinado arquivado no Storage do sistema
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

alter table envios_assinatura
  add column storage_path_assinado text;
