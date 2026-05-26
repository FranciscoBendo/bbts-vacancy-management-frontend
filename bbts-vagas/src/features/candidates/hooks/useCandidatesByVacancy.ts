import { useQuery } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { CandidateListByVacancy } from '../../../shared/types';

export function useCandidatesByVacancy(vacancyId: string) {
  return useQuery<CandidateListByVacancy>({
    queryKey: ['candidates', vacancyId],
    queryFn: () => http.get(ENDPOINTS.CANDIDATES(vacancyId)),
    enabled: !!vacancyId,
  });
}
