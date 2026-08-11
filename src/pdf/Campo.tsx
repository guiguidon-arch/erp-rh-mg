import { Text, View } from '@react-pdf/renderer'
import { styles } from './styles'

export function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}:</Text>
      <Text>{valor || '—'}</Text>
    </View>
  )
}

export function Linha({ children }: { children: React.ReactNode }) {
  return <View style={styles.linha}>{children}</View>
}
