import { useQuery } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { CandidateExplanation, CandidateMatch } from '../../../shared/types';

interface __BackendCandidate__ {
  id: number; vacancyId: number; candidateId: number;
  fullName: string; headline: string; location: string;
  score: number; explanation: CandidateExplanation; 
}
  interface __BackendResponse__ {
  candidates: __BackendCandidate__[];
  totalBeforeFilter: number;
  scoreThreshold: number;
}
export interface CandidateListByVacancy {
  candidates: CandidateMatch[];
  totalBeforeFilter: number;
  scoreThreshold: number;
}

export function useCandidatesByVacancy(vacancyId: string) {
return useQuery<CandidateListByVacancy>({ 
    queryKey: ['candidates', vacancyId],
    queryFn: () =>
       http.get<__BackendResponse__>(ENDPOINTS.CANDIDATES(vacancyId)).then((res) => ({
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
