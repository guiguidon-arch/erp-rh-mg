import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { formatarDataExtenso } from '../lib/formatters'
import { EMPRESA } from '../lib/empresa'
import type { Funcionario } from '../lib/types'

export function ContratoExperiencia({ funcionario }: { funcionario: Funcionario }) {
  const salario = funcionario.salario != null ? funcionario.salario.toFixed(2).replace('.', ',') : '_______'
  const jornada = funcionario.jornada || '44 horas semanais'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>CONTRATO DE TRABALHO A TÍTULO DE EXPERIÊNCIA</Text>

        <Text style={styles.paragrafo}>
          Pelo presente instrumento e na melhor forma de direito, as partes: {EMPRESA.razaoSocial}, CNPJ {EMPRESA.cnpj}, com sede a{' '}
          {EMPRESA.endereco}, que por força do presente contrato passa a ser simplesmente denominada EMPREGADOR; {funcionario.nome},
          CPF: {funcionario.cpf}, doravante designado EMPREGADO.
        </Text>

        <Text style={styles.paragrafo}>
          Firmam, nos termos da Lei, o presente CONTRATO DE EXPERIÊNCIA, que terá vigência a partir da data de início da prestação de
          serviços, de acordo com as condições a seguir especificadas:
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA I</Text>
        <Text style={styles.paragrafo}>
          O EMPREGADO acima designado, obriga-se a prestar seus serviços no quadro de funcionários do EMPREGADOR para exercer as
          funções de {funcionario.cargo?.toUpperCase() ?? '_______'}, mediante a remuneração mensal de R$ {salario}, a ser paga
          mensalmente ao empregado, até o 5º (quinto) dia útil do mês. Ressalva-se ao EMPREGADOR, o direito de proceder a
          transferência do empregado para outro cargo ou função que entenda que este demonstre melhor capacidade de adaptação desde
          que compatível com sua condição pessoal.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA II</Text>
        <Text style={styles.paragrafo}>
          A prestação do serviço se dará de segunda a sexta, na jornada de {jornada}, assegurado o direito ao gozo do intervalo de 1
          (uma) hora para a realização de suas refeições.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA III</Text>
        <Text style={styles.paragrafo}>
          O EMPREGADO está ciente e concorda que a prestação de seus serviços se dará tanto na localidade de celebração do Contrato
          de Trabalho, como em qualquer outra Cidade, Capital ou Vila do Território Nacional, nos termos do que dispõe o § 1º do
          artigo 469, da Consolidação das Leis do Trabalho.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA IV</Text>
        <Text style={styles.paragrafo}>
          O EMPREGADO declara estar recebendo no ato da assinatura deste contrato, o Regulamento Interno da Empresa cujas cláusulas
          fazem parte do Contrato de Trabalho e que a violação de qualquer delas implicará em sanção, cuja graduação dependerá da
          gravidade da mesma, podendo culminar na rescisão do contrato de Trabalho.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA V</Text>
        <Text style={styles.paragrafo}>
          O EMPREGADO, sempre que causar algum prejuízo ao empregador, resultante de qualquer conduta dolosa ou culposa, ficará
          obrigado a ressarcir ao EMPREGADOR por todos os danos causados, pelo que desde já fica o EMPREGADOR autorizado a efetivar o
          desconto da importância correspondente ao prejuízo, com fundamento no parágrafo único do artigo 462 da Consolidação das
          Leis do Trabalho.
        </Text>

        <Text style={styles.clausulaTitulo}>CLÁUSULA VI</Text>
        <Text style={styles.paragrafo}>
          O presente Contrato terá a vigência de 30 dias, sendo celebrado para as partes verificarem reciprocamente, a conveniência
          ou não de se vincularem em caráter definitivo a um Contrato de Trabalho. Fica ressalvada a possibilidade de prorrogação
          deste contrato de experiência, por uma vez, em igual período, respeitado o prazo de 30 dias.
        </Text>

        <Text style={styles.paragrafo}>
          E por estarem de pleno acordo, as partes contratantes assinam o presente Contrato de Experiência em duas vias, ficando a
          primeira em poder do EMPREGADOR, e a segunda com o EMPREGADO, que dela dará o competente recibo.
        </Text>

        <Text style={styles.local}>{EMPRESA.cidade}, {formatarDataExtenso()}.</Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>{EMPRESA.razaoSocial}</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text>EMPREGADO: {funcionario.nome}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
