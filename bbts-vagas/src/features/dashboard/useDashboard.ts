import { useQuery } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import { DashboardData } from '../../shared/types';

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => http.get(ENDPOINTS.DASHBOARD),
  });
}