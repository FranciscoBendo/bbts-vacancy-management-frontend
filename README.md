# BBTS — Gestão de Vagas · Frontend

Interface web para gestão de vagas, aprovação RH, importação de currículos via IA e ranking de candidatos.  
Stack: **React · TypeScript · Vite · Material UI · TanStack Query**

---

## Pré-requisitos

- Node.js 18+ → [nodejs.org](https://nodejs.org)
- npm — já vem com o Node
- Backend rodando em `http://localhost:8000`

---

## Instalação e execução

```bash
cd bbts-vacancy-management-frontend/bbts-vagas
npm install
npx msw init public/ --save
```

Crie o `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=false
```

```bash
npm run dev
```

Acesse: **http://localhost:5173**

---

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL do backend (ex: `http://localhost:8000`) |
| `VITE_USE_MOCK` | `true` para usar MSW sem backend |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx           # Rotas + guards de autenticação por role
│   ├── providers.tsx
│   ├── queryClient.ts
│   └── theme.ts
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx    # Login + Cadastro (toggle) com email/senha
│   │   └── authContext.tsx  # Contexto de autenticação + token
│   ├── vacancies/
│   │   ├── VacanciesListPage.tsx
│   │   ├── VacancyCreatePage.tsx
│   │   ├── VacancyDetailsPage.tsx
│   │   ├── components/
│   │   │   ├── RequirementsField.tsx
│   │   │   └── VacancyStatusChip.tsx
│   │   └── hooks/
│   │       ├── useVacancies.ts
│   │       ├── useVacancy.ts
│   │       ├── useCreateVacancy.ts
│   │       └── useSubmitVacancy.ts
│   ├── approvals/
│   │   ├── ApprovalsQueuePage.tsx
│   │   └── hooks/
│   │       ├── usePendingApprovals.ts
│   │       ├── useApproveVacancy.ts
│   │       └── useRejectVacancy.ts
│   ├── candidates/
│   │   ├── CandidatesByVacancyPage.tsx  # Ranking filtrado por score mínimo + Atualizar Ranking
│   │   ├── CandidatesListPage.tsx
│   │   ├── CandidateDetailPage.tsx
│   │   └── hooks/
│   │       ├── useCandidatesByVacancy.ts  # Retorna candidates, totalBeforeFilter e scoreThreshold
│   │       ├── useRescoreVacancy.ts
│   │       ├── useCandidates.ts
│   │       └── useCandidateDetail.ts
│   └── imports/
│       ├── ImportCandidatesPage.tsx     # PDF (IA) + CSV + JSON
│       ├── useImportPdf.ts
│       └── useImportCandidates.ts
├── shared/
│   ├── api/
│   │   ├── http.ts          # Cliente HTTP + toCamel + auth header
│   │   └── endpoints.ts     # Todas as URLs da API
│   ├── types/index.ts       # Todos os tipos TypeScript do domínio
│   ├── components/
│   ├── layouts/             # AppShell, SideNav, TopBar
│   └── utils/
└── mocks/
```

---

## Telas disponíveis

| Rota | Tela | Role |
|------|------|------|
| `/login` | Login + Cadastro | Público |
| `/vacancies` | Lista de vagas | REQUESTER (só suas) / RH (todas) |
| `/vacancies/new` | Criar nova vaga | REQUESTER |
| `/vacancies/:id` | Detalhe + submeter para aprovação | Autenticado |
| `/vacancies/:id/candidates` | Ranking filtrado por score mínimo + Atualizar Ranking | Autenticado |
| `/candidates` | Base de candidatos com filtros por skill e localização | Autenticado |
| `/candidates/:id` | Perfil completo do candidato | Autenticado |
| `/approvals` | Fila de aprovação | RH |
| `/candidates/import` | Importar via PDF (IA), CSV ou JSON | RH |

---

## Autenticação

A tela `/login` tem dois modos alternáveis:

**Login** — e-mail + senha  
**Cadastro** — nome, e-mail, senha e seleção de perfil (Solicitante ou RH)

Após autenticar, o token JWT é salvo no `sessionStorage` e enviado automaticamente em todas as requisições.

---

## Ranking de candidatos

O score é calculado automaticamente quando uma vaga é aprovada pelo RH. Se novos candidatos forem importados após a aprovação, clique em **Atualizar Ranking** na tela de candidatos da vaga para recalcular.

O ranking exibe apenas candidatos com score ≥ **40%**. A tela distingue dois cenários:

| Situação | Mensagem exibida |
|---|---|
| Vaga sem candidatos cadastrados | "Nenhum candidato encontrado para esta vaga." |
| Candidatos existem mas nenhum alcança 40% | "Nenhum candidato alcança o mínimo de 40% de score." |

Penalizações aplicadas no score:
- **-40% por requisito obrigatório ausente**
- **-10% se o candidato não é da cidade da vaga**

---

## Importação de currículos via IA

1. RH acessa `/candidates/import` → aba **PDF (IA)**
2. Faz upload do currículo `.pdf`
3. O backend envia para o **Groq (LLaMA 3.3 70B)**
4. A IA extrai: nome, skills, experiências, formação, idiomas, certificações
5. Dados são normalizados (sinônimos) e salvos no banco
6. Candidato aparece no ranking ao clicar em **Atualizar Ranking**

---

## Próximas sprints

- [ ] Sprint 4: Dashboard com KPIs por vaga (total candidatos, score médio, gaps)
- [ ] Sprint 4: Role MANAGER com visão de área
- [ ] Sprint 5: Exportação de ranking para CSV