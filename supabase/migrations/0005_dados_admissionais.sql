-- Campos adicionais exigidos pela ficha de registro admissional
-- Execute no Supabase: Dashboard > SQL Editor > New query > colar > Run

alter table funcionarios
  -- Documentos
  add column ctps_numero text,
  add column ctps_serie text,
  add column ctps_uf text,
  add column pis text,
  add column titulo_eleitor text,
  add column cnh_numero text,
  add column cnh_categoria text,
  add column cnh_orgao_emissor text,
  add column cnh_uf text,
  add column cnh_data_expedicao date,
  add column cnh_data_vencimento date,

  -- Dados bancários e benefícios
  add column banco text,
  add column agencia text,
  add column conta text,
  add column tipo_conta text check (tipo_conta in ('corrente', 'poupanca', 'salario')),
  add column vale_transporte boolean,
  add column tipo_transporte text,

  -- Informações pessoais adicionais
  add column escolaridade text,
  add column local_nascimento text,
  add column raca_cor text check (raca_cor in ('Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Não informado')),
  add column estado_civil text check (estado_civil in ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável')),
  add column sexo text check (sexo in ('Masculino', 'Feminino')),
  add column nome_mae text,
  add column nome_pai text,

  -- Cônjuge (quando casado / união estável)
  add column conjuge_cpf text,
  add column conjuge_data_nascimento date,
  add column conjuge_trabalha boolean,
  add column conjuge_dependente_ir boolean;

alter table dependentes
  add column cpf text,
  add column dependente_ir boolean;
