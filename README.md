# BBTS — Gestão de Vagas · Frontend

Interface web para gestão de vagas, aprovação RH, importação de currículos via IA e ranking de candidatos.  
Stack: **React · TypeScript · Vite · Material UI · TanStack Query**

---

## Pré-requisitos

- Node.js 18 ou superior → [nodejs.org](https://nodejs.org) (recomendo versão LTS)
- npm — já vem com o Node
- Backend rodando em `http://localhost:8000`

```bash
node -v
npm -v
```

---

## Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/FMello-Dev/bbts-vacancy-management-frontend.git
cd bbts-vacancy-management-frontend/bbts-vagas

# 2. Instalar dependências
npm install

# 3. Registrar o Service Worker do MSW
npx msw init public/ --save

# 4. Configurar variáveis de ambiente
# Crie o arquivo .env na raiz de bbts-vagas/
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=false

# 5. Rodar
npm run dev
```

Acesse: **http://localhost:5173**

---

## Variáveis de ambiente

| Variável | Valor padrão | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | `http://localhost:8000` | URL do backend |
| `VITE_USE_MOCK` | `false` | `true` para usar dados mockados sem backend |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx           # Rotas + guards de autenticação por role
│   ├── providers.tsx
│   ├── queryClient.ts
│   └── theme.ts             # Tema MUI (cores BBTS)
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx    # Seleção de perfil (REQUESTER / RH)
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
│   │   ├── CandidatesListPage.tsx       # Base de candidatos + filtros (Sprint 3)
│   │   ├── CandidateDetailPage.tsx      # Perfil completo (Sprint 3)
│   │   └── hooks/
│   │       ├── useCandidatesByVacancy.ts  # Retorna candidates, totalBeforeFilter e scoreThreshold
│   │       ├── useRescoreVacancy.ts       # Recálculo de ranking sob demanda
│   │       ├── useCandidates.ts           # Sprint 3
│   │       └── useCandidateDetail.ts      # Sprint 3
│   └── imports/
│       ├── ImportCandidatesPage.tsx     # PDF (IA) + CSV + JSON
│       ├── useImportPdf.ts              # Sprint 3
│       └── useImportCandidates.ts
├── shared/
│   ├── api/
│   │   ├── http.ts          # Cliente HTTP + toCamel + auth header
│   │   └── endpoints.ts     # Todas as URLs da API
│   ├── types/
│   │   └── index.ts         # Todos os tipos TypeScript do domínio, incluindo CandidateListByVacancy
│   ├── components/          # AppButton, AppDialog, AppPage, AppSection...
│   ├── layouts/             # AppShell, SideNav, TopBar
│   └── utils/
└── mocks/                   # MSW handlers para dev sem backend
```

---

## Telas disponíveis

| Rota | Tela | Role |
|------|------|------|
| `/login` | Seleção de perfil | Todos |
| `/vacancies` | Lista de vagas | REQUESTER (só suas) / RH (todas) |
| `/vacancies/new` | Criar nova vaga | REQUESTER |
| `/vacancies/:id` | Detalhe + submeter para aprovação | Todos |
| `/vacancies/:id/candidates` | Ranking filtrado por score mínimo + Atualizar Ranking | Todos |
| `/candidates` | Base de candidatos com filtros por skill e localização | Todos |
| `/candidates/:id` | Perfil completo do candidato | Todos |
| `/approvals` | Fila de aprovação | RH |
| `/candidates/import` | Importar via PDF (IA), CSV ou JSON | RH |

---

## Login

| Botão | user_id | Role | Redireciona para |
|-------|---------|------|-----------------|
| Entrar como Solicitante | 1 | REQUESTER | `/vacancies` |
| Entrar como RH | 2 | RH | `/approvals` |

---

## Importação de currículos via IA

O fluxo de upload PDF funciona assim:

1. RH acessa `/candidates/import` → aba **PDF (IA)**
2. Faz upload do currículo `.pdf`
3. O frontend envia para `POST /candidates/import/pdf`
4. O backend envia o PDF para o **Groq**
5. O **Groq (LLaMA 3.3 70B)** extrai: nome, skills, experiências, formação, idiomas, certificações
6. Os dados são normalizados (sinônimos) e salvos no banco
7. O frontend exibe o perfil do candidato salvo + botão "Ver perfil completo"

---

## Ranking de candidatos, Atualizar Ranking e Filtro de Score Mínimo

O score de cada candidato é calculado automaticamente quando uma vaga é aprovada. Para recalcular o ranking após a importação de novos candidatos, utilize o botão **Atualizar Ranking** disponível na tela `/vacancies/:id/candidates`.

O botão aciona `POST /vacancies/:id/rescore` no backend, que apaga as sugestões existentes e recalcula o score para todos os candidatos cadastrados. A tabela é atualizada automaticamente ao término da operação.

### Filtro de score mínimo

O ranking exibe apenas candidatos com score maior ou igual a **30%**. Candidatos abaixo desse limiar são ocultados automaticamente. A tela distingue dois cenários de lista vazia:

| Situação | Mensagem exibida |
|---|---|
| Vaga sem candidatos cadastrados | "Nenhum candidato encontrado para esta vaga." |
| Candidatos existem mas nenhum alcança 30% | "Nenhum candidato alcança o mínimo de 30% de score." |

Essa distinção é possível porque o hook `useCandidatesByVacancy` expõe o campo `totalBeforeFilter` retornado pelo backend — se for maior que zero com lista vazia, significa que o filtro excluiu todos os candidatos.

---

## Integração com o backend

Toda comunicação passa por `src/shared/api/http.ts`:

- Adiciona `Authorization: Bearer <token>` automaticamente
- Converte respostas de `snake_case` → `camelCase` automaticamente
- Redireciona para `/login` em caso de 401

Para rodar sem backend (modo mock):
```env
VITE_USE_MOCK=true
```

---

## Próximas sprints

- [ ] Sprint 4: Dashboard com KPIs por vaga (total candidatos, score médio, gaps)
- [ ] Sprint 4: Role MANAGER com visão de área
- [ ] Sprint 5: Exportação de ranking para CSV
