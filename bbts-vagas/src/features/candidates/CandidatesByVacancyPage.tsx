import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Skeleton, Alert, Box, Typography, LinearProgress, Chip,
  TextField, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCandidatesByVacancy } from './hooks/useCandidatesByVacancy';
import { useRescoreVacancy } from './hooks/useRescoreVacancy';
import { useRejectCandidate } from './hooks/useRejectCandidate';
import { AppPage } from '../../shared/components/AppPage';
import { AppSection } from '../../shared/components/AppSection';
import { AppButton } from '../../shared/components/AppButton';
import { AppDialog } from '../../shared/components/AppDialog';
import type { CandidateMatch } from '../../shared/types';
import { useAuth } from '../auth/authContext';

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'success' : score >= 60 ? 'warning' : 'error';
  return (
    <Box display="flex" alignItems="center" gap={1.5} minWidth={120}>
      <LinearProgress variant="determinate" value={score} color={color} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
      <Typography variant="body2" fontWeight={700} minWidth={36}>{score}%</Typography>
    </Box>
  );
}

function CandidateDetailDialog({ selected, onClose }: { selected: CandidateMatch | null; onClose: () => void }) {
  if (!selected) return null;
  return (
    <AppDialog open={!!selected} onClose={onClose} title={selected.fullName} maxWidth="sm"
      actions={<AppButton variant="contained" onClick={onClose}>Fechar</AppButton>}>
      <Typography variant="body2" color="text.secondary" mb={3}>{selected.headline}</Typography>
      <Box sx={{ bgcolor: 'primary.light', borderRadius: 3, p: 2.5, mb: 3, display: 'flex', gap: 3 }}>
        <Box textAlign="center">
          <Typography variant="h3" fontWeight={800} color="primary.main">{selected.score}</Typography>
          <Typography variant="caption" color="primary.main" fontWeight={600}>Score</Typography>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {selected.explanation.metRequirements} de {selected.explanation.totalRequirements} requisitos atendidos
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
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Pontos Fortes</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {selected.explanation.strengths.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', mt: 0.8, flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">{s}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {selected.explanation.missingMandatory.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Requisitos Obrigatórios Ausentes</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {selected.explanation.missingMandatory.map((m) => (
              <Chip key={m} label={m} size="small" color="error" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
      {selected.explanation.locationMatch === false && (
        <Box sx={{ bgcolor: 'warning.light', borderRadius: 2, p: 1.5 }}>
          <Typography variant="caption" color="warning.dark" fontWeight={600}>
            ⚠️ Candidato fora da localização da vaga (-10% no score)
          </Typography>
        </Box>
      )}
    </AppDialog>
  );
}

export default function CandidatesByVacancyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRH = user?.role === 'RH';

  const { data, isLoading, isError } = useCandidatesByVacancy(id!);
  const { mutate: rescore, isPending: isRescoring } = useRescoreVacancy(id!);
  const { mutate: rejectCandidate, isPending: isRejecting } = useRejectCandidate();

  const [selected, setSelected] = useState<CandidateMatch | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CandidateMatch | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const handleReject = () => {
    if (!rejectReason.trim()) { setReasonError('Justificativa é obrigatória'); return; }
    if (!rejectTarget) return;
    rejectCandidate(
      { vacancyId: id!, suggestionId: rejectTarget.id, reason: rejectReason },
      { onSuccess: () => { setRejectTarget(null); setRejectReason(''); } }
    );
  };

  const candidates = data?.candidates ?? [];
  const rejected = data?.rejected ?? [];
  const totalBeforeFilter = data?.totalBeforeFilter ?? 0;
  const scoreThreshold = data?.scoreThreshold ?? 40;

  return (
    <AppPage
      title="Candidatos Sugeridos"
      subtitle="Ranking por compatibilidade com os requisitos da vaga"
      breadcrumbs={[{ label: 'Vagas', href: '/vacancies' }, { label: 'Detalhes', href: `/vacancies/${id}` }, { label: 'Candidatos' }]}
      actions={
        <Box display="flex" gap={1.5}>
          {isRH && (
            <AppButton variant="outlined" color="warning" startIcon={<RefreshIcon />}
              onClick={() => rescore()} loading={isRescoring} disabled={isRescoring}>
              {isRescoring ? 'Atualizando...' : 'Atualizar Ranking'}
            </AppButton>
          )}
          <AppButton variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/vacancies/${id}`, { replace: true })}>
            Voltar à Vaga
          </AppButton>
        </Box>
      }
    >
      {isError && <Alert severity="error" sx={{ mb: 3 }}>Erro ao carregar candidatos.</Alert>}

      {/* Ranking ativo */}
      <AppSection noPadding>
        {isLoading ? (
          <Box p={3}>{[1,2,3].map((i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)}</Box>
        ) : candidates.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              {totalBeforeFilter === 0
                ? 'Nenhum candidato encontrado para esta vaga.'
                : `Nenhum candidato alcança o mínimo de ${scoreThreshold}% de score.`}
            </Typography>
          </Box>
        ) : (
          <>
            <Alert severity="info" sx={{ m: 2, mb: 1 }}>
              Exibindo apenas candidatos com score ≥ <strong>{scoreThreshold}%</strong>.
              {rejected.length > 0 && ` ${rejected.length} candidato(s) foram recusados ou não atingiram o mínimo.`}
            </Alert>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={48}>#</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Headline</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Resumo</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c, index) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {index === 0
                      ? <EmojiEventsIcon sx={{ color: '#F5A800', fontSize: 20 }} />
                      : <Typography variant="body2" color="text.disabled" fontWeight={600}>{index + 1}</Typography>}
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700}>{c.fullName}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.headline}
                    </Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{c.location}</Typography></TableCell>
                  <TableCell><ScoreBar score={c.score} /></TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      Atendeu <strong>{c.explanation.metRequirements}/{c.explanation.totalRequirements}</strong>
                      {c.explanation.missingMandatory.length > 0 && <> — faltou: {c.explanation.missingMandatory.join(', ')}</>}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <AppButton size="small" variant="outlined" startIcon={<InfoOutlinedIcon />} onClick={() => setSelected(c)}>Ver</AppButton>
                      {isRH && (
                        <AppButton size="small" variant="outlined" color="error" startIcon={<BlockIcon />}
                          onClick={() => { setRejectTarget(c); setRejectReason(''); setReasonError(''); }}>
                          Recusar
                        </AppButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )}
      </AppSection>

      {/* Candidatos recusados */}
      {rejected.length > 0 && (
        <Box mt={3}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <BlockIcon color="error" fontSize="small" />
                <Typography fontWeight={600}>Candidatos Recusados ({rejected.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Motivo da Recusa</TableCell>
                    <TableCell align="center">Detalhes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rejected.map((c) => (
                    <TableRow key={c.id} sx={{ bgcolor: 'error.50', opacity: 0.85 }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{c.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.location}</Typography>
                      </TableCell>
                      <TableCell><ScoreBar score={c.score} /></TableCell>
                      <TableCell>
                        <Typography variant="caption" color="error.main">{c.rejectionReason}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <AppButton size="small" variant="outlined" startIcon={<InfoOutlinedIcon />} onClick={() => setSelected(c)}>Ver</AppButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Dialog detalhe */}
      <CandidateDetailDialog selected={selected} onClose={() => setSelected(null)} />

      {/* Dialog recusa manual */}
      <AppDialog
        open={!!rejectTarget} onClose={() => setRejectTarget(null)}
        title={`Recusar candidato: ${rejectTarget?.fullName ?? ''}`} maxWidth="sm"
        actions={
          <>
            <AppButton variant="outlined" onClick={() => setRejectTarget(null)}>Cancelar</AppButton>
            <AppButton variant="contained" color="error" loading={isRejecting} onClick={handleReject}>
              Confirmar Recusa
            </AppButton>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary" mb={2}>
          Informe o motivo da recusa. O candidato será movido para a seção de recusados.
        </Typography>
        <TextField
          label="Justificativa"
          multiline rows={4} fullWidth
          value={rejectReason}
          onChange={(e) => { setRejectReason(e.target.value); if (e.target.value.trim()) setReasonError(''); }}
          error={!!reasonError}
          helperText={reasonError || 'Seja específico para registrar o motivo corretamente'}
          placeholder="Ex: Perfil não atende ao nível de experiência exigido para a posição..."
        />
      </AppDialog>
    </AppPage>
  );
}
