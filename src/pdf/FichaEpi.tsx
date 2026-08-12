import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { Campo, Linha } from './Campo'
import { CabecalhoFixo, RodapeEmpresa } from './CabecalhoEmpresa'
import { formatarCpf } from '../lib/cpf'
import { formatarData } from '../lib/formatters'
import type { EpiFuncionario, Funcionario } from '../lib/types'

export function FichaEpi({ funcionario, epis }: { funcionario: Funcionario; epis: EpiFuncionario[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoFixo />

        <Text style={styles.titulo}>FICHA DE EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL</Text>

        <Linha>
          <Campo label="Nome" valor={funcionario.nome} />
          <Campo label="RG" valor={funcionario.rg} />
          <Campo label="CPF" valor={formatarCpf(funcionario.cpf)} />
        </Linha>
        <Linha>
          <Campo label="Nº de registro" valor={null} />
          <Campo label="Função" valor={funcionario.cargo} />
          <Campo label="Setor" valor={funcionario.departamento} />
        </Linha>
        <Linha>
          <Campo label="Data de admissão" valor={formatarData(funcionario.data_admissao)} />
          <Campo label="Data de demissão" valor={null} />
        </Linha>

        <Text style={{ ...styles.paragrafo, marginTop: 12, fontSize: 9 }}>
          Declaro ter sido orientado adequadamente sobre os cuidados que devo tomar e que estou recebendo todos os Equipamentos de
          Proteção Individual necessários à eliminação/neutralização dos riscos, que fui treinado e orientado quanto a sua correta e
          obrigatória utilização, conforme estabelece a NR 6 - Equipamentos de Proteção Individual, da portaria 3.214/78. Estou
          ciente que a não utilização dos EPI's é falta grave, responsabilizando-me pelo uso, conservação e guarda, estando sujeito a
          sanções legais no caso de inobservância do acima citado.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={{ width: '7%' }}>Qtd.</Text>
            <Text style={{ width: '22%' }}>Tipo de EPI</Text>
            <Text style={{ width: '10%' }}>Nº CA</Text>
            <Text style={{ width: '12%' }}>Entrega</Text>
            <Text style={{ width: '12%' }}>Devolução</Text>
            <Text style={{ width: '17%' }}>Fabricante</Text>
            <Text style={{ width: '20%' }}>Assinatura</Text>
          </View>
          {epis.map((epi) => (
            <View style={styles.tableRow} key={epi.id}>
              <Text style={{ width: '7%' }}>{epi.quantidade}</Text>
              <Text style={{ width: '22%' }}>{epi.tipo_epi}</Text>
              <Text style={{ width: '10%' }}>{epi.numero_ca ?? '—'}</Text>
              <Text style={{ width: '12%' }}>{formatarData(epi.data_entrega)}</Text>
              <Text style={{ width: '12%' }}>{formatarData(epi.data_devolucao)}</Text>
              <Text style={{ width: '17%' }}>{epi.fabricante ?? '—'}</Text>
              <Text style={{ width: '20%' }}></Text>
            </View>
          ))}
          {epis.length === 0 && <Text style={{ marginTop: 6 }}>Nenhum EPI cadastrado até o momento.</Text>}
        </View>

        <Text style={styles.local}>Data: {formatarData(new Date().toISOString())}</Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>Assinatura do funcionário</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>{funcionario.nome}</Text>
          </View>
        </View>

        <RodapeEmpresa />
      </Page>
    </Document>
  )
}
