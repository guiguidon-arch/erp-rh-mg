function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export interface Signatario {
  name?: string
  email?: string
  phone?: string
  delivery_method?: 'DELIVERY_METHOD_WHATSAPP'
}

/**
 * Converte um telefone digitado livremente (ex.: "15 98813-7394") para o
 * formato internacional exigido pela Autentique (ex.: "+5515988137394").
 * Retorna null se o número não parecer um celular brasileiro válido.
 */
export function telefoneParaWhatsapp(telefone: string | null): string | null {
  if (!telefone) return null

  let digitos = telefone.replace(/\D/g, '').replace(/^0+/, '')

  if (digitos.length === 10 || digitos.length === 11) {
    digitos = '55' + digitos
  }

  if (digitos.length === 12 || digitos.length === 13) {
    return '+' + digitos
  }

  return null
}

export async function enviarParaAssinatura(pdfBlob: Blob, nomeDocumento: string, signatarios: Signatario[]) {
  const pdfBase64 = await blobParaBase64(pdfBlob)

  const resposta = await fetch('/api/autentique-enviar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeDocumento, pdfBase64, signatarios }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.error || 'Erro ao enviar para assinatura.')
  }

  return dados as { documentId: string; signatures: Array<{ email: string; link: { short_link: string } | null }> }
}

export async function verificarStatusAssinatura(documentId: string, incluirArquivo = false) {
  const resposta = await fetch('/api/autentique-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, incluirArquivo }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.error || 'Erro ao verificar status.')
  }

  return dados as {
    status: 'enviado' | 'assinado' | 'rejeitado'
    linkDocumento: string | null
    arquivoBase64: string | null
  }
}

export async function base64ParaBlob(base64: string): Promise<Blob> {
  const resposta = await fetch(`data:application/pdf;base64,${base64}`)
  return resposta.blob()
}
