import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import { ENDPOINTS } from '../../../shared/api/endpoints';

export function useAnonymizeCandidate() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (candidateId: string) =>
      http.delete(ENDPOINTS.ANONYMIZE_CANDIDATE(candidateId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}