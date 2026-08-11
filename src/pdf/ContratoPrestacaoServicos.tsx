import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { formatarData } from '../lib/formatters'
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
  const valor = contrato.valor_total != null ? contrato.valor_total.toFixed(2).replace('.', ',') : '_______'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>CONTRATO DE EMPREITADA DE MÃO DE OBRA</Text>

        <Text style={styles.paragrafo}>
          PELO PRESENTE INSTRUMENTO, AS PARTES ACORDAM ENTRE SI, SENDO DE UM LADO, {EMPRESA.razaoSocial}, CNPJ {EMPRESA.cnpj},
          sediada a {EMPRESA.endereco}, Fone {EMPRESA.telefone}, representada por seu {EMPRESA.representante.cargo},{' '}
          {EMPRESA.representante.nome}, portador do RG {EMPRESA.representante.rg} e do CPF {EMPRESA.representante.cpf}, doravante
          denominada simplesmente CONTRATANTE, E, DE OUTRO LADO, {prestador.razao_social}, CNPJ: {prestador.cnpj}
          {prestador.endereco ? `, endereço: ${prestador.endereco}` : ''}, doravante denominado simplesmente CONTRATADO.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 1ª — DO OBJETO</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA executará os seguintes serviços: {contrato.escopo_servico}
          {obra ? ` na obra ${obra.nome}.` : '.'}
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 2ª</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA terá completa e irrestrita liberdade para executar seus trabalhos, tendo total liberdade de predeterminar
          horários ou funções para si e para sua equipe. Fica assim caracterizado que a mesma exerce de maneira autônoma seus
          serviços, não mantendo nenhum vínculo trabalhista com a CONTRATANTE.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 3ª — DO PRAZO</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA iniciará a prestação destes serviços de empreitada de mão de obra
          {contrato.data_inicio ? ` a partir de ${formatarData(contrato.data_inicio)}` : ''}, com prazo de execução de{' '}
          {contrato.prazo_dias ?? '____'} dias.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 4ª — DO PREÇO</Text>
        <Text style={styles.paragrafo}>
          Pela execução dos serviços conforme descrito, a CONTRATANTE pagará à CONTRATADA o valor total de R$ {valor}.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 5ª — DO PAGAMENTO</Text>
        <Text style={styles.paragrafo}>{contrato.forma_pagamento || 'A combinar entre as partes.'}</Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 6ª — DA FISCALIZAÇÃO</Text>
        <Text style={styles.paragrafo}>
          Os serviços ora contratados estarão sujeitos à mais ampla e irrestrita fiscalização da CONTRATANTE, devendo a CONTRATADA
          atender a todas as normas de segurança e ambientais para a execução dos serviços, garantindo a qualidade exigida.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 7ª — DA VEDAÇÃO DE SUBSTABELECIMENTO</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA não poderá transferir, no todo ou em parte, os direitos e obrigações decorrentes do presente contrato.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 8ª — DAS OBRIGAÇÕES DA CONTRATADA</Text>
        <Text style={styles.paragrafo}>
          A CONTRATADA obriga-se a executar os serviços com estrita observância do projeto e das características técnicas exigidas;
          conduzir os serviços de acordo com as normas de engenharia e a legislação vigente, especialmente a legislação trabalhista e
          as normas de segurança no trabalho, isentando a CONTRATANTE de quaisquer responsabilidades pelas suas atividades; e se
          responsabilizar por seus prepostos e/ou membros de sua equipe por qualquer ato irregular ou dano a terceiros.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA 9ª — DO FORO</Text>
        <Text style={styles.paragrafo}>
          Elegem as partes contratantes o foro desta cidade para qualquer ação oriunda deste contrato, renunciando a qualquer outro,
          por mais privilegiado que seja.
        </Text>

        <Text style={styles.paragrafo}>
          E, por estarem assim justos e contratados, firmam o presente instrumento em 02 (duas) vias de igual teor e forma, na
          presença das testemunhas abaixo firmadas.
        </Text>

        <Text style={styles.local}>
          {contrato.local_assinatura || EMPRESA.cidade}, {formatarData(contrato.data_assinatura) !== '—' ? formatarData(contrato.data_assinatura) : formatarData(new Date().toISOString())}.
        </Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>CONTRATANTE — {EMPRESA.razaoSocial}</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>CONTRATADA — {prestador.razao_social}</Text>
          </View>
        </View>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>Testemunha</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>Testemunha</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
