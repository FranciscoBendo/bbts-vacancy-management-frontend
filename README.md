# BBTS — Gestão de Vagas · Frontend

Interface web para gestão de vagas, aprovação RH, importação de currículos via IA e ranking de candidatos.  
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
| --- | --- |
| `VITE_API_URL` | URL do backend (ex: `http://localhost:8000`) |
| `VITE_USE_MOCK` | `true` para usar MSW sem backend |

---

## Estrutura de pastas

```text
src/
├── app/
│   ├── router.tsx           # Rotas + guards por role
│   └── theme.ts
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx    # Login + Cadastro (toggle) com email/senha
│   │   └── authContext.tsx
│   ├── vacancies/
│   │   ├── VacanciesListPage.tsx
│   │   ├── VacancyCreatePage.tsx
│   │   ├── VacancyDetailsPage.tsx
│   │   └── hooks/
│   ├── approvals/
│   │   ├── ApprovalsQueuePage.tsx
│   │   └── hooks/
│   ├── candidates/
│   │   ├── CandidatesByVacancyPage.tsx  # Ranking + Recusar candidato + seção de recusados
│   │   ├── CandidatesListPage.tsx
│   │   ├── CandidateDetailPage.tsx
│   │   └── hooks/
│   │       ├── useCandidatesByVacancy.ts  # Retorna candidates, rejected, totalBeforeFilter, scoreThreshold
│   │       ├── useRejectCandidate.ts      # Recusa manual com justificativa
│   │       ├── useRescoreVacancy.ts
│   │       ├── useCandidates.ts
│   │       └── useCandidateDetail.ts
│   └── imports/
│       ├── ImportCandidatesPage.tsx     # PDF (IA) + CSV + JSON · dialog de resolução de duplicatas
│       ├── useImportPdf.ts              # useImportPdf · useResolveDuplicate
│       └── useImportCandidates.ts
├── shared/
│   ├── api/
│   │   ├── http.ts
│   │   └── endpoints.ts     # inclui REJECT_CANDIDATE · RESOLVE_DUPLICATE
│   ├── types/index.ts       # CandidateStatus · CandidateListByVacancy · DuplicateDetected
│   ├── components/
│   └── layouts/
└── mocks/
```

---

## Telas disponíveis

| Rota | Tela | Role |
| --- | --- | --- |
| `/login` | Login + Cadastro | Público |
| `/vacancies` | Lista de vagas | REQUESTER (só suas) / RH (todas) |
| `/vacancies/new` | Criar vaga | REQUESTER |
| `/vacancies/:id` | Detalhe + submeter | Autenticado |
| `/vacancies/:id/candidates` | Ranking + Recusar candidatos + seção de recusados | Autenticado |
| `/candidates` | Base de candidatos + filtros | Autenticado |
| `/candidates/:id` | Perfil completo | Autenticado |
| `/approvals` | Fila de aprovação | RH |
| `/candidates/import` | Import PDF / CSV / JSON · resolução de duplicatas | RH |

---

## Autenticação

A tela `/login` alterna entre dois modos:

**Login** — e-mail + senha

**Cadastro** — nome, e-mail, senha e perfil (Solicitante ou RH)

---

## Ranking e rejeição de candidatos

O ranking exibe apenas candidatos com score ≥ **40%**. O RH pode recusar candidatos manualmente clicando em **Recusar** na tabela e preenchendo a justificativa obrigatória.

Candidatos abaixo de 40% são automaticamente recusados pelo sistema ao aprovar ou atualizar o ranking.

Os candidatos recusados (automático ou manual) aparecem numa seção separada abaixo do ranking, com o motivo da recusa exibido.

A tela distingue dois cenários de lista vazia:

| Situação | Mensagem exibida |
| --- | --- |
| Vaga sem candidatos cadastrados | "Nenhum candidato encontrado para esta vaga." |
| Candidatos existem mas nenhum alcança 40% | "Nenhum candidato alcança o mínimo de 40% de score." |

Penalizações no score:

- **-30% por requisito obrigatório ausente**
- **-10% se o candidato não é da cidade da vaga**

---

## Importação de currículos via IA e detecção de duplicatas

1. RH acessa `/candidates/import` → aba **PDF (IA)**
2. Faz upload do currículo `.pdf`
3. O Groq (LLaMA 3.3 70B) extrai: nome, skills, experiências, formação, idiomas, certificações
4. O backend verifica se o e-mail extraído já está cadastrado no banco
5. **Sem duplicata:** dados normalizados e salvos — card de sucesso exibido com botão "Ver perfil completo"
6. **Com duplicata:** alerta exibido identificando o candidato existente com três opções:

| Opção | Comportamento |
| --- | --- |
| Atualizar cadastro existente | Sobrescreve os dados do candidato já cadastrado com os do novo PDF |
| Importar como candidato novo | Cria um novo registro sem e-mail para evitar conflito |
| Cancelar importação | Fecha o alerta sem persistir nada |

7. Candidato aparece no ranking ao clicar em **Atualizar Ranking**

---

## Próximas sprints

- [ ] Sprint 5: Dashboard com KPIs por vaga, role MANAGER
- [ ] Sprint 6: Exportação de ranking para CSV
- [ ] Sprint 7: Ranking explicativo por IA
