import { Image, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { EMPRESA } from '../lib/empresa'

export function CabecalhoFixo() {
  return (
    <View style={styles.headerFixed} fixed>
      <Image src="/logo.png" style={styles.headerLogo} />
      <View style={styles.headerLine} />
    </View>
  )
}

export function RodapeEmpresa() {
  return (
    <View style={styles.footerFixed} fixed>
      <Text style={styles.footerText}>
        {EMPRESA.razaoSocial}{'\n'}
        CNPJ {EMPRESA.cnpj}{'\n'}
        {EMPRESA.endereco}{'\n'}
        {EMPRESA.telefone} • {EMPRESA.email}
      </Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  )
}

export function CabecalhoEmpresa({ mostrarCnpj = true }: { mostrarCnpj?: boolean }) {
  return (
    <View style={styles.header}>
      <Image src="/logo.png" style={styles.logo} />
      <Text style={styles.empresaNome}>{EMPRESA.razaoSocial}</Text>
      {mostrarCnpj && (
        <Text>
          CNPJ {EMPRESA.cnpj} — {EMPRESA.endereco}
        </Text>
      )}
    </View>
  )
}
