interface RequestBody {
  nomeArquivo: string
  pdfBase64: string
}

async function obterToken(tenantId: string, clientId: string, clientSecret: string): Promise<string> {
  const resposta = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  })

  const dados = (await resposta.json()) as { access_token?: string; error_description?: string }
  if (!resposta.ok || !dados.access_token) {
    throw new Error(dados.error_description ?? 'Falha ao autenticar na Microsoft.')
  }
  return dados.access_token
}

function sanitizarNomeArquivo(nome: string): string {
  return nome.replace(/["*:<>?/\\|#%]/g, '-')
}

export default async function handler(req: { method?: string; body: RequestBody }, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const tenantId = process.env.SHAREPOINT_TENANT_ID
  const clientId = process.env.SHAREPOINT_CLIENT_ID
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET
  const siteUrl = process.env.SHAREPOINT_SITE_URL
  const pasta = process.env.SHAREPOINT_PASTA || 'ERP RH'

  // Integração opcional: sem as variáveis configuradas, avisa o app para seguir sem SharePoint
  if (!tenantId || !clientId || !clientSecret || !siteUrl) {
    res.status(200).json({ configurado: false })
    return
  }

  const { nomeArquivo, pdfBase64 } = req.body ?? {}
  if (!nomeArquivo || !pdfBase64) {
    res.status(400).json({ error: 'nomeArquivo e pdfBase64 são obrigatórios.' })
    return
  }

  try {
    const token = await obterToken(tenantId, clientId, clientSecret)

    const url = new URL(siteUrl)
    const respostaSite = await fetch(`https://graph.microsoft.com/v1.0/sites/${url.hostname}:${url.pathname}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const site = (await respostaSite.json()) as { id?: string; error?: { message: string } }
    if (!respostaSite.ok || !site.id) {
      throw new Error(`Site do SharePoint não encontrado (${siteUrl}): ${site.error?.message ?? 'verifique SHAREPOINT_SITE_URL'}`)
    }

    const caminhoArquivo = `${pasta}/${sanitizarNomeArquivo(nomeArquivo)}`
    const respostaUpload = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${site.id}/drive/root:/${encodeURIComponent(caminhoArquivo).replace(/%2F/g, '/')}:/content`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
        body: Buffer.from(pdfBase64, 'base64'),
      }
    )

    const item = (await respostaUpload.json()) as { webUrl?: string; error?: { message: string } }
    if (!respostaUpload.ok) {
      throw new Error(item.error?.message ?? 'Falha ao enviar arquivo para o SharePoint.')
    }

    res.status(200).json({ configurado: true, webUrl: item.webUrl ?? null })
  } catch (erro) {
    res.status(500).json({ error: erro instanceof Error ? erro.message : 'Erro ao enviar para o SharePoint.' })
  }
}
