import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '../../shared/api/endpoints';
import { CandidateDetail, DuplicateDetected } from '../../shared/types';

const BASE = import.meta.env.VITE_API_URL ?? '';
const token = () => sessionStorage.getItem('bbts_token');

function toCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object')
    return Object.fromEntries(Object.entries(obj as Record<string,unknown>).map(([k,v]) => [k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()), toCamel(v)]));
  return obj;
}

// MODIFICAÇÃO — tipo de retorno alterado para incluir DuplicateDetected
export function useImportPdf() {
  return useMutation<CandidateDetail | DuplicateDetected, Error, File>({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${BASE}${ENDPOINTS.IMPORT_PDF}`, {
        method: 'POST',
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `HTTP ${res.status}`);
      return toCamel(data) as CandidateDetail | DuplicateDetected;
    },
  });
}

// NOVO HOOK — envia a decisão do RH para o backend
export function useResolveDuplicate() {
  return useMutation<CandidateDetail, Error, {
    action: 'create_new' | 'update' | 'cancel';
    extractedData: Record<string, unknown>;
    filename: string;
    existingCandidateId?: number;
  }>({
    mutationFn: async (body) => {
      // converte camelCase → snake_case antes de enviar
      const payload = {
        action: body.action,
        extracted_data: body.extractedData,
        filename: body.filename,
        existing_candidate_id: body.existingCandidateId,
      };
      const res = await fetch(`${BASE}${ENDPOINTS.RESOLVE_DUPLICATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `HTTP ${res.status}`);
      return toCamel(data) as CandidateDetail;
    },
  });
}
