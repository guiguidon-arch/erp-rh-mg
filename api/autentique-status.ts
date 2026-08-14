const QUERY = `
  query GetDocument($id: UUID!) {
    document(id: $id) {
      id
      files { signed }
      signatures {
        email
        signed { created_at }
        rejected { created_at }
      }
    }
  }
`

export default async function handler(req: { method?: string; body: { documentId?: string; incluirArquivo?: boolean } }, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const token = process.env.AUTENTIQUE_API_TOKEN
  if (!token) {
    res.status(500).json({ error: 'AUTENTIQUE_API_TOKEN não configurado no servidor.' })
    return
  }

  const documentId = req.body?.documentId

  if (!documentId) {
    res.status(400).json({ error: 'documentId é obrigatório.' })
    return
  }

  try {
    const resposta = await fetch('https://api.autentique.com.br/v2/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { id: documentId } }),
    })

    const dados = (await resposta.json()) as {
      errors?: Array<{ message: string }>
      data?: {
        document: {
          files?: { signed?: string }
          signatures: Array<{ signed: unknown; rejected: unknown }>
        }
      }
    }

    if (dados.errors?.length) {
      res.status(422).json({ error: dados.errors.map((e) => e.message).join('; ') })
      return
    }

    const documento = dados.data!.document
    const assinaturas = documento.signatures

    let status: 'enviado' | 'assinado' | 'rejeitado' = 'enviado'
    if (assinaturas.some((a) => a.rejected)) {
      status = 'rejeitado'
    } else if (assinaturas.length > 0 && assinaturas.every((a) => a.signed)) {
      status = 'assinado'
    }

    // Quando pedido, baixa o PDF assinado para o app arquivar no Storage do sistema
    let arquivoBase64: string | null = null
    if (req.body?.incluirArquivo && status === 'assinado' && documento.files?.signed) {
      const arquivo = await fetch(documento.files.signed)
      if (arquivo.ok) {
        arquivoBase64 = Buffer.from(await arquivo.arrayBuffer()).toString('base64')
      }
    }

    res.status(200).json({ status, linkDocumento: documento.files?.signed ?? null, arquivoBase64 })
  } catch (erro) {
    res.status(500).json({ error: erro instanceof Error ? erro.message : 'Erro ao consultar status na Autentique.' })
  }
}
