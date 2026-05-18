import { useQuery } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { CandidateMatch, CandidateExplanation } from '../../../shared/types';

// ── MODIFICAÇÃO 1 ──────────────────────────────────────────────────────────────
// Removido import de CandidateExplanation — não era utilizado diretamente
// neste hook (estava sendo herdado de CandidateMatch).
// ──────────────────────────────────────────────────────────────────────────────

interface __BackendCandidate__ {
  id: number; vacancyId: number; candidateId: number;
  fullName: string; headline: string; location: string;
  score: number; explanation: CandidateExplanation;      // ← tipo correto
}

// ── MODIFICAÇÃO 2 ──────────────────────────────────────────────────────────────
// Adicionada interface __BackendResponse__ para tipar a nova estrutura retornada
// pelo backend após as mudanças no router.py e service.py.
//
// ANTES: o backend retornava diretamente um array de candidatos → BackendCandidate[]
// DEPOIS: o backend retorna um objeto com três campos:
//   - candidates: lista de candidatos filtrados (score >= 30%)
//   - totalBeforeFilter: total de candidatos antes do filtro de score
//   - scoreThreshold: limiar aplicado (30.0)
//
// Esse formato permite ao frontend distinguir "vaga sem candidatos" de
// "candidatos existem mas nenhum alcança o mínimo de score".
// ──────────────────────────────────────────────────────────────────────────────
interface __BackendResponse__ {
  candidates: __BackendCandidate__[];
  totalBeforeFilter: number;
  scoreThreshold: number;
}

// ── MODIFICAÇÃO 3 ──────────────────────────────────────────────────────────────
// Adicionada interface CandidateListByVacancy para tipar o retorno do hook.
// Exportada para que o componente CandidatesByVacancyPage possa desestruturar
// os campos com segurança via TypeScript.
// ──────────────────────────────────────────────────────────────────────────────
export interface CandidateListByVacancy {
  candidates: CandidateMatch[];
  totalBeforeFilter: number;
  scoreThreshold: number;
}

export function useCandidatesByVacancy(vacancyId: string) {

  // ── MODIFICAÇÃO 4 ──────────────────────────────────────────────────────────
  // Tipo genérico do useQuery alterado de CandidateMatch[] para
  // CandidateListByVacancy — reflete o novo formato de resposta do backend.
  // ──────────────────────────────────────────────────────────────────────────
  return useQuery<CandidateListByVacancy>({                    // era: useQuery<CandidateMatch[]>
    queryKey: ['candidates', vacancyId],
    queryFn: () =>

      // ── MODIFICAÇÃO 5 ────────────────────────────────────────────────────
      // Tipo genérico do http.get alterado de BackendCandidate[] para
      // BackendResponse — o http.ts converte snake_case → camelCase
      // automaticamente, então total_before_filter chega como totalBeforeFilter
      // e score_threshold como scoreThreshold.
      // ────────────────────────────────────────────────────────────────────
      http.get<__BackendResponse__>(ENDPOINTS.CANDIDATES(vacancyId)).then((res) => ({

        // ── MODIFICAÇÃO 6 ──────────────────────────────────────────────────
        // ANTES: o .then() mapeava diretamente sobre a lista (list.map(...))
        // DEPOIS: o .then() acessa res.candidates antes de mapear, e repassa
        // os metadados totalBeforeFilter e scoreThreshold sem transformação.
        // ──────────────────────────────────────────────────────────────────
        candidates: res.candidates.map((c) => ({               // era: list.map((c) => ({
          candidateId: String(c.candidateId),
          fullName: c.fullName,
          headline: c.headline,
          location: c.location,
          score: c.score,
          explanation: c.explanation,
        })),
        totalBeforeFilter: res.totalBeforeFilter,
        scoreThreshold: res.scoreThreshold,
      })),
    enabled: !!vacancyId,
  });
}