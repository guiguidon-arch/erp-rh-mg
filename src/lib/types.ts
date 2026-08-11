export type StatusObra = 'ativa' | 'pausada' | 'concluida'

export interface Obra {
  id: string
  nome: string
  endereco: string | null
  status: StatusObra
  created_at: string
  updated_at: string
}

export type StatusFuncionario = 'ativo' | 'afastado' | 'ferias' | 'desligado'
export type TipoContrato = 'CLT' | 'PJ' | 'Estágio' | 'Temporário' | 'Diarista' | 'Empreita'
export type TipoConta = 'corrente' | 'poupanca' | 'salario'
export type RacaCor = 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena' | 'Não informado'
export type EstadoCivil = 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável'
export type Sexo = 'Masculino' | 'Feminino'

export interface Funcionario {
  id: string
  nome: string
  cpf: string
  rg: string | null
  data_nascimento: string | null
  endereco: string | null
  telefone: string | null
  email: string | null
  cargo: string | null
  departamento: string | null
  salario: number | null
  data_admissao: string | null
  tipo_contrato: TipoContrato | null
  jornada: string | null
  obra_id: string | null
  status: StatusFuncionario

  ctps_numero: string | null
  ctps_serie: string | null
  ctps_uf: string | null
  pis: string | null
  titulo_eleitor: string | null
  cnh_numero: string | null
  cnh_categoria: string | null
  cnh_orgao_emissor: string | null
  cnh_uf: string | null
  cnh_data_expedicao: string | null
  cnh_data_vencimento: string | null

  banco: string | null
  agencia: string | null
  conta: string | null
  tipo_conta: TipoConta | null
  vale_transporte: boolean | null
  tipo_transporte: string | null

  escolaridade: string | null
  local_nascimento: string | null
  raca_cor: RacaCor | null
  estado_civil: EstadoCivil | null
  sexo: Sexo | null
  nome_mae: string | null
  nome_pai: string | null

  conjuge_cpf: string | null
  conjuge_data_nascimento: string | null
  conjuge_trabalha: boolean | null
  conjuge_dependente_ir: boolean | null

  created_at: string
  updated_at: string
}

export interface FuncionarioComObra extends Funcionario {
  obra: Pick<Obra, 'id' | 'nome'> | null
}

export interface Dependente {
  id: string
  funcionario_id: string
  nome: string
  data_nascimento: string | null
  parentesco: string | null
  cpf: string | null
  dependente_ir: boolean | null
  created_at: string
}

export type CategoriaDocumento =
  | 'contrato'
  | 'rg_cpf'
  | 'atestado'
  | 'comprovante'
  | 'aso'
  | 'cnh'
  | 'ficha_registro'
  | 'contrato_experiencia'
  | 'contrato_prestacao_servicos'
  | 'ficha_epi'
  | 'outro'

export interface DocumentoFuncionario {
  id: string
  funcionario_id: string
  categoria: CategoriaDocumento
  nome_arquivo: string
  storage_path: string
  data_vencimento: string | null
  enviado_por: string | null
  created_at: string
}

export type TipoHistorico =
  | 'promocao'
  | 'reajuste_salarial'
  | 'mudanca_obra'
  | 'mudanca_status'
  | 'mudanca_tipo_contrato'
  | 'outro'

export interface HistoricoFuncionario {
  id: string
  funcionario_id: string
  tipo: TipoHistorico
  campo: string | null
  valor_anterior: string | null
  valor_novo: string | null
  data: string
  observacao: string | null
  criado_por: string | null
  created_at: string
}
