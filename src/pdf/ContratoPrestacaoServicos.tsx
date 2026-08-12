import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { CabecalhoFixo, RodapeEmpresa } from './CabecalhoEmpresa'
import { formatarCnpj } from '../lib/cnpj'
import { formatarData, formatarDataExtenso } from '../lib/formatters'
import { EMPRESA } from '../lib/empresa'
import type { ContratoPrestador, Obra, Prestador } from '../lib/types'

export function ContratoPrestacaoServicos({
  prestador,
  contrato,
  obra,
}: {
  prestador: Prestador
  contrato: ContratoPrestador
  obra: Obra | null
}) {
  const valor = contrato.valor_total != null ? `R$ ${contrato.valor_total.toFixed(2)}` : '[Valor]'

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
          2. {prestador.razao_social}, pessoa jurídica inscrita no CNPJ/MF sob nº {formatarCnpj(prestador.cnpj)}
          {prestador.responsavel_nome ? `, neste ato representada por ${prestador.responsavel_nome}` : ''}
          {prestador.endereco ? `, com endereço na ${prestador.endereco}` : ''}
          {prestador.email ? `, endereço eletrônico ${prestador.email}` : ''}
          {prestador.telefone ? ` e telefone para contato nº ${prestador.telefone}` : ''}, doravante denominada "CONTRATADA".
        </Text>

        <Text style={styles.paragrafo}>
          As partes acima qualificadas têm entre si, justas e acordadas, as seguintes cláusulas e condições que regerão o presente
          Contrato de Prestação de Serviços de Mão de Obra a Título de Empreitada:
        </Text>

        <Text style={styles.clausulaTitulo}>1. CLÁUSULA PRIMEIRA - DO OBJETO</Text>
        <Text style={styles.paragrafo}>
          1.1. A CONTRATADA executará os seguintes serviços: {contrato.escopo_servico}
          {obra ? ` na obra ${obra.nome}.` : '.'}
        </Text>

        <Text style={styles.clausulaTitulo}>2. CLÁUSULA SEGUNDA - AUTONOMIA E LIBERDADE DA CONTRATADA</Text>
        <Text style={styles.paragrafo}>
          2.1. A CONTRATADA terá completa e irrestrita liberdade para executar seus trabalhos, tendo total liberdade de
          predeterminar horários ou funções para si e para sua equipe. Fica assim caracterizado que a mesma exerce de maneira
          autônoma seus serviços, não mantendo nenhum vínculo trabalhista com a EMPRESA CONTRATANTE.
        </Text>

        <Text style={styles.clausulaTitulo}>3. CLÁUSULA TERCEIRA - DO PRAZO</Text>
        <Text style={styles.paragrafo}>
          3.1. A CONTRATADA iniciará a prestação destes serviços de empreitada de mão de obra
          {contrato.data_inicio ? ` a partir de ${formatarData(contrato.data_inicio)}` : ''}, com prazo de execução de{' '}
          {contrato.prazo_dias ?? '____'} dias.
        </Text>

        <Text style={styles.clausulaTitulo}>4. CLÁUSULA QUARTA - DO PREÇO</Text>
        <Text style={styles.paragrafo}>
          4.1. Pela execução dos serviços conforme descrito, a EMPRESA CONTRATANTE pagará à CONTRATADA o valor total de {valor}.
        </Text>

        <Text style={styles.clausulaTitulo}>5. CLÁUSULA QUINTA - DO PAGAMENTO</Text>
        <Text style={styles.paragrafo}>5.1. {contrato.forma_pagamento || 'A combinar entre as partes.'}</Text>

        <Text style={styles.clausulaTitulo}>6. CLÁUSULA SEXTA - DA FISCALIZAÇÃO</Text>
        <Text style={styles.paragrafo}>
          6.1. Os serviços ora contratados estarão sujeitos à mais ampla e irrestrita fiscalização da EMPRESA CONTRATANTE, devendo
          a CONTRATADA atender a todas as normas de segurança e ambientais para a execução dos serviços, garantindo a qualidade
          exigida.
        </Text>

        <Text style={styles.clausulaTitulo}>7. CLÁUSULA SÉTIMA - DA VEDAÇÃO DE SUBSTABELECIMENTO</Text>
        <Text style={styles.paragrafo}>
          7.1. A CONTRATADA não poderá transferir, no todo ou em parte, os direitos e obrigações decorrentes do presente contrato.
        </Text>

        <Text style={styles.clausulaTitulo}>8. CLÁUSULA OITAVA - DAS OBRIGAÇÕES DA CONTRATADA</Text>
        <Text style={styles.paragrafo}>
          8.1. A CONTRATADA obriga-se a executar os serviços com estrita observância do projeto e das características técnicas
          exigidas; conduzir os serviços de acordo com as normas de engenharia e a legislação vigente, especialmente a legislação
          trabalhista e as normas de segurança no trabalho, isentando a EMPRESA CONTRATANTE de quaisquer responsabilidades pelas
          suas atividades; e se responsabilizar por seus prepostos e/ou membros de sua equipe por qualquer ato irregular ou dano a
          terceiros.
        </Text>

        <Text style={styles.clausulaTitulo}>9. CLÁUSULA NONA - DO FORO</Text>
        <Text style={styles.paragrafo}>
          9.1. Elegem as partes contratantes o foro da comarca de {EMPRESA.cidade}, Estado de São Paulo, para qualquer ação oriunda
          deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.
        </Text>

        <Text style={styles.paragrafo}>
          E, por estarem assim justas e contratadas, firmam o presente instrumento em 02 (duas) vias de igual teor e forma, na
          presença das testemunhas abaixo firmadas.
        </Text>

        <Text style={styles.local}>
          {contrato.local_assinatura || EMPRESA.cidade}, {formatarData(contrato.data_assinatura) !== '—' ? formatarData(contrato.data_assinatura) : formatarDataExtenso()}.
        </Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>{EMPRESA.representante.nome.toUpperCase()}</Text>
            <Text>{EMPRESA.representante.cargo}</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>{prestador.razao_social}</Text>
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
