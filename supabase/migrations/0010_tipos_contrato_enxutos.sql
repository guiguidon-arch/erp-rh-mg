-- Simplifica os tipos de contratação:
--   - "Temporário" é absorvido por "Diarista"
--   - "PJ" deixa de existir como funcionário (pessoas jurídicas são cadastradas em Prestadores)
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

-- Converte os dados existentes antes de apertar a regra
update funcionarios set tipo_contrato = 'Diarista' where tipo_contrato = 'Temporário';
update funcionarios set tipo_contrato = null where tipo_contrato = 'PJ';

alter table funcionarios drop constraint funcionarios_tipo_contrato_check;

alter table funcionarios add constraint funcionarios_tipo_contrato_check
  check (tipo_contrato in ('CLT', 'Estágio', 'Diarista', 'Empreita'));
