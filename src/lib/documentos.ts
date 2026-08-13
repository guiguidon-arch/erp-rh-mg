import type { CategoriaDocumento } from './types'

export const categoriaLabel: Record<CategoriaDocumento, string> = {
  contrato: 'Contrato',
  rg_cpf: 'RG/CPF',
  atestado: 'Atestado',
  comprovante: 'Comprovante',
  aso: 'ASO',
  cnh: 'CNH',
  ficha_registro: 'Ficha de cadastro de empregado',
  contrato_experiencia: 'Contrato de experiência',
  contrato_prestacao_servicos: 'Contrato de prestação de serviços',
  ficha_epi: 'Ficha de EPI',
  outro: 'Outro',
}

export function statusVencimento(dataVencimento: string | null): 'vencido' | 'vencendo' | null {
  if (!dataVencimento) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vencimento = new Date(dataVencimento + 'T00:00:00')
  const diasRestantes = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= 30) return 'vencendo'
  return null
}
