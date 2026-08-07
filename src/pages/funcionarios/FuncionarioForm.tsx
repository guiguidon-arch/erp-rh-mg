import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { cpfValido, formatarCpf } from '../../lib/cpf'
import type { Funcionario, Obra, StatusFuncionario, TipoContrato } from '../../lib/types'

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
          })
        }
        setLoading(false)
      })
  }, [id])

  function set<K extends keyof typeof vazio>(campo: K, valor: (typeof vazio)[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  const jornadaBloqueada = form.tipo_contrato === 'PJ' || form.tipo_contrato === 'Empreita'

  function setTipoContrato(valor: TipoContrato) {
    const bloqueia = valor === 'PJ' || valor === 'Empreita'
    setForm((atual) => ({
      ...atual,
      tipo_contrato: valor,
      jornada: bloqueia ? 'Não se aplica' : atual.jornada,
    }))
  }

  async function registrarHistorico(funcionarioId: string) {
    if (!original) return

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
      await supabase.from('historico_funcionario').insert(
        entradas.map((e) => ({ ...e, funcionario_id: funcionarioId }))
      )
    }
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
    }

    if (editando) {
      const { error } = await supabase.from('funcionarios').update(payload).eq('id', id)
      if (error) {
        setSalvando(false)
        setError(error.message)
        return
      }
      await registrarHistorico(id!)
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
            <label htmlFor="telefone">Telefone</label>
            <input id="telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
          </div>
        </div>

        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />

        <label htmlFor="endereco">Endereço</label>
        <input id="endereco" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />

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
              <option value="PJ">PJ</option>
              <option value="Estágio">Estágio</option>
              <option value="Temporário">Temporário</option>
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
