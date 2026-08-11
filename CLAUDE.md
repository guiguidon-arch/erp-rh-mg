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
- [x] Primeiro usuário Admin/RH criado no Supabase Auth (guilherme@mgemp.com) e
  login testado com sucesso pelo usuário
- [x] Item 2 do roadmap (parcial): módulo de funcionários completo — tabelas
  `obras`, `funcionarios`, `dependentes`, `historico_funcionario` (migrations em
  `supabase/migrations/0001_funcionarios.sql` e `0002_tipo_contrato.sql`), CRUD
  de obras e funcionários, filtro por obra e status, cadastro de dependentes,
  histórico automático de mudanças de função/salário/obra/status. Testado e
  aprovado pelo usuário no navegador.
- [x] Módulo de documentos (item 2 do roadmap): upload de documentos por
  funcionário com categoria e data de vencimento (aviso visual de
  vencido/vencendo em breve), armazenado no Supabase Storage (bucket privado
  `documentos-funcionarios`, RLS restrita a usuários autenticados). Migration em
  `supabase/migrations/0003_documentos.sql`. Testado e aprovado pelo usuário.
- [x] Histórico de alterações corrigido para também registrar mudança de tipo
  de contrato (bug encontrado pelo usuário em teste manual). Migration
  `0004_historico_tipo_contrato.sql`.
- [x] Logo da empresa (M&G Empreendimentos) adicionada em `public/logo.png`,
  aparece no cabeçalho (Layout) e na tela de login
- [x] Redesign visual: fundo de página distinto dos cartões de conteúdo, cores
  da marca (dourado) substituindo o roxo padrão do template Vite
- [x] Repositório GitHub conectado e código enviado:
  github.com/guiguidon-arch/erp-rh-mg (GitHub estava fora do ar em
  2026-08-06, voltou em 2026-08-07)
- [x] Deploy em produção na Vercel: **https://erp-rh-mg.vercel.app** — feito
  para o usuário coletar feedback de um funcionário antes de continuar o
  roadmap (adianta parte do item 7). Variáveis de ambiente
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas no painel da
  Vercel. Todo push para `main` no GitHub deve disparar redeploy automático.
- [x] Bug de login em produção resolvido (2026-08-11): o valor de
  `VITE_SUPABASE_ANON_KEY` salvo na Vercel estava corrompido — os primeiros 8
  caracteres corretos seguidos de sinais de "•" mascarados, provavelmente por
  copiar a chave de um texto que exibia o valor mascarado em vez do valor
  real. Corrigido copiando a chave direto do Supabase (Project Settings → API
  → botão de copiar), não do chat nem do painel da Vercel. Login testado e
  funcionando em produção.
- [x] Datas exibidas no formato dd/mm/aaaa em toda a tela de detalhes do
  funcionário (`src/lib/formatters.ts`)
- [x] Usuário enviou os 4 modelos de documento + uma ficha de registro
  admissional real preenchida (formato .xlsx, usada por 7 funcionários
  diferentes na mesma planilha — cada aba é um funcionário). Comparei os
  campos da ficha com o cadastro do ERP e faltavam vários: CTPS, PIS/PASEP,
  título de eleitor, CNH (número/categoria/órgão/UF/datas), dados bancários
  (banco/agência/conta/tipo), vale-transporte, escolaridade, local de
  nascimento, raça/cor, estado civil, sexo, nome da mãe/pai, dados do cônjuge
  (CPF/nascimento/trabalha/dependente IR), e nos dependentes: CPF e
  "dependente de IR". Todos adicionados ao cadastro (migration
  `0005_dados_admissionais.sql`). Ficou de fora, por decisão do usuário:
  horário de trabalho detalhado por dia da semana (mantido o campo simples
  "Jornada") e os campos de aposentadoria/imóvel-FGTS da ficha (raramente
  usados, específicos da Caixa Econômica).
- [ ] Pendente: com os campos do cadastro agora completos, o próximo passo é
  recriar os 4 documentos (ficha de registro, contrato de experiência,
  contrato de prestação de serviços, ficha de EPI) como geração automática de
  PDF preenchido com os dados do funcionário (decisão do usuário: PDF direto
  no sistema, não preenchimento de Word — quer os documentos prontos para
  assinatura eletrônica). Isso é o item 3 do roadmap. Os arquivos-modelo estão
  em `C:\Users\guilh\Downloads\` (contratos em .docx, ficha de EPI em .xlsx) —
  ainda não analisados a fundo, só a ficha de registro foi mapeada campo a
  campo até agora. O usuário também mandou uma folha de ponto (.xlsx) — isso é
  para o item 4 do roadmap (importação de ponto), não usar agora.
- [ ] Sugerido ao usuário: criar um usuário Supabase Auth separado para o
  funcionário que vai testar (em vez de compartilhar a própria senha)
