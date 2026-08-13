interface Signatario {
  name?: string
  email?: string
  phone?: string
  delivery_method?: 'DELIVERY_METHOD_WHATSAPP' | 'DELIVERY_METHOD_SMS'
}

interface RequestBody {
  nomeDocumento: string
  pdfBase64: string
  signatarios: Signatario[]
}

const MUTATION = `
  mutation CreateDocumentMutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
    createDocument(document: $document, signers: $signers, file: $file) {
      id
      name
      signatures {
        public_id
        name
        email
        link { short_link }
      }
    }
  }
`

export default async function handler(req: { method?: string; body: RequestBody }, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const token = process.env.AUTENTIQUE_API_TOKEN
  if (!token) {
    res.status(500).json({ error: 'AUTENTIQUE_API_TOKEN não configurado no servidor.' })
    return
  }

  const { nomeDocumento, pdfBase64, signatarios } = req.body ?? {}

  if (!nomeDocumento || !pdfBase64 || !Array.isArray(signatarios) || signatarios.length === 0) {
    res.status(400).json({ error: 'Dados incompletos: nomeDocumento, pdfBase64 e signatarios são obrigatórios.' })
    return
  }

  if (signatarios.some((s) => !s.email && !s.phone)) {
    res.status(400).json({ error: 'Cada signatário precisa ter e-mail ou telefone.' })
    return
  }

  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')

    const operations = JSON.stringify({
      query: MUTATION,
      variables: {
        document: { name: nomeDocumento },
        signers: signatarios.map((s) =>
          s.phone
            ? { phone: s.phone, delivery_method: s.delivery_method ?? 'DELIVERY_METHOD_WHATSAPP', action: 'SIGN' }
            : { email: s.email, name: s.name, action: 'SIGN' }
        ),
        file: null,
      },
    })
    const map = JSON.stringify({ '0': ['variables.file'] })

    const formData = new FormData()
    formData.append('operations', operations)
    formData.append('map', map)
    formData.append('0', new Blob([pdfBuffer], { type: 'application/pdf' }), `${nomeDocumento}.pdf`)

    const resposta = await fetch('https://api.autentique.com.br/v2/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const dados = (await resposta.json()) as {
      errors?: Array<{ message: string }>
      data?: { createDocument: { id: string; signatures: unknown } }
    }

    if (dados.errors?.length) {
      res.status(422).json({ error: dados.errors.map((e) => e.message).join('; ') })
      return
    }

    res.status(200).json({ documentId: dados.data!.createDocument.id, signatures: dados.data!.createDocument.signatures })
  } catch (erro) {
    res.status(500).json({ error: erro instanceof Error ? erro.message : 'Erro ao enviar documento para a Autentique.' })
  }
}
