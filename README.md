# BBTS — Gestão de Vagas · Frontend

Interface web para gestão de vagas, aprovação RH, importação de currículos via IA, ranking de candidatos e dashboard.  
Stack: **React · TypeScript · Vite · Material UI · TanStack Query**

---

## Pré-requisitos

- Node.js 18+ → [nodejs.org](https://nodejs.org)
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
│   ├── router.tsx           # Rotas + guards por role
│   └── theme.ts
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx    # Login + Cadastro (toggle) com email/senha
│   │   └── authContext.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx # KPIs + vagas por status + resumo geral
│   │   └── useDashboard.ts
│   ├── vacancies/
│   │   ├── VacanciesListPage.tsx
│   │   ├── VacancyCreatePage.tsx
│   │   ├── VacancyDetailsPage.tsx  # + botão "Buscar Candidatos Externos"
│   │   └── hooks/
│   ├── approvals/
│   │   ├── ApprovalsQueuePage.tsx
│   │   └── hooks/
│   ├── candidates/
│   │   ├── CandidatesByVacancyPage.tsx  # Ranking + aviso score ≥ 40% + Recusar + seção recusados
│   │   ├── CandidatesListPage.tsx
│   │   ├── CandidateDetailPage.tsx
│   │   └── hooks/
│   │       ├── useCandidatesByVacancy.ts
│   │       ├── useRejectCandidate.ts
│   │       ├── useRescoreVacancy.ts
│   │       ├── useCandidates.ts
│   │       └── useCandidateDetail.ts
│   └── imports/
│       ├── ImportCandidatesPage.tsx     # PDF (IA) + CSV + JSON · resolução de duplicatas
│       ├── useImportPdf.ts
│       ├── useImportExternal.ts         # Conector externo (randomuser.me)
│       └── useImportCandidates.ts
├── shared/
│   ├── api/
│   │   ├── http.ts
│   │   └── endpoints.ts     # inclui REJECT_CANDIDATE · IMPORT_EXTERNAL
│   ├── types/index.ts
│   ├── components/
│   └── layouts/
└── mocks/
```

---

## Telas disponíveis

| Rota | Tela | Role |
|------|------|------|
| `/login` | Login + Cadastro | Público |
| `/dashboard` | KPIs e visão consolidada | Autenticado |
| `/vacancies` | Lista de vagas | REQUESTER (só suas) / RH (todas) |
| `/vacancies/new` | Criar vaga | REQUESTER |
| `/vacancies/:id` | Detalhe + submeter + buscar candidatos externos | Autenticado |
| `/vacancies/:id/candidates` | Ranking + Recusar candidatos + seção de recusados | Autenticado |
| `/candidates` | Base de candidatos + filtros | Autenticado |
| `/candidates/:id` | Perfil completo | Autenticado |
| `/approvals` | Fila de aprovação | RH |
| `/candidates/import` | Import PDF / CSV / JSON · resolução de duplicatas | RH |

---

## Dashboard

A tela `/dashboard` exibe:

- **KPIs principais:** total de vagas, candidatos cadastrados, score médio e candidatos recusados
- **Vagas por status:** barras proporcionais mostrando distribuição entre Draft, Aguardando, Aprovadas e Recusadas
- **Resumo geral:** visão consolidada com os números mais relevantes do sistema

Os candidatos recusados incluem tanto os recusados automaticamente (score < 40%) quanto os recusados manualmente pelo RH.

---

## Conector Externo

Na tela de detalhe de uma vaga aprovada, o botão **"Buscar Candidatos Externos"** aciona `POST /vacancies/:id/import-external`, que busca perfis via **randomuser.me**, enriquece com skills baseadas nos requisitos da vaga e recalcula o ranking automaticamente. Um Snackbar confirma o resultado da operação.

---

## Autenticação

A tela `/login` alterna entre dois modos:

**Login** — e-mail + senha  
**Cadastro** — nome, e-mail, senha e perfil (Solicitante ou RH)

---

## Ranking e rejeição de candidatos

O ranking exibe apenas candidatos com score ≥ **40%**, com aviso informativo no topo. O RH pode recusar candidatos manualmente clicando em **Recusar** e preenchendo a justificativa obrigatória. Rejeições manuais são preservadas ao atualizar o ranking.

Os candidatos recusados (automático ou manual) aparecem numa seção separada abaixo do ranking, com o motivo da recusa exibido.

| Situação | Mensagem exibida |
|---|---|
| Vaga sem candidatos cadastrados | "Nenhum candidato encontrado para esta vaga." |
| Candidatos existem mas nenhum alcança 40% | "Nenhum candidato alcança o mínimo de 40% de score." |

Penalizações no score:
- **-30% por requisito obrigatório ausente**
- **-10% se o candidato não é da cidade da vaga**

---

## Importação de currículos via IA e detecção de duplicatas

1. RH acessa `/candidates/import` → aba **PDF (IA)**
2. O Groq (LLaMA 3.3 70B) extrai: nome, skills, experiências, formação, idiomas, certificações
3. O backend verifica se o e-mail já está cadastrado
4. **Sem duplicata:** candidato salvo, card de sucesso exibido
5. **Com duplicata:** alerta com três opções:

| Opção | Comportamento |
|---|---|
| Atualizar cadastro existente | Sobrescreve os dados do candidato já cadastrado |
| Importar como candidato novo | Cria novo registro sem e-mail para evitar conflito |
| Cancelar importação | Fecha o alerta sem persistir nada |

---

## Próximas sprints

- [ ] Sprint 5: Role MANAGER com visão de área
- [ ] Sprint 6: Exportação de ranking para CSV
- [ ] Sprint 7: Ranking explicativo por IA, SSO