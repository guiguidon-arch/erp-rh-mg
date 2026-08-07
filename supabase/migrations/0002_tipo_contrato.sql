-- Adiciona "Diarista" e "Empreita" como tipos de contrato válidos
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

alter table funcionarios drop constraint funcionarios_tipo_contrato_check;

alter table funcionarios add constraint funcionarios_tipo_contrato_check
  check (tipo_contrato in ('CLT', 'PJ', 'Estágio', 'Temporário', 'Diarista', 'Empreita'));
