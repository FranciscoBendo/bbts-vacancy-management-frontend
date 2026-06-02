import { Box, Typography, Paper, Skeleton, Alert, Divider } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { AppPage } from '../../shared/components/AppPage';
import { useDashboard } from './useDashboard';

function KpiCard({ label, value, icon, color = 'primary.main' }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string;
}) {
  return (
    <Paper sx={{ p: 3, flex: '1 1 200px', minWidth: 180 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
          {label}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight={800} color={color}>{value}</Typography>
    </Paper>
  );
}

function StatusBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box mb={1.5}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={700}>{value} <Typography component="span" variant="caption" color="text.secondary">({pct}%)</Typography></Typography>
      </Box>
      <Box sx={{ bgcolor: 'grey.200', borderRadius: 2, height: 8 }}>
        <Box sx={{ bgcolor: color, borderRadius: 2, height: 8, width: `${pct}%`, transition: 'width 0.6s' }} />
      </Box>
    </Box>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isError) return <Alert severity="error">Erro ao carregar o dashboard.</Alert>;

  const total = data?.totalVacancies ?? 0;

  return (
    <AppPage title="Dashboard" subtitle="Visão geral do sistema de gestão de vagas"
      breadcrumbs={[{ label: 'Dashboard' }]}>

      {/* KPIs principais */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        {isLoading ? [1,2,3,4].map(i => <Skeleton key={i} variant="rounded" width={200} height={110} />) : (
          <>
            <KpiCard label="Total de Vagas" value={data!.totalVacancies} icon={<WorkIcon />} color="primary.main" />
            <KpiCard label="Candidatos Cadastrados" value={data!.totalCandidates} icon={<PeopleIcon />} color="info.main" />
            <KpiCard label="Score Médio" value={`${data!.averageScore}%`} icon={<EmojiEventsIcon />} color="success.main" />
            <KpiCard label="Candidatos Recusados" value={data!.totalRejectedCandidates} icon={<BlockIcon />} color="error.main" />
          </>
        )}
      </Box>

      {/* Vagas por status */}
      <Box display="flex" gap={3} flexWrap="wrap" alignItems="flex-start">
        <Paper sx={{ p: 3, flex: '1 1 300px' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Vagas por Status</Typography>
          <Divider sx={{ mb: 2 }} />
          {isLoading ? [1,2,3,4].map(i => <Skeleton key={i} height={36} sx={{ mb: 1 }} />) : (
            <>
              <StatusBar label="Rascunho" value={data!.vacanciesByStatus.draft} total={total} color="#9e9e9e" />
              <StatusBar label="Aguardando Aprovação" value={data!.vacanciesByStatus.pendingApproval} total={total} color="#ff9800" />
              <StatusBar label="Aprovadas" value={data!.vacanciesByStatus.approved} total={total} color="#4caf50" />
              <StatusBar label="Recusadas" value={data!.vacanciesByStatus.rejected} total={total} color="#f44336" />
            </>
          )}
        </Paper>

        {/* Resumo geral */}
        <Paper sx={{ p: 3, flex: '1 1 240px' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Resumo Geral</Typography>
          <Divider sx={{ mb: 2 }} />
          {isLoading ? [1,2,3].map(i => <Skeleton key={i} height={32} sx={{ mb: 1 }} />) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {[
                { icon: <CheckCircleIcon color="success" fontSize="small" />, label: 'Vagas aprovadas', value: data!.vacanciesByStatus.approved },
                { icon: <PendingActionsIcon color="warning" fontSize="small" />, label: 'Aguardando aprovação', value: data!.vacanciesByStatus.pendingApproval },
                { icon: <PeopleIcon color="info" fontSize="small" />, label: 'Candidatos no ranking', value: data!.totalSuggestions },
                { icon: <BlockIcon color="error" fontSize="small" />, label: 'Candidatos recusados', value: data!.totalRejectedCandidates },
              ].map(({ icon, label, value }) => (
                <Box key={label} display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>{icon}<Typography variant="body2">{label}</Typography></Box>
                  <Typography variant="body2" fontWeight={700}>{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </AppPage>
  );
}