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
│   ├── router.tsx
│   └── theme.ts
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx        # Login + Cadastro com email/senha
│   │   └── authContext.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx    # KPIs + vagas por status + resumo geral
│   │   └── useDashboard.ts
│   ├── vacancies/
│   │   ├── VacanciesListPage.tsx
│   │   ├── VacancyCreatePage.tsx
│   │   ├── VacancyDetailsPage.tsx  # botão "Buscar Candidatos Externos"
│   │   └── hooks/
│   ├── approvals/
│   │   ├── ApprovalsQueuePage.tsx
│   │   └── hooks/
│   ├── candidates/
│   │   ├── CandidatesByVacancyPage.tsx  # Ranking + aviso score ≥ 40% + Recusar + recusados
│   │   ├── CandidatesListPage.tsx
│   │   ├── CandidateDetailPage.tsx      # botão "Remover dados (LGPD)" para RH
│   │   └── hooks/
│   │       ├── useCandidatesByVacancy.ts
│   │       ├── useRejectCandidate.ts
│   │       ├── useRescoreVacancy.ts
│   │       ├── useCandidates.ts
│   │       ├── useCandidateDetail.ts
│   │       └── useAnonymizeCandidate.ts  # anonimização LGPD
│   └── imports/
│       ├── ImportCandidatesPage.tsx      # PDF (IA) + CSV + JSON · aviso LGPD · duplicatas
│       ├── useImportPdf.ts
│       ├── useImportExternal.ts
│       └── useImportCandidates.ts
├── shared/
│   ├── api/
│   │   ├── http.ts
│   │   └── endpoints.ts     # inclui REJECT_CANDIDATE · IMPORT_EXTERNAL · ANONYMIZE_CANDIDATE
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
| `/vacancies/:id/candidates` | Ranking + Recusar + seção de recusados | Autenticado |
| `/candidates` | Base de candidatos + filtros | Autenticado |
| `/candidates/:id` | Perfil completo + remover dados (LGPD) | Autenticado |
| `/approvals` | Fila de aprovação | RH |
| `/candidates/import` | Import PDF / CSV / JSON · aviso LGPD · duplicatas | RH |

---

## LGPD — Lei Geral de Proteção de Dados

O sistema implementa dois mecanismos de conformidade com a Lei 13.709/2018:

### Aviso de coleta na importação
Na tela `/candidates/import`, aba **PDF (IA)**, um banner amarelo informa ao RH que o candidato deve ter sido comunicado sobre o tratamento dos seus dados pessoais antes da importação.

### Remoção de dados pessoais
Na tela `/candidates/:id`, o botão **"Remover dados (LGPD)"** (visível apenas para RH) abre um dialog de confirmação explicando o que será removido. Após confirmar:

- Nome substituído por `Candidato Removido #ID`
- E-mail, LinkedIn e localização removidos
- Skills, experiências, formação, idiomas e certificações excluídos
- Histórico de scores mantido de forma anonimizada
- Ação registrada no log de auditoria do backend

---

## Dashboard

A tela `/dashboard` exibe KPIs principais, distribuição de vagas por status e resumo geral. Os candidatos recusados incluem tanto os recusados automaticamente (score < 40%) quanto os recusados manualmente pelo RH.

---

## Conector Externo

Na tela de detalhe de uma vaga aprovada, o botão **"Buscar Candidatos Externos"** busca perfis via randomuser.me, enriquece com skills dos requisitos da vaga e recalcula o ranking automaticamente.

---

## Autenticação

A tela `/login` alterna entre **Login** (e-mail + senha) e **Cadastro** (nome, e-mail, senha e perfil).

---

## Ranking e rejeição de candidatos

O ranking exibe apenas candidatos com score ≥ **40%**, com aviso informativo no topo. O RH pode recusar candidatos manualmente com justificativa obrigatória. Rejeições manuais são preservadas ao atualizar o ranking.

Penalizações no score:
- **-30% por requisito obrigatório ausente**
- **-10% se o candidato não é da cidade da vaga**

---

## Importação de currículos via IA

1. RH acessa `/candidates/import` → aba **PDF (IA)**
2. Confirma o aviso de LGPD
3. O Groq (LLaMA 3.3 70B) extrai os dados do currículo
4. Se e-mail duplicado: dialog com opção de atualizar, criar novo ou cancelar
5. Candidato salvo e disponível no ranking após **Atualizar Ranking**

---

## Próximas sprints

- [ ] Sprint 5: Role MANAGER com visão de área
- [ ] Sprint 6: Exportação de ranking para CSV
- [ ] Sprint 7: Ranking explicativo por IA, SSO