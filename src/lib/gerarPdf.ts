import { pdf, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

export async function gerarBlobPdf(documento: ReactElement<DocumentProps>): Promise<Blob> {
  return pdf(documento).toBlob()
}

export async function gerarEAbrirPdf(documento: ReactElement<DocumentProps>, nomeArquivo: string) {
  const blob = await gerarBlobPdf(documento)
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()

  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
