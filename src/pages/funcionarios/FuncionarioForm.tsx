import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { cpfValido, formatarCpf } from '../../lib/cpf'
import type {
  EstadoCivil,
  Funcionario,
  Obra,
  RacaCor,
  Sexo,
  StatusFuncionario,
  TipoContrato,
  TipoConta,
} from '../../lib/types'

const vazio = {
  nome: '',
  cpf: '',
  rg: '',
  data_nascimento: '',
  endereco: '',
  telefone: '',
  email: '',
  cargo: '',
  departamento: '',
  salario: '',
  data_admissao: '',
  tipo_contrato: '' as TipoContrato | '',
  jornada: '',
  obra_id: '',
  status: 'ativo' as StatusFuncionario,

  ctps_numero: '',
  ctps_serie: '',
  ctps_uf: '',
  pis: '',
  titulo_eleitor: '',
  cnh_numero: '',
  cnh_categoria: '',
  cnh_orgao_emissor: '',
  cnh_uf: '',
  cnh_data_expedicao: '',
  cnh_data_vencimento: '',

  banco: '',
  agencia: '',
  conta: '',
  tipo_conta: '' as TipoConta | '',
  vale_transporte: '' as '' | 'sim' | 'nao',
  tipo_transporte: '',

  escolaridade: '',
  local_nascimento: '',
  raca_cor: '' as RacaCor | '',
  estado_civil: '' as EstadoCivil | '',
  sexo: '' as Sexo | '',
  nome_mae: '',
  nome_pai: '',
  nacionalidade: 'Brasileiro(a)',
  rg_orgao_emissor: '',

  conjuge_cpf: '',
  conjuge_data_nascimento: '',
  conjuge_trabalha: '' as '' | 'sim' | 'nao',
  conjuge_dependente_ir: '' as '' | 'sim' | 'nao',
}

function boolParaSimNao(valor: boolean | null): '' | 'sim' | 'nao' {
  if (valor === true) return 'sim'
  if (valor === false) return 'nao'
  return ''
}

function simNaoParaBool(valor: '' | 'sim' | 'nao'): boolean | null {
  if (valor === 'sim') return true
  if (valor === 'nao') return false
  return null
}

export default function FuncionarioForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(vazio)
  const [original, setOriginal] = useState<Funcionario | null>(null)
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('obras')
      .select('*')
      .order('nome')
      .then(({ data }) => setObras(data ?? []))
  }, [])

  useEffect(() => {
    if (!id) return

    supabase
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else if (data) {
          setOriginal(data)
          setForm({
            nome: data.nome,
            cpf: data.cpf,
            rg: data.rg ?? '',
            data_nascimento: data.data_nascimento ?? '',
            endereco: data.endereco ?? '',
            telefone: data.telefone ?? '',
            email: data.email ?? '',
            cargo: data.cargo ?? '',
            departamento: data.departamento ?? '',
            salario: data.salario != null ? String(data.salario) : '',
            data_admissao: data.data_admissao ?? '',
            tipo_contrato: data.tipo_contrato ?? '',
            jornada: data.jornada ?? '',
            obra_id: data.obra_id ?? '',
            status: data.status,

            ctps_numero: data.ctps_numero ?? '',
            ctps_serie: data.ctps_serie ?? '',
            ctps_uf: data.ctps_uf ?? '',
            pis: data.pis ?? '',
            titulo_eleitor: data.titulo_eleitor ?? '',
            cnh_numero: data.cnh_numero ?? '',
            cnh_categoria: data.cnh_categoria ?? '',
            cnh_orgao_emissor: data.cnh_orgao_emissor ?? '',
            cnh_uf: data.cnh_uf ?? '',
            cnh_data_expedicao: data.cnh_data_expedicao ?? '',
            cnh_data_vencimento: data.cnh_data_vencimento ?? '',

            banco: data.banco ?? '',
            agencia: data.agencia ?? '',
            conta: data.conta ?? '',
            tipo_conta: data.tipo_conta ?? '',
            vale_transporte: boolParaSimNao(data.vale_transporte),
            tipo_transporte: data.tipo_transporte ?? '',

            escolaridade: data.escolaridade ?? '',
            local_nascimento: data.local_nascimento ?? '',
            raca_cor: data.raca_cor ?? '',
            estado_civil: data.estado_civil ?? '',
            sexo: data.sexo ?? '',
            nome_mae: data.nome_mae ?? '',
            nome_pai: data.nome_pai ?? '',
            nacionalidade: data.nacionalidade ?? 'Brasileiro(a)',
            rg_orgao_emissor: data.rg_orgao_emissor ?? '',

            conjuge_cpf: data.conjuge_cpf ?? '',
            conjuge_data_nascimento: data.conjuge_data_nascimento ?? '',
            conjuge_trabalha: boolParaSimNao(data.conjuge_trabalha),
            conjuge_dependente_ir: boolParaSimNao(data.conjuge_dependente_ir),
          })
        }
        setLoading(false)
      })
  }, [id])

  function set<K extends keyof typeof vazio>(campo: K, valor: (typeof vazio)[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  const jornadaBloqueada = form.tipo_contrato === 'Empreita'
  const casado = form.estado_civil === 'Casado(a)' || form.estado_civil === 'União Estável'

  function setTipoContrato(valor: TipoContrato) {
    const bloqueia = valor === 'Empreita'
    setForm((atual) => ({
      ...atual,
      tipo_contrato: valor,
      jornada: bloqueia ? 'Não se aplica' : atual.jornada,
    }))
  }

  async function registrarHistorico(funcionarioId: string): Promise<string | null> {
    if (!original) return null

    const entradas: Array<{ tipo: string; campo: string; valor_anterior: string; valor_novo: string }> = []

    if (form.cargo !== (original.cargo ?? '')) {
      entradas.push({ tipo: 'promocao', campo: 'cargo', valor_anterior: original.cargo ?? '—', valor_novo: form.cargo })
    }
    const salarioNovo = form.salario ? Number(form.salario) : null
    if (salarioNovo !== original.salario) {
      entradas.push({
        tipo: 'reajuste_salarial',
        campo: 'salario',
        valor_anterior: original.salario != null ? String(original.salario) : '—',
        valor_novo: salarioNovo != null ? String(salarioNovo) : '—',
      })
    }
    if (form.tipo_contrato !== (original.tipo_contrato ?? '')) {
      entradas.push({
        tipo: 'mudanca_tipo_contrato',
        campo: 'tipo_contrato',
        valor_anterior: original.tipo_contrato ?? '—',
        valor_novo: form.tipo_contrato || '—',
      })
    }
    if (form.obra_id !== (original.obra_id ?? '')) {
      const obraAnterior = obras.find((o) => o.id === original.obra_id)?.nome ?? '—'
      const obraNova = obras.find((o) => o.id === form.obra_id)?.nome ?? '—'
      entradas.push({ tipo: 'mudanca_obra', campo: 'obra_id', valor_anterior: obraAnterior, valor_novo: obraNova })
    }
    if (form.status !== original.status) {
      entradas.push({ tipo: 'mudanca_status', campo: 'status', valor_anterior: original.status, valor_novo: form.status })
    }

    if (entradas.length > 0) {
      const { error } = await supabase.from('historico_funcionario').insert(
        entradas.map((e) => ({ ...e, funcionario_id: funcionarioId }))
      )
      if (error) return error.message
    }

    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!cpfValido(form.cpf)) {
      setError('CPF inválido. Confira os números digitados.')
      return
    }

    setSalvando(true)

    const payload = {
      nome: form.nome,
      cpf: form.cpf.replace(/\D/g, ''),
      rg: form.rg || null,
      data_nascimento: form.data_nascimento || null,
      endereco: form.endereco || null,
      telefone: form.telefone || null,
      email: form.email || null,
      cargo: form.cargo || null,
      departamento: form.departamento || null,
      salario: form.salario ? Number(form.salario) : null,
      data_admissao: form.data_admissao || null,
      tipo_contrato: form.tipo_contrato || null,
      jornada: form.jornada || null,
      obra_id: form.obra_id || null,
      status: form.status,

      ctps_numero: form.ctps_numero || null,
      ctps_serie: form.ctps_serie || null,
      ctps_uf: form.ctps_uf || null,
      pis: form.pis || null,
      titulo_eleitor: form.titulo_eleitor || null,
      cnh_numero: form.cnh_numero || null,
      cnh_categoria: form.cnh_categoria || null,
      cnh_orgao_emissor: form.cnh_orgao_emissor || null,
      cnh_uf: form.cnh_uf || null,
      cnh_data_expedicao: form.cnh_data_expedicao || null,
      cnh_data_vencimento: form.cnh_data_vencimento || null,

      banco: form.banco || null,
      agencia: form.agencia || null,
      conta: form.conta || null,
      tipo_conta: form.tipo_conta || null,
      vale_transporte: simNaoParaBool(form.vale_transporte),
      tipo_transporte: form.tipo_transporte || null,

      escolaridade: form.escolaridade || null,
      local_nascimento: form.local_nascimento || null,
      raca_cor: form.raca_cor || null,
      estado_civil: form.estado_civil || null,
      sexo: form.sexo || null,
      nome_mae: form.nome_mae || null,
      nome_pai: form.nome_pai || null,
      nacionalidade: form.nacionalidade || null,
      rg_orgao_emissor: form.rg_orgao_emissor || null,

      conjuge_cpf: casado ? form.conjuge_cpf || null : null,
      conjuge_data_nascimento: casado ? form.conjuge_data_nascimento || null : null,
      conjuge_trabalha: casado ? simNaoParaBool(form.conjuge_trabalha) : null,
      conjuge_dependente_ir: casado ? simNaoParaBool(form.conjuge_dependente_ir) : null,
    }

    if (editando) {
      const { error } = await supabase.from('funcionarios').update(payload).eq('id', id)
      if (error) {
        setSalvando(false)
        setError(error.message)
        return
      }
      const erroHistorico = await registrarHistorico(id!)
      setSalvando(false)
      if (erroHistorico) {
        setError(`Dados salvos, mas houve um erro ao registrar o histórico: ${erroHistorico}`)
        return
      }
      navigate(`/funcionarios/${id}`)
    } else {
      const { data, error } = await supabase.from('funcionarios').insert(payload).select('id').single()
      setSalvando(false)
      if (error) {
        setError(error.message)
        return
      }
      navigate(`/funcionarios/${data.id}`)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1>{editando ? 'Editar funcionário' : 'Novo funcionário'}</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ marginTop: 16 }}>Dados pessoais</h2>

        <label htmlFor="nome">Nome completo</label>
        <input id="nome" value={form.nome} onChange={(e) => set('nome', e.target.value)} required />

        <div className="form-row">
          <div>
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              value={formatarCpf(form.cpf)}
              onChange={(e) => set('cpf', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="rg">RG</label>
            <input id="rg" value={form.rg} onChange={(e) => set('rg', e.target.value)} />
          </div>
          <div>
            <label htmlFor="rg_orgao_emissor">Órgão emissor do RG</label>
            <input
              id="rg_orgao_emissor"
              placeholder="Ex.: SSP/SP"
              value={form.rg_orgao_emissor}
              onChange={(e) => set('rg_orgao_emissor', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="data_nascimento">Data de nascimento</label>
            <input
              id="data_nascimento"
              type="date"
              value={form.data_nascimento}
              onChange={(e) => set('data_nascimento', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="local_nascimento">Local de nascimento (Cidade/UF)</label>
            <input
              id="local_nascimento"
              value={form.local_nascimento}
              onChange={(e) => set('local_nascimento', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="telefone">Telefone/Celular</label>
            <input id="telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>

        <label htmlFor="endereco">Endereço</label>
        <input id="endereco" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />

        <div className="form-row">
          <div>
            <label htmlFor="estado_civil">Estado civil</label>
            <select
              id="estado_civil"
              value={form.estado_civil}
              onChange={(e) => set('estado_civil', e.target.value as EstadoCivil)}
            >
              <option value="">Selecione...</option>
              <option value="Solteiro(a)">Solteiro(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viúvo(a)">Viúvo(a)</option>
              <option value="União Estável">União Estável</option>
            </select>
          </div>
          <div>
            <label htmlFor="sexo">Sexo</label>
            <select id="sexo" value={form.sexo} onChange={(e) => set('sexo', e.target.value as Sexo)}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <div>
            <label htmlFor="nacionalidade">Nacionalidade</label>
            <input
              id="nacionalidade"
              value={form.nacionalidade}
              onChange={(e) => set('nacionalidade', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="raca_cor">Raça/Cor</label>
            <select id="raca_cor" value={form.raca_cor} onChange={(e) => set('raca_cor', e.target.value as RacaCor)}>
              <option value="">Selecione...</option>
              <option value="Branca">Branca</option>
              <option value="Preta">Preta</option>
              <option value="Parda">Parda</option>
              <option value="Amarela">Amarela</option>
              <option value="Indígena">Indígena</option>
              <option value="Não informado">Não informado</option>
            </select>
          </div>
          <div>
            <label htmlFor="escolaridade">Escolaridade</label>
            <input id="escolaridade" value={form.escolaridade} onChange={(e) => set('escolaridade', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="nome_mae">Nome da mãe</label>
            <input id="nome_mae" value={form.nome_mae} onChange={(e) => set('nome_mae', e.target.value)} />
          </div>
          <div>
            <label htmlFor="nome_pai">Nome do pai</label>
            <input id="nome_pai" value={form.nome_pai} onChange={(e) => set('nome_pai', e.target.value)} />
          </div>
        </div>

        {casado && (
          <>
            <h2 style={{ marginTop: 24 }}>Cônjuge</h2>
            <div className="form-row">
              <div>
                <label htmlFor="conjuge_cpf">CPF do cônjuge</label>
                <input
                  id="conjuge_cpf"
                  value={form.conjuge_cpf}
                  onChange={(e) => set('conjuge_cpf', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="conjuge_data_nascimento">Data de nascimento do cônjuge</label>
                <input
                  id="conjuge_data_nascimento"
                  type="date"
                  value={form.conjuge_data_nascimento}
                  onChange={(e) => set('conjuge_data_nascimento', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="conjuge_trabalha">Cônjuge trabalha?</label>
                <select
                  id="conjuge_trabalha"
                  value={form.conjuge_trabalha}
                  onChange={(e) => set('conjuge_trabalha', e.target.value as '' | 'sim' | 'nao')}
                >
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div>
                <label htmlFor="conjuge_dependente_ir">Cônjuge é dependente de IR?</label>
                <select
                  id="conjuge_dependente_ir"
                  value={form.conjuge_dependente_ir}
                  onChange={(e) => set('conjuge_dependente_ir', e.target.value as '' | 'sim' | 'nao')}
                >
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>
          </>
        )}

        <h2 style={{ marginTop: 24 }}>Documentos</h2>

        <div className="form-row">
          <div>
            <label htmlFor="ctps_numero">CTPS nº</label>
            <input id="ctps_numero" value={form.ctps_numero} onChange={(e) => set('ctps_numero', e.target.value)} />
          </div>
          <div>
            <label htmlFor="ctps_serie">CTPS Série</label>
            <input id="ctps_serie" value={form.ctps_serie} onChange={(e) => set('ctps_serie', e.target.value)} />
          </div>
          <div>
            <label htmlFor="ctps_uf">CTPS UF</label>
            <input id="ctps_uf" value={form.ctps_uf} onChange={(e) => set('ctps_uf', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="pis">PIS/PASEP</label>
            <input id="pis" value={form.pis} onChange={(e) => set('pis', e.target.value)} />
          </div>
          <div>
            <label htmlFor="titulo_eleitor">Título de eleitor (nº/zona/seção)</label>
            <input
              id="titulo_eleitor"
              value={form.titulo_eleitor}
              onChange={(e) => set('titulo_eleitor', e.target.value)}
            />
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>CNH (quando a função exigir)</p>
        <div className="form-row">
          <div>
            <label htmlFor="cnh_numero">Número</label>
            <input id="cnh_numero" value={form.cnh_numero} onChange={(e) => set('cnh_numero', e.target.value)} />
          </div>
          <div>
            <label htmlFor="cnh_categoria">Categoria</label>
            <input id="cnh_categoria" value={form.cnh_categoria} onChange={(e) => set('cnh_categoria', e.target.value)} />
          </div>
          <div>
            <label htmlFor="cnh_uf">UF</label>
            <input id="cnh_uf" value={form.cnh_uf} onChange={(e) => set('cnh_uf', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label htmlFor="cnh_orgao_emissor">Órgão emissor</label>
            <input
              id="cnh_orgao_emissor"
              value={form.cnh_orgao_emissor}
              onChange={(e) => set('cnh_orgao_emissor', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cnh_data_expedicao">Data de expedição</label>
            <input
              id="cnh_data_expedicao"
              type="date"
              value={form.cnh_data_expedicao}
              onChange={(e) => set('cnh_data_expedicao', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cnh_data_vencimento">Validade</label>
            <input
              id="cnh_data_vencimento"
              type="date"
              value={form.cnh_data_vencimento}
              onChange={(e) => set('cnh_data_vencimento', e.target.value)}
            />
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Dados bancários e benefícios</h2>

        <div className="form-row">
          <div>
            <label htmlFor="banco">Banco</label>
            <input id="banco" value={form.banco} onChange={(e) => set('banco', e.target.value)} />
          </div>
          <div>
            <label htmlFor="agencia">Agência</label>
            <input id="agencia" value={form.agencia} onChange={(e) => set('agencia', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label htmlFor="conta">Conta</label>
            <input id="conta" value={form.conta} onChange={(e) => set('conta', e.target.value)} />
          </div>
          <div>
            <label htmlFor="tipo_conta">Tipo de conta</label>
            <select id="tipo_conta" value={form.tipo_conta} onChange={(e) => set('tipo_conta', e.target.value as TipoConta)}>
              <option value="">Selecione...</option>
              <option value="corrente">Conta corrente</option>
              <option value="poupanca">Conta poupança</option>
              <option value="salario">Conta salário</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="vale_transporte">Opção pelo vale-transporte</label>
            <select
              id="vale_transporte"
              value={form.vale_transporte}
              onChange={(e) => set('vale_transporte', e.target.value as '' | 'sim' | 'nao')}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
          <div>
            <label htmlFor="tipo_transporte">Tipo de transporte utilizado</label>
            <input
              id="tipo_transporte"
              placeholder="Ex.: ônibus, trem, intermunicipal"
              value={form.tipo_transporte}
              onChange={(e) => set('tipo_transporte', e.target.value)}
            />
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Dados contratuais</h2>

        <div className="form-row">
          <div>
            <label htmlFor="cargo">Função</label>
            <input id="cargo" value={form.cargo} onChange={(e) => set('cargo', e.target.value)} />
          </div>
          <div>
            <label htmlFor="departamento">Departamento</label>
            <input id="departamento" value={form.departamento} onChange={(e) => set('departamento', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="salario">Salário</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              >
                R$
              </span>
              <input
                id="salario"
                type="number"
                step="0.01"
                style={{ paddingLeft: 34 }}
                value={form.salario}
                onChange={(e) => set('salario', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="data_admissao">Data de admissão</label>
            <input
              id="data_admissao"
              type="date"
              value={form.data_admissao}
              onChange={(e) => set('data_admissao', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="tipo_contrato">Tipo de contrato</label>
            <select
              id="tipo_contrato"
              value={form.tipo_contrato}
              onChange={(e) => setTipoContrato(e.target.value as TipoContrato)}
            >
              <option value="">Selecione...</option>
              <option value="CLT">CLT</option>
              <option value="Estágio">Estágio</option>
              <option value="Diarista">Diarista</option>
              <option value="Empreita">Empreita</option>
            </select>
          </div>
          <div>
            <label htmlFor="jornada">Jornada</label>
            <select
              id="jornada"
              value={form.jornada}
              disabled={jornadaBloqueada}
              onChange={(e) => set('jornada', e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="44h semanais">44h semanais</option>
              <option value="Não se aplica">Não se aplica</option>
            </select>
          </div>
        </div>

        <label htmlFor="obra_id">Obra atual</label>
        <select id="obra_id" value={form.obra_id} onChange={(e) => set('obra_id', e.target.value)}>
          <option value="">Sem obra vinculada</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nome}
            </option>
          ))}
        </select>

        <label htmlFor="status">Status</label>
        <select id="status" value={form.status} onChange={(e) => set('status', e.target.value as StatusFuncionario)}>
          <option value="ativo">Ativo</option>
          <option value="afastado">Afastado</option>
          <option value="ferias">Férias</option>
          <option value="desligado">Desligado</option>
        </select>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
