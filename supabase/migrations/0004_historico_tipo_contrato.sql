-- Adiciona "mudanca_tipo_contrato" como tipo válido de histórico
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

alter table historico_funcionario drop constraint historico_funcionario_tipo_check;

alter table historico_funcionario add constraint historico_funcionario_tipo_check
  check (tipo in ('promocao', 'reajuste_salarial', 'mudanca_obra', 'mudanca_status', 'mudanca_tipo_contrato', 'outro'));
