import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Skeleton, Alert, Box, Typography, LinearProgress, Chip,
} from '@mui/material';
import { useParams, useNavigate, replace } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useCandidatesByVacancy } from './hooks/useCandidatesByVacancy';
import { AppPage } from '../../shared/components/AppPage';
import { AppSection } from '../../shared/components/AppSection';
import { AppButton } from '../../shared/components/AppButton';
import { AppDialog } from '../../shared/components/AppDialog';
import type { CandidateMatch } from '../../shared/types';
// ADICIONAR junto aos imports existentes
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRescoreVacancy } from './hooks/useRescoreVacancy';

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 85 ? 'success' :
    score >= 60 ? 'warning' : 'error';

  return (
    <Box display="flex" alignItems="center" gap={1.5} minWidth={120}>
      <LinearProgress
        variant="determinate"
        value={score}
        color={color}
        sx={{ flex: 1, height: 8, borderRadius: 4 }}
      />
      <Typography variant="body2" fontWeight={700} minWidth={36}>
        {score}%
      </Typography>
    </Box>
  );
}

export default function CandidatesByVacancyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: candidates, isLoading, isError } = useCandidatesByVacancy(id!);
  const [selected, setSelected] = useState<CandidateMatch | null>(null);

  // ADICIONAR estas duas linhas
  const { mutate: rescore, isPending: isRescoring } = useRescoreVacancy(id!);

  return (
    <AppPage
      title="Candidatos Sugeridos"
      subtitle="Ranking por compatibilidade com os requisitos da vaga"
      breadcrumbs={[
        { label: 'Vagas', href: '/vacancies' },
        { label: 'Detalhes', href: `/vacancies/${id}` },
        { label: 'Candidatos' },
      ]}
      actions={
  <Box display="flex" gap={1.5}>
    <AppButton
      variant="outlined"
      color="warning"
      startIcon={<RefreshIcon />}
      onClick={() => rescore()}
      loading={isRescoring}
      disabled={isRescoring}
    >
      {isRescoring ? 'Atualizando...' : 'Atualizar Ranking'}
    </AppButton>
    <AppButton
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(`/vacancies/${id}`, { replace: true })}
    >
      Voltar à Vaga
    </AppButton>
  </Box>
}
    >
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar candidatos.
        </Alert>
      )}

      <AppSection noPadding>
        {isLoading ? (
          <Box p={3}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={52} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : !candidates || candidates.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              Nenhum candidato encontrado para esta vaga
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={48}>#</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Título / Headline</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Resumo</TableCell>
                <TableCell align="center">Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c, index) => (
                <TableRow key={c.candidateId}>
                  <TableCell>
                    {index === 0 ? (
                      <EmojiEventsIcon sx={{ color: '#F5A800', fontSize: 20 }} />
                    ) : (
                      <Typography variant="body2" color="text.disabled" fontWeight={600}>
                        {index + 1}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {c.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {c.headline}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {c.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <ScoreBar score={c.score} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      Atendeu{' '}
                      <strong>
                        {c.explanation.metRequirements}/{c.explanation.totalRequirements}
                      </strong>
                      {c.explanation.missingMandatory.length > 0 && (
                        <> — faltou: {c.explanation.missingMandatory.join(', ')}</>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <AppButton
                      size="small"
                      variant="outlined"
                      startIcon={<InfoOutlinedIcon />}
                      onClick={() => setSelected(c)}
                    >
                      Ver
                    </AppButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AppSection>

      {/* Dialog de explicação detalhada */}
      <AppDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.fullName ?? ''}
        maxWidth="sm"
        actions={
          <AppButton variant="contained" onClick={() => setSelected(null)}>
            Fechar
          </AppButton>
        }
      >
        {selected && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {selected.headline}
            </Typography>

            <Box
              sx={{
                bgcolor: 'primary.light',
                borderRadius: 3,
                p: 2.5,
                mb: 3,
                display: 'flex',
                gap: 3,
              }}
            >
              <Box textAlign="center">
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  {selected.score}
                </Typography>
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  Score
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {selected.explanation.metRequirements} de{' '}
                  {selected.explanation.totalRequirements} requisitos atendidos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selected.explanation.missingMandatory.length === 0
                    ? 'Todos os requisitos obrigatórios foram atendidos'
                    : `${selected.explanation.missingMandatory.length} requisito(s) obrigatório(s) em falta`}
                </Typography>
              </Box>
            </Box>



            {selected.explanation.strengths.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Pontos Fortes
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {selected.explanation.strengths.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          mt: 0.8,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {s}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {selected.explanation.missingMandatory.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  Requisitos Obrigatórios Ausentes
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {selected.explanation.missingMandatory.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            {selected.explanation.locationMatch === false && (
  <Box mt={2} sx={{ bgcolor: 'warning.light', borderRadius: 2, p: 1.5 }}>
    <Typography variant="caption" color="warning.dark" fontWeight={600}>
      ⚠️ Candidato fora da localização da vaga (-10% no score)
    </Typography>
  </Box>
)}
          </Box>
        )}
      </AppDialog>
    </AppPage>
  );
}