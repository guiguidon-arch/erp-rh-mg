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
export type TipoContrato = 'CLT' | 'PJ' | 'Estágio' | 'Temporário'

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
  created_at: string
}

export type TipoHistorico = 'promocao' | 'reajuste_salarial' | 'mudanca_obra' | 'mudanca_status' | 'outro'

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
