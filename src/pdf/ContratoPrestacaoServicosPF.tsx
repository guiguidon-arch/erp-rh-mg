import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { RodapeEmpresa, CabecalhoFixo } from './CabecalhoEmpresa'
import { formatarCpf } from '../lib/cpf'
import { formatarDataExtenso } from '../lib/formatters'
import { EMPRESA } from '../lib/empresa'
import type { Funcionario } from '../lib/types'

export function ContratoPrestacaoServicosPF({ funcionario }: { funcionario: Funcionario }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoFixo />

        <Text style={styles.titulo}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
        <Text style={{ ...styles.titulo, fontSize: 11, marginTop: -8 }}>De Mão de Obra a Título de Empreitada</Text>

        <Text style={styles.paragrafo}>
          Pelo presente instrumento particular, na melhor forma de direito, as partes abaixo qualificadas celebram o presente
          contrato:
        </Text>

        <Text style={styles.paragrafo}>1. {EMPRESA.razaoSocialCompleta};</Text>

        <Text style={styles.paragrafo}>
          2. {funcionario.nome}, {funcionario.nacionalidade || 'Brasileiro(a)'}, {funcionario.estado_civil || '—'},{' '}
          {funcionario.cargo || '—'}, portador(a) da cédula de identidade RG nº {funcionario.rg || '—'}
          {funcionario.rg_orgao_emissor ? ` expedida pela ${funcionario.rg_orgao_emissor}` : ''}, inscrito(a) no CPF/MF sob nº{' '}
          {formatarCpf(funcionario.cpf)}, residente e domiciliado(a) na {funcionario.endereco || '—'}, com endereço eletrônico{' '}
          {funcionario.email || '—'} e telefone para contato nº {funcionario.telefone || '—'}, doravante denominado(a)
          "CONTRATADO(A)".
        </Text>

        <Text style={styles.paragrafo}>
          As partes acima qualificadas têm entre si, justas e acordadas, as seguintes cláusulas e condições que regerão o presente
          Contrato de Prestação de Serviços de Mão de Obra a Título de Empreitada:
        </Text>

        <Text style={styles.clausulaTitulo}>1. CLÁUSULA PRIMEIRA - OBJETO DO CONTRATO</Text>
        <Text style={styles.paragrafo}>
          1.1. O(A) CONTRATADO(A), na qualidade de {funcionario.cargo || '—'}, será responsável pela execução dos serviços
          contratados junto à EMPRESA CONTRATANTE.
        </Text>
        <Text style={styles.paragrafo}>
          1.2. Qualquer ajuste ou modificação relacionado ao serviço será decidido e formalizado mediante consenso entre as partes.
        </Text>

        <Text style={styles.clausulaTitulo}>2. CLÁUSULA SEGUNDA - AUTONOMIA E LIBERDADE DO(A) CONTRATADO(A)</Text>
        <Text style={styles.paragrafo}>
          2.1. O(A) CONTRATADO(A) terá completa e irrestrita liberdade para executar seus trabalhos, incluindo a definição de
          horários e funções para si e para sua equipe.
        </Text>
        <Text style={styles.paragrafo}>
          2.2. O(A) CONTRATADO(A) exerce seus serviços de forma autônoma, não mantendo nenhum vínculo trabalhista com a EMPRESA
          CONTRATANTE.
        </Text>

        <Text style={styles.clausulaTitulo}>3. CLÁUSULA TERCEIRA - PRAZOS E INÍCIO DOS SERVIÇOS</Text>
        <Text style={styles.paragrafo}>
          3.1. O(A) CONTRATADO(A) iniciará a prestação dos serviços com início imediato, no prazo de 15 (quinze) dias corridos.
        </Text>
        <Text style={styles.paragrafo}>
          3.2. O contrato poderá ser interrompido pela simples comunicação de qualquer das partes, sem ônus para nenhuma delas.
        </Text>

        <Text style={styles.clausulaTitulo}>4. CLÁUSULA QUARTA - VALOR DOS SERVIÇOS</Text>
        <Text style={styles.paragrafo}>
          4.1. A EMPRESA CONTRATANTE pagará ao(a) CONTRATADO(A) o valor de{' '}
          {funcionario.salario != null ? `R$ ${funcionario.salario.toFixed(2)}` : '[Valor]'}, conforme os serviços descritos na
          Cláusula Primeira.
        </Text>

        <Text style={styles.clausulaTitulo}>5. CLÁUSULA QUINTA - CONDIÇÕES DE PAGAMENTO</Text>
        <Text style={styles.paragrafo}>
          5.1. O pagamento será efetuado quinzenalmente, conforme medição dos serviços executados pela EMPRESA CONTRATANTE e seus
          prepostos, com depósito realizado na conta bancária do(a) CONTRATADO(A)
          {funcionario.banco ? ` (${funcionario.banco}, ag. ${funcionario.agencia ?? '—'}, conta ${funcionario.conta ?? '—'})` : ''}.
        </Text>

        <Text style={styles.clausulaTitulo}>6. CLÁUSULA SEXTA - FISCALIZAÇÃO DOS SERVIÇOS</Text>
        <Text style={styles.paragrafo}>
          6.1. Os serviços estarão sujeitos à fiscalização da EMPRESA CONTRATANTE a qualquer tempo e hora, podendo exigir o
          afastamento de prepostos ou membros da equipe do(a) CONTRATADO(A) que não apresentem idoneidade técnica ou moral.
        </Text>

        <Text style={styles.clausulaTitulo}>7. CLÁUSULA SÉTIMA - VEDAÇÃO DE SUBSTABELECIMENTOS</Text>
        <Text style={styles.paragrafo}>
          7.1. O(A) CONTRATADO(A) não poderá transferir, no todo ou em parte, os direitos e obrigações decorrentes deste contrato.
        </Text>

        <Text style={styles.clausulaTitulo}>8. CLÁUSULA OITAVA - OBRIGAÇÕES DO(A) CONTRATADO(A)</Text>
        <Text style={styles.paragrafo}>
          8.1. Executar os serviços com estrita observância do projeto e das características técnicas e de qualidade exigidas pelos
          técnicos da EMPRESA CONTRATANTE, conduzindo-os de acordo com as normas de engenharia e a legislação vigente, especialmente
          a legislação trabalhista e as normas de segurança no trabalho, isentando a EMPRESA CONTRATANTE de quaisquer
          responsabilidades.
        </Text>

        <Text style={styles.clausulaTitulo}>9. CLÁUSULA NONA - FORO</Text>
        <Text style={styles.paragrafo}>
          9.1. As partes contratantes elegem o foro da comarca de Barueri, Estado de São Paulo, como o único competente para dirimir
          quaisquer questões oriundas deste contrato, renunciando a qualquer outro foro, por mais privilegiado que seja.
        </Text>

        <Text style={styles.paragrafo}>
          As partes, devidamente qualificadas acima, manifestam sua concordância com todas as cláusulas e condições estabelecidas
          neste contrato. O presente instrumento é assinado em 02 (duas) vias de igual teor e forma, na presença das testemunhas
          abaixo identificadas.
        </Text>

        <Text style={styles.local}>{EMPRESA.cidade}, {formatarDataExtenso()}.</Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>{EMPRESA.representante.nome}</Text>
            <Text>{EMPRESA.representante.cargo}</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>{funcionario.nome}</Text>
            <Text>{funcionario.cargo}</Text>
          </View>
        </View>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>Primeira testemunha</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>Segunda testemunha</Text>
          </View>
        </View>

        <RodapeEmpresa />
      </Page>
    </Document>
  )
}
