import { Box, Typography, Chip, Skeleton, Alert, Paper, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import TranslateIcon from '@mui/icons-material/Translate';
import VerifiedIcon from '@mui/icons-material/Verified';
import CodeIcon from '@mui/icons-material/Code';
import { useCandidateDetail } from './hooks/useCandidateDetail';
import { AppPage } from '../../shared/components/AppPage';
import { AppSection } from '../../shared/components/AppSection';
import { AppButton } from '../../shared/components/AppButton';
import { useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AppDialog } from '../../shared/components/AppDialog';
import { useAnonymizeCandidate } from './hooks/useAnonymizeCandidate';
import { useAuth } from '../auth/authContext';


const LEVEL_COLOR: Record<string, 'default'|'info'|'warning'|'success'> = {
  'básico':'default','intermediário':'info','avançado':'success','fluente':'success',
};

export default function CandidateDetailPage() {
  const { user } = useAuth();
  const isRH = user?.role === 'RH';
  const { mutate: anonymize, isPending: isAnonymizing } = useAnonymizeCandidate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: c, isLoading, isError } = useCandidateDetail(id!);

  if (isLoading) return <Box p={3}><Skeleton height={40} width={300} sx={{ mb:1 }} /><Skeleton height={200} /></Box>;
  if (isError || !c) return <Alert severity="error">Candidato não encontrado.</Alert>;

  return (
    <AppPage title={c.fullName} subtitle={c.headline} breadcrumbs={[{ label: 'Candidatos', href: '/candidates' }, { label: c.fullName }]}
      actions={
  <Box display="flex" gap={1.5}>
    <AppButton variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
      Voltar
    </AppButton>
    {isRH && (
      <AppButton
        variant="outlined"
        color="error"
        startIcon={<DeleteForeverIcon />}
        onClick={() => setConfirmOpen(true)}
      >
        Remover dados (LGPD)
      </AppButton>
    )}
  </Box>
}>
      <Box display="flex" gap={3} flexDirection={{ xs:'column', md:'row' }} alignItems="flex-start">
        <Box flex="1" minWidth={0}>
          <AppSection title="Skills">
            <Box display="flex" alignItems="center" gap={1} mb={2}><CodeIcon color="primary" /><Typography variant="h6" fontWeight={700}>Habilidades</Typography></Box>
            {c.skills.length === 0 ? <Typography variant="body2" color="text.secondary">Nenhuma skill cadastrada</Typography> : (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {c.skills.map(s => (
                  <Chip key={s.id} label={`${s.name}${s.yearsExperience ? ` · ${s.yearsExperience}a` : ''}${s.level ? ` · ${s.level}` : ''}`}
                    size="small" color={LEVEL_COLOR[s.level?.toLowerCase() ?? ''] ?? 'default'} variant="outlined" />
                ))}
              </Box>
            )}
          </AppSection>

          <AppSection title="Experiência">
            <Box display="flex" alignItems="center" gap={1} mb={2}><WorkIcon color="primary" /><Typography variant="h6" fontWeight={700}>Experiências</Typography></Box>
            {c.experiences.length === 0 ? <Typography variant="body2" color="text.secondary">Nenhuma experiência</Typography> : c.experiences.map(e => (
              <Box key={e.id} mb={2}>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box><Typography variant="body1" fontWeight={700}>{e.role}</Typography><Typography variant="body2" color="text.secondary">{e.company}</Typography></Box>
                  <Typography variant="caption" color="text.disabled" alignSelf="center">{e.startYear ?? '?'} — {e.current ? 'atual' : (e.endYear ?? '?')}</Typography>
                </Box>
                <Divider sx={{ mt: 1.5 }} />
              </Box>
            ))}
          </AppSection>

          <AppSection title="Formação">
            <Box display="flex" alignItems="center" gap={1} mb={2}><SchoolIcon color="primary" /><Typography variant="h6" fontWeight={700}>Educação</Typography></Box>
            {c.educations.length === 0 ? <Typography variant="body2" color="text.secondary">Nenhuma formação</Typography> : c.educations.map(e => (
              <Box key={e.id} mb={2}>
                <Typography variant="body1" fontWeight={700}>{e.course}</Typography>
                <Typography variant="body2" color="text.secondary">{e.institution}{e.degree ? ` · ${e.degree}` : ''}</Typography>
                {e.graduationYear && <Typography variant="caption" color="text.disabled">Conclusão: {e.graduationYear}</Typography>}
                <Divider sx={{ mt: 1.5 }} />
              </Box>
            ))}
          </AppSection>
        </Box>

        <Box width={{ xs:'100%', md:300 }} flexShrink={0}>
          <Paper sx={{ p:3, mb:2 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Contato</Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" alignItems="center" gap={1}><LocationOnIcon fontSize="small" color="action" /><Typography variant="body2">{c.location || 'Não informado'}</Typography></Box>
              {c.email && <Box display="flex" alignItems="center" gap={1}><EmailIcon fontSize="small" color="action" /><Typography variant="body2">{c.email}</Typography></Box>}
              {c.linkedinUrl && <Box display="flex" alignItems="center" gap={1}><LinkedInIcon fontSize="small" color="action" /><Typography variant="body2" component="a" href={c.linkedinUrl} target="_blank" sx={{ color:'primary.main', textDecoration:'none' }}>LinkedIn</Typography></Box>}
            </Box>
          </Paper>
          {c.languages.length > 0 && (
            <Paper sx={{ p:3, mb:2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}><TranslateIcon fontSize="small" color="action" /><Typography variant="subtitle2" fontWeight={700}>Idiomas</Typography></Box>
              {c.languages.map(l => <Box key={l.id} display="flex" justifyContent="space-between"><Typography variant="body2">{l.name}</Typography>{l.level && <Typography variant="caption" color="text.secondary">{l.level}</Typography>}</Box>)}
            </Paper>
          )}
          {c.certifications.length > 0 && (
            <Paper sx={{ p:3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}><VerifiedIcon fontSize="small" color="action" /><Typography variant="subtitle2" fontWeight={700}>Certificações</Typography></Box>
              {c.certifications.map(cert => <Box key={cert.id} mb={1}><Typography variant="body2" fontWeight={600}>{cert.name}</Typography>{cert.issuer && <Typography variant="caption" color="text.secondary">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</Typography>}</Box>)}
            </Paper>
          )}
        </Box>
      </Box>
      <AppDialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Remover dados pessoais (LGPD)"
  maxWidth="sm"
  actions={
    <>
      <AppButton variant="outlined" onClick={() => setConfirmOpen(false)}>
        Cancelar
      </AppButton>
      <AppButton
        variant="contained"
        color="error"
        loading={isAnonymizing}
        onClick={() =>
          anonymize(id!, {
            onSuccess: () => { setConfirmOpen(false); navigate('/candidates'); },
            onError: (e) => alert(`Erro: ${e.message}`),
          })
        }
      >
        Confirmar remoção
      </AppButton>
    </>
  }
>
  <Alert severity="warning" sx={{ mb: 2 }}>
    Esta ação é <strong>irreversível</strong>.
  </Alert>
  <Typography variant="body2" color="text.secondary">
    Os dados pessoais de <strong>{c?.fullName}</strong> serão removidos:
    nome, e-mail, LinkedIn, skills, experiências, formação, idiomas e certificações.
    O histórico de scores no ranking será mantido de forma anonimizada.
    A remoção será registrada no log de auditoria.
  </Typography>
</AppDialog>
    </AppPage>
  );
}
