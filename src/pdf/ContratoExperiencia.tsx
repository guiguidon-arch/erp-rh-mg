import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { CabecalhoFixo, RodapeEmpresa } from './CabecalhoEmpresa'
import { formatarCpf } from '../lib/cpf'
import { formatarDataExtenso } from '../lib/formatters'
import { EMPRESA } from '../lib/empresa'
import type { Funcionario } from '../lib/types'

export function ContratoExperiencia({ funcionario }: { funcionario: Funcionario }) {
  const salario = funcionario.salario != null ? `R$ ${funcionario.salario.toFixed(2)}` : '[Valor]'
  const jornadaTexto =
    funcionario.jornada === 'Não se aplica'
      ? 'a combinar entre as partes'
      : 'de segunda a sexta-feira, das 07:00 às 17:00 horas, totalizando uma carga semanal de 44 (quarenta e quatro) horas de trabalho'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoFixo />

        <Text style={styles.titulo}>CONTRATO DE TRABALHO</Text>
        <Text style={{ ...styles.titulo, fontSize: 11, marginTop: -8 }}>A Título de Experiência</Text>

        <Text style={styles.paragrafo}>
          Pelo presente instrumento particular, na melhor forma de direito, as partes abaixo qualificadas celebram o presente
          contrato:
        </Text>

        <Text style={styles.paragrafo}>1. {EMPRESA.razaoSocialCompleta};</Text>

        <Text style={styles.paragrafo}>
          2. {funcionario.nome}, {funcionario.nacionalidade || 'Brasileiro(a)'}, {funcionario.estado_civil || '—'},{' '}
          {funcionario.cargo || '—'}, nascido(a) em {funcionario.data_nascimento ? formatarDataExtenso(new Date(funcionario.data_nascimento + 'T00:00:00')) : '—'}, portador(a) da cédula de identidade RG nº{' '}
          {funcionario.rg || '—'}
          {funcionario.rg_orgao_emissor ? ` expedida pela ${funcionario.rg_orgao_emissor}` : ''}, inscrito(a) no CPF/MF sob nº{' '}
          {formatarCpf(funcionario.cpf)}, residente e domiciliado(a) na {funcionario.endereco || '—'}, com endereço eletrônico{' '}
          {funcionario.email || '—'} e telefone para contato nº {funcionario.telefone || '—'}, doravante denominado(a)
          "CONTRATADO(A)".
        </Text>

        <Text style={styles.paragrafo}>
          As partes acima qualificadas têm entre si, justas e acordadas, as seguintes cláusulas e condições que regerão o presente
          Contrato de Trabalho a Título de Experiência:
        </Text>

        <Text style={styles.clausulaTitulo}>1. CLÁUSULA PRIMEIRA - DO OBJETO DO CONTRATO</Text>
        <Text style={styles.paragrafo}>
          1.1. O(A) CONTRATADO(A) compromete-se a prestar serviços à EMPRESA CONTRATANTE, exercendo as funções de{' '}
          {funcionario.cargo?.toUpperCase() ?? '—'}.
        </Text>
        <Text style={styles.paragrafo}>
          1.2. A remuneração mensal será de {salario}, a ser paga até o 5º (quinto) dia útil do mês subsequente.
        </Text>
        <Text style={styles.paragrafo}>
          1.3. A EMPRESA CONTRATANTE reserva-se o direito de transferir o(a) CONTRATADO(A) para outro cargo ou função, desde que
          compatível com suas aptidões e condição pessoal.
        </Text>

        <Text style={styles.clausulaTitulo}>2. CLÁUSULA SEGUNDA - DA JORNADA DE TRABALHO</Text>
        <Text style={styles.paragrafo}>2.1. A prestação dos serviços ocorrerá {jornadaTexto}.</Text>
        <Text style={styles.paragrafo}>2.2. O(A) CONTRATADO(A) terá direito a um intervalo de 01 (uma) hora para refeições.</Text>

        <Text style={styles.clausulaTitulo}>3. CLÁUSULA TERCEIRA - DA LOCALIDADE E MOBILIDADE</Text>
        <Text style={styles.paragrafo}>
          3.1. O(A) CONTRATADO(A) concorda que a prestação dos serviços poderá ocorrer tanto na sede da EMPRESA CONTRATANTE quanto
          em qualquer outra cidade, capital ou vila do território nacional.
        </Text>
        <Text style={styles.paragrafo}>
          3.2. As mudanças de local de trabalho serão realizadas conforme o § 1º do artigo 469 da Consolidação das Leis do Trabalho
          (CLT).
        </Text>

        <Text style={styles.clausulaTitulo}>4. CLÁUSULA QUARTA - DO REGULAMENTO INTERNO</Text>
        <Text style={styles.paragrafo}>
          4.1. O(A) CONTRATADO(A) declara ter recebido, no ato da assinatura deste contrato, o Regulamento Interno da Empresa, que
          integra este Contrato de Trabalho.
        </Text>
        <Text style={styles.paragrafo}>
          4.2. A violação de qualquer cláusula do Regulamento Interno poderá resultar em sanções, cuja gradação será determinada
          pela gravidade da infração, podendo levar à rescisão do contrato de trabalho.
        </Text>

        <Text style={styles.clausulaTitulo}>5. CLÁUSULA QUINTA - DA RESPONSABILIDADE E RESSARCIMENTO</Text>
        <Text style={styles.paragrafo}>
          5.1. O(A) CONTRATADO(A) se compromete a ressarcir a EMPRESA CONTRATANTE por qualquer dano causado por conduta dolosa ou
          culposa.
        </Text>
        <Text style={styles.paragrafo}>
          5.2. A EMPRESA CONTRATANTE está autorizada a descontar os valores correspondentes ao prejuízo, com base no parágrafo
          único do artigo 462 da CLT.
        </Text>

        <Text style={styles.clausulaTitulo}>6. CLÁUSULA SEXTA - DA DURAÇÃO E PRORROGAÇÃO DO CONTRATO</Text>
        <Text style={styles.paragrafo}>
          6.1. O presente contrato de trabalho é celebrado a título de experiência, nos termos da legislação vigente, com duração
          de 45 (quarenta e cinco) dias, com a finalidade de avaliar a compatibilidade do(a) empregado(a) com as atividades da
          empresa.
        </Text>
        <Text style={styles.paragrafo}>
          6.2. Durante o período de experiência, aplicam-se todas as normas legais e regulamentares pertinentes ao contrato de
          trabalho, respeitadas as condições aqui ajustadas.
        </Text>
        <Text style={styles.paragrafo}>
          6.3. O período de experiência poderá ser prorrogado por acordo expresso entre as partes, respeitando o limite máximo
          legal de 45 (quarenta e cinco) dias, sem modificação das demais condições contratuais.
        </Text>

        <Text style={styles.clausulaTitulo}>7. CLÁUSULA SÉTIMA - DO FORO</Text>
        <Text style={styles.paragrafo}>
          7.1. As partes contratantes elegem o foro da comarca de {EMPRESA.cidade}, Estado de São Paulo, como o único competente
          para dirimir quaisquer questões oriundas deste contrato, renunciando a qualquer outro foro, por mais privilegiado que
          seja.
        </Text>

        <Text style={styles.paragrafo}>
          As partes, devidamente qualificadas acima, manifestam sua concordância com todas as cláusulas e condições estabelecidas
          neste contrato. O presente instrumento é assinado em 02 (duas) vias de igual teor e forma, na presença das testemunhas
          abaixo identificadas.
        </Text>

        <Text style={styles.local}>{EMPRESA.cidade}, {formatarDataExtenso()}.</Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>{EMPRESA.representante.nome.toUpperCase()}</Text>
            <Text>{EMPRESA.representante.cargo}</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>{funcionario.nome}</Text>
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
