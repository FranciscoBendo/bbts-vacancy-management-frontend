import {
  Box, Typography, Chip, Alert, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
} from '@mui/material';
// sem Grid
import { useParams, useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useState } from 'react';
import { Snackbar } from '@mui/material';
import { useImportExternal } from '../imports/useImportExternal';
import { useVacancy } from './hooks/useVacancy';
import { useSubmitVacancy } from './hooks/useSubmitVacancy';
import { VacancyStatusChip } from './components/VacancyStatusChip';
import { AppPage } from '../../shared/components/AppPage';
import { AppSection } from '../../shared/components/AppSection';
import { AppButton } from '../../shared/components/AppButton';
import { useAuth } from '../auth/authContext';

const TYPE_LABEL: Record<string, string> = {
  SKILL: 'Habilidade',
  LANGUAGE: 'Idioma',
  CERTIFICATION: 'Certificação',
  EDUCATION: 'Formação',
  COMPANY: 'Empresa',
  LOCATION: 'Localização',
};

export default function VacancyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: vacancy, isLoading, isError } = useVacancy(id!);
  const { mutate: submit, isPending: isSubmitting } = useSubmitVacancy(id!);
  const { mutate: importExternal, isPending: isImporting } = useImportExternal(id!);
  const [snackMsg, setSnackMsg] = useState('');

  if (isLoading) {
    return (
      <Box p={1}>
        <Skeleton height={40} width={300} sx={{ mb: 1 }} />
        <Skeleton height={200} />
      </Box>
    );
  }

  if (isError || !vacancy) {
    return <Alert severity="error">Vaga não encontrada ou erro ao carregar.</Alert>;
  }

  const canSubmit = user?.role === 'REQUESTER' && vacancy.status === 'DRAFT';
  const canViewCandidates = vacancy.status === 'APPROVED';

  return (
    <AppPage
      title={vacancy.title}
      breadcrumbs={[
        { label: 'Vagas', href: '/vacancies' },
        { label: vacancy.title },
      ]}
      actions={
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <AppButton
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/vacancies`, {replace: true})}
          >
            Voltar
          </AppButton>
          {canSubmit && (
            <AppButton
              variant="contained"
              color="secondary"
              startIcon={<SendIcon />}
              loading={isSubmitting}
              onClick={() => submit()}
            >
              Enviar para Aprovação
            </AppButton>
          )}
          {canViewCandidates && (
            <AppButton
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => navigate(`/vacancies/${id}/candidates`)}
            >
              Ver Candidatos
            </AppButton>
          )}
          {canViewCandidates && (
            <AppButton
              variant="outlined"
              color="info"
              startIcon={<CloudDownloadIcon />}
              loading={isImporting}
              onClick={() =>
                importExternal(10, {
                onSuccess: (res) => setSnackMsg(res.message),
                onError: (e) => setSnackMsg(`Erro: ${e.message}`),
                })
              }
            >
              Buscar Candidatos Externos
            </AppButton>
            )}
            <Snackbar
                open={!!snackMsg}
                autoHideDuration={4000}
                onClose={() => setSnackMsg('')}
                message={snackMsg}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box> 
      }
    >
      {vacancy.status === 'REJECTED' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Esta vaga foi recusada pelo RH.
        </Alert>
      )}
      {vacancy.status === 'PENDING_APPROVAL' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta vaga está aguardando aprovação do RH.
        </Alert>
      )}
      {vacancy.status === 'APPROVED' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Vaga aprovada! Você já pode visualizar os candidatos sugeridos.
        </Alert>
      )}

      {/* Layout: coluna principal + sidebar, sem Grid */}
      <Box
        display="flex"
        gap={3}
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="flex-start"
      >
        {/* Coluna principal */}
        <Box flex="1" minWidth={0}>
          <AppSection title="Descrição">
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              {vacancy.description}
            </Typography>
          </AppSection>

          <AppSection title="Requisitos" noPadding>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Requisito</TableCell>
                  <TableCell align="center">Peso</TableCell>
                  <TableCell align="center">Obrigatório</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vacancy.requirements?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Chip
                        label={TYPE_LABEL[req.type] ?? req.type}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {req.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {req.weight}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={req.mandatory ? 'Sim' : 'Não'}
                        size="small"
                        color={req.mandatory ? 'error' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AppSection>
        </Box>

        {/* Sidebar */}
        <Box width={{ xs: '100%', md: 300 }} flexShrink={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2.5}>
              Detalhes
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Status
                </Typography>
                <Box mt={0.5}>
                  <VacancyStatusChip status={vacancy.status} />
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Localização
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{vacancy.location}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Prioridade
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={vacancy.priority}
                    size="small"
                    color={
                      vacancy.priority === 'CRITICAL'
                        ? 'error'
                        : vacancy.priority === 'HIGH'
                        ? 'warning'
                        : vacancy.priority === 'MEDIUM'
                        ? 'info'
                        : 'default'
                    }
                  />
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Criada em
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {new Date(vacancy.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </AppPage>
  );
}