import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';

interface ImportExternalResult {
  imported: number;
  skipped: number;
  message: string;
}

export function useImportExternal(vacancyId: string) {
  const qc = useQueryClient();
  return useMutation<ImportExternalResult, Error, number>({
    mutationFn: (count: number) =>
      http.post(ENDPOINTS.IMPORT_EXTERNAL(vacancyId), undefined, {
        params: { count: String(count) },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates', vacancyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}