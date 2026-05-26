import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { CandidateMatch } from '../../../shared/types';

interface RejectPayload { vacancyId: string; suggestionId: string; reason: string; }

export function useRejectCandidate() {
  const qc = useQueryClient();
  return useMutation<CandidateMatch, Error, RejectPayload>({
    mutationFn: ({ vacancyId, suggestionId, reason }) =>
      http.post(ENDPOINTS.REJECT_CANDIDATE(vacancyId, suggestionId), { reason }),
    onSuccess: (_, { vacancyId }) => {
      qc.invalidateQueries({ queryKey: ['candidates', vacancyId] });
    },
  });
}
