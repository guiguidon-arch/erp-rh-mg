# ERP de Recursos Humanos — Especificação do Projeto

## Contexto
Sistema de RH para empresa brasileira com 11–50 funcionários. O responsável pelo projeto não é desenvolvedor profissional, mas está disposto a aprender — **explique as decisões técnicas em linguagem acessível e em português.**

## Stack (já decidida)
- **Frontend:** React + Vite, hospedado na Vercel (plano gratuito)
- **Backend/Banco/Auth/Storage:** Supabase (plano gratuito)
- **Idioma da interface:** Português (Brasil)
- Priorizar simplicidade de manutenção sobre sofisticação técnica

## Módulos da primeira versão (nesta ordem)

### 1. Cadastro de funcionários
- Dados pessoais (nome, CPF, RG, data de nascimento, endereço, contatos, dependentes)
- Dados contratuais (cargo, departamento, salário, data de admissão, tipo de contrato, jornada)
- Status (ativo, afastado, férias, desligado)
- Histórico de alterações (promoções, reajustes)

### 2. Gestão de documentos
- Upload de documentos por funcionário (contrato, RG/CPF, atestados, comprovantes)
- Organização por categoria e funcionário
- Armazenamento no Supabase Storage com controle de acesso
- Alerta de documentos vencidos/pendentes (ex.: ASO, CNH)

### 3. Geração de documentos para assinatura
- Modelos de documentos (contrato de trabalho, aditivo, advertência, aviso de férias)
  preenchidos automaticamente com dados do funcionário
- Geração de PDF
- **Integração com a API da Autentique** para envio para assinatura eletrônica
  (plano gratuito: até ~10–20 docs/mês; docs da API: https://docs.autentique.com.br)
- Sempre manter botão de "Baixar PDF" como alternativa manual (caso o limite
  gratuito estoure)

### 4. Importação de ponto
- **O ponto oficial é feito por empresa terceirizada certificada (Portaria 671/2021).
  Este sistema NÃO registra ponto — apenas importa e exibe relatórios.**
- Formato de exportação da empresa de ponto ainda não confirmado. Construir
  importador flexível: suportar AFD/AEJ (formatos padronizados da Portaria 671)
  e CSV/Excel genérico com mapeamento de colunas configurável
- Exibir por funcionário/período: horas trabalhadas, faltas, atrasos, horas extras

## Segurança e LGPD (obrigatório)
- Autenticação obrigatória (Supabase Auth), sem acesso público a nenhum dado
- Perfis de acesso: **Admin/RH** (tudo) e **Funcionário** (só os próprios dados) —
  o perfil de funcionário pode ficar para uma segunda fase
- Row Level Security (RLS) habilitado em TODAS as tabelas do Supabase desde o início
- Documentos no Storage com políticas de acesso restritas (nunca buckets públicos)
- Registrar log de quem acessou/alterou dados sensíveis

## Roadmap sugerido
1. Setup do projeto (Vite + React + Supabase) e autenticação
2. Modelo de dados + módulo de funcionários (CRUD completo)
3. Módulo de documentos (upload/organização)
4. Geração de PDFs a partir de modelos
5. Integração Autentique
6. Importador de ponto
7. Deploy na Vercel + testes com dados reais

## Convenções de trabalho
- Commits pequenos e frequentes, com mensagens em português
- Antes de cada módulo novo, explicar o plano em termos simples e confirmar
- Ao final de cada sessão, atualizar a seção "Status atual" abaixo

## Status atual
- [x] Item 1 do roadmap concluído: projeto Vite + React + TypeScript criado,
  cliente Supabase configurado (`src/lib/supabase.ts`), autenticação por
  e-mail/senha funcionando (`AuthContext`, tela de `Login`, `ProtectedRoute`),
  Git local inicializado com commit inicial. Testado no navegador: tentativa de
  login chega ao Supabase e retorna erro de credenciais corretamente (ainda não
  há usuários cadastrados no projeto Supabase).
- [ ] Pendente: criar repositório no GitHub e conectar (usuário optou por
  Git local + GitHub); cadastrar o primeiro usuário Admin/RH no Supabase Auth
  para testar login real
- [ ] Próximo: item 2 do roadmap — modelo de dados + módulo de funcionários
  (CRUD completo), incluindo RLS nas tabelas desde o início
