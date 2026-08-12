import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env e preencha os valores do seu projeto Supabase.'
  )
}

export const SESSAO_EXPIRADA_KEY = 'erp-rh-sessao-expirada'

let supabaseRef: SupabaseClient
let saindoPorSessaoInvalida = false

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (input, init) => {
      const response = await fetch(input, init)

      if (response.status === 401 && !saindoPorSessaoInvalida) {
        try {
          const corpo = await response.clone().json()
          if (typeof corpo?.message === 'string' && /jwt/i.test(corpo.message)) {
            saindoPorSessaoInvalida = true
            sessionStorage.setItem(SESSAO_EXPIRADA_KEY, '1')
            await supabaseRef.auth.signOut()
            saindoPorSessaoInvalida = false
          }
        } catch {
          // resposta não era JSON ou não tinha o formato esperado — ignora
        }
      }

      return response
    },
  },
})

supabaseRef = supabase
