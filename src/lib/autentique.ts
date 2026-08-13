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
  email: string
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

export async function verificarStatusAssinatura(documentId: string) {
  const resposta = await fetch('/api/autentique-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId }),
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(dados.error || 'Erro ao verificar status.')
  }

  return dados as { status: 'enviado' | 'assinado' | 'rejeitado'; linkDocumento: string | null }
}
