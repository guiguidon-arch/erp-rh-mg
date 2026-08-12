import { Document, Page, Text, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { Campo, Linha } from './Campo'
import { CabecalhoFixo, RodapeEmpresa } from './CabecalhoEmpresa'
import { formatarCpf } from '../lib/cpf'
import { formatarData } from '../lib/formatters'
import { EMPRESA } from '../lib/empresa'
import type { Dependente, Funcionario } from '../lib/types'

const tipoContaLabel: Record<string, string> = {
  corrente: 'Conta corrente',
  poupanca: 'Conta poupança',
  salario: 'Conta salário',
}

export function FichaRegistro({ funcionario, dependentes }: { funcionario: Funcionario; dependentes: Dependente[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoFixo />

        <Text style={styles.titulo}>FICHA DE CADASTRO DE EMPREGADO</Text>

        <Text style={styles.secaoTitulo}>Dados Admissionais</Text>
        <Linha>
          <Campo label="Nome" valor={funcionario.nome} />
          <Campo label="Admissão" valor={formatarData(funcionario.data_admissao)} />
        </Linha>
        <Linha>
          <Campo label="E-mail" valor={funcionario.email} />
          <Campo label="Celular" valor={funcionario.telefone} />
        </Linha>
        <Linha>
          <Campo label="Função" valor={funcionario.cargo} />
          <Campo label="Salário" valor={funcionario.salario != null ? `R$ ${funcionario.salario.toFixed(2)}` : null} />
        </Linha>
        <Linha>
          <Campo label="Tipo de contratação" valor={funcionario.tipo_contrato} />
          <Campo label="Jornada" valor={funcionario.jornada} />
        </Linha>

        <Text style={styles.secaoTitulo}>Dados bancários e benefícios</Text>
        <Linha>
          <Campo label="Banco" valor={funcionario.banco} />
          <Campo label="Agência" valor={funcionario.agencia} />
          <Campo label="Conta" valor={funcionario.conta} />
        </Linha>
        <Linha>
          <Campo label="Tipo de conta" valor={funcionario.tipo_conta ? tipoContaLabel[funcionario.tipo_conta] : null} />
          <Campo label="Vale-transporte" valor={funcionario.vale_transporte == null ? null : funcionario.vale_transporte ? `Sim (${funcionario.tipo_transporte ?? '—'})` : 'Não'} />
        </Linha>

        <Text style={styles.secaoTitulo}>Documentos e Informações</Text>
        <Linha>
          <Campo
            label="CTPS"
            valor={funcionario.ctps_numero ? `${funcionario.ctps_numero} série ${funcionario.ctps_serie ?? '—'}/${funcionario.ctps_uf ?? '—'}` : null}
          />
          <Campo label="RG" valor={funcionario.rg} />
        </Linha>
        <Linha>
          <Campo label="Órgão emissor RG" valor={funcionario.rg_orgao_emissor} />
          <Campo label="Nacionalidade" valor={funcionario.nacionalidade} />
        </Linha>
        <Linha>
          <Campo label="CPF" valor={formatarCpf(funcionario.cpf)} />
          <Campo label="PIS/PASEP" valor={funcionario.pis} />
        </Linha>
        <Linha>
          <Campo label="Título de eleitor" valor={funcionario.titulo_eleitor} />
        </Linha>
        <Linha>
          <Campo
            label="CNH"
            valor={
              funcionario.cnh_numero
                ? `${funcionario.cnh_numero} cat. ${funcionario.cnh_categoria ?? '—'} — validade ${formatarData(funcionario.cnh_data_vencimento)}`
                : null
            }
          />
        </Linha>

        <Text style={styles.secaoTitulo}>Informações Pessoais</Text>
        <Linha>
          <Campo label="Data de nascimento" valor={formatarData(funcionario.data_nascimento)} />
          <Campo label="Local de nascimento" valor={funcionario.local_nascimento} />
        </Linha>
        <Linha>
          <Campo label="Escolaridade" valor={funcionario.escolaridade} />
          <Campo label="Raça/Cor" valor={funcionario.raca_cor} />
        </Linha>
        <Linha>
          <Campo label="Endereço" valor={funcionario.endereco} />
        </Linha>
        <Linha>
          <Campo label="Nome da mãe" valor={funcionario.nome_mae} />
          <Campo label="Nome do pai" valor={funcionario.nome_pai} />
        </Linha>
        <Linha>
          <Campo label="Estado civil" valor={funcionario.estado_civil} />
          <Campo label="Sexo" valor={funcionario.sexo} />
        </Linha>

        {(funcionario.estado_civil === 'Casado(a)' || funcionario.estado_civil === 'União Estável') && (
          <>
            <Text style={styles.secaoTitulo}>Cônjuge</Text>
            <Linha>
              <Campo label="CPF" valor={funcionario.conjuge_cpf ? formatarCpf(funcionario.conjuge_cpf) : null} />
              <Campo label="Nascimento" valor={formatarData(funcionario.conjuge_data_nascimento)} />
            </Linha>
            <Linha>
              <Campo label="Trabalha?" valor={funcionario.conjuge_trabalha == null ? null : funcionario.conjuge_trabalha ? 'Sim' : 'Não'} />
              <Campo
                label="Dependente de IR?"
                valor={funcionario.conjuge_dependente_ir == null ? null : funcionario.conjuge_dependente_ir ? 'Sim' : 'Não'}
              />
            </Linha>
          </>
        )}

        <Text style={styles.secaoTitulo}>Dependentes</Text>
        {dependentes.length === 0 && <Text>Nenhum dependente informado.</Text>}
        {dependentes.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={{ width: '30%' }}>Nome</Text>
              <Text style={{ width: '20%' }}>Parentesco</Text>
              <Text style={{ width: '20%' }}>CPF</Text>
              <Text style={{ width: '15%' }}>Nascimento</Text>
              <Text style={{ width: '15%' }}>Dep. IR</Text>
            </View>
            {dependentes.map((dep) => (
              <View style={styles.tableRow} key={dep.id}>
                <Text style={{ width: '30%' }}>{dep.nome}</Text>
                <Text style={{ width: '20%' }}>{dep.parentesco ?? '—'}</Text>
                <Text style={{ width: '20%' }}>{dep.cpf ? formatarCpf(dep.cpf) : '—'}</Text>
                <Text style={{ width: '15%' }}>{formatarData(dep.data_nascimento)}</Text>
                <Text style={{ width: '15%' }}>{dep.dependente_ir == null ? '—' : dep.dependente_ir ? 'Sim' : 'Não'}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={{ marginTop: 16, fontSize: 8, lineHeight: 1.4 }}>
          LEI GERAL DE PROTEÇÃO DE DADOS PESSOAIS - LGPD: através do presente instrumento, autorizo a empresa {EMPRESA.razaoSocial},
          aqui denominada CONTROLADORA, em razão do contrato de trabalho, a dispor dos meus dados pessoais, de acordo com os artigos
          7º e 11 da Lei nº 13.709/2018.
        </Text>

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text>{EMPRESA.razaoSocial}</Text>
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
