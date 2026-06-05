import { useState, useRef } from 'react';
import { Box, Typography, Alert, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab, LinearProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // ADICIONADO — ícone do alerta de duplicata
import { useNavigate } from 'react-router-dom';
import { AppPage } from '../../shared/components/AppPage';
import { AppSection } from '../../shared/components/AppSection';
import { AppButton } from '../../shared/components/AppButton';
import { AppDialog } from '../../shared/components/AppDialog'; // ADICIONADO — dialog de decisão
import { useImportPdf, useResolveDuplicate } from './useImportPdf'; // MODIFICADO — adicionado useResolveDuplicate
import { useImportCsv, useImportJson } from './useImportCandidates';
import type { IntegrationLog, CandidateDetail, DuplicateDetected } from '../../shared/types'; // MODIFICADO — adicionado DuplicateDetected
import { ENDPOINTS } from '../../shared/api/endpoints';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';


function StatusChip({ status }: { status: string }) {
  if (status === 'SUCCESS') return <Chip icon={<CheckCircleIcon />} label="Sucesso" color="success" size="small" />;
  if (status === 'PARTIAL') return <Chip icon={<WarningIcon />} label="Parcial" color="warning" size="small" />;
  return <Chip icon={<ErrorIcon />} label="Falhou" color="error" size="small" />;
}

function ImportLogResult({ log }: { log: IntegrationLog }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <StatusChip status={log.status} />
        <Typography variant="subtitle2" fontWeight={700}>Resultado</Typography>
        {log.filename && <Typography variant="caption" color="text.secondary">{log.filename}</Typography>}
      </Box>
      <Box display="flex" gap={4} mb={2}>
        {([['Total', log.totalRecords, 'text.primary'], ['Importados', log.successCount, 'success.main'], ['Erros', log.errorCount, 'error.main']] as const).map(([l, v, color]) => (
          <Box key={String(l)} textAlign="center">
            <Typography variant="h4" fontWeight={800} color={String(color)}>{Number(v)}</Typography>
            <Typography variant="caption" color="text.secondary">{String(l)}</Typography>
          </Box>
        ))}
      </Box>
      {log.errorsJson && log.errorsJson.length > 0 && (
        <Table size="small">
          <TableHead><TableRow><TableCell>Linha</TableCell><TableCell>Erro</TableCell></TableRow></TableHead>
          <TableBody>{log.errorsJson.map((e, i) => <TableRow key={i}><TableCell>{e.row}</TableCell><TableCell>{e.message}</TableCell></TableRow>)}</TableBody>
        </Table>
      )}
    </Paper>
  );
}

function PdfSuccessCard({ candidate }: { candidate: CandidateDetail }) {
  const navigate = useNavigate();
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3, borderColor: 'success.main' }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <CheckCircleIcon color="success" />
        <Typography variant="subtitle2" fontWeight={700} color="success.main">Candidato importado via IA!</Typography>
      </Box>
      <Typography variant="body1" fontWeight={700}>{candidate.fullName}</Typography>
      <Typography variant="body2" color="text.secondary">{candidate.headline}</Typography>
      <Typography variant="body2" color="text.secondary" mb={1.5}>{candidate.location}</Typography>
      <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
        {candidate.skills.slice(0, 6).map((s) => <Chip key={s.id} label={s.name} size="small" variant="outlined" color="primary" />)}
      </Box>
      <AppButton variant="contained" size="small" onClick={() => navigate(`/candidates/${candidate.id}`)}>
        Ver perfil completo
      </AppButton>
    </Paper>
  );
}

export default function ImportCandidatesPage() {
  const [tab, setTab] = useState(0);
  const [importLog, setImportLog] = useState<IntegrationLog | null>(null);
  const [pdfCandidate, setPdfCandidate] = useState<CandidateDetail | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const pdfRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  // ADICIONADO — estado que armazena os dados de duplicata retornados pelo backend.
  // Quando preenchido, o dialog de decisão é exibido ao RH.
  // Quando null, o dialog permanece fechado.
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateDetected | null>(null);

  const { mutate: importPdf, isPending: pdfLoading } = useImportPdf();
  const { mutate: importCsv, isPending: csvLoading } = useImportCsv();
  const { mutate: importJson, isPending: jsonLoading } = useImportJson();

  // ADICIONADO — hook que envia a decisão do RH para POST /candidates/import/pdf/resolve
  const { mutate: resolveDuplicate, isPending: resolveLoading } = useResolveDuplicate();

  const reset = () => { setImportLog(null); setPdfCandidate(null); };

  const handleDownloadTemplate = async () => {
    const token = sessionStorage.getItem('bbts_token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}${ENDPOINTS.IMPORT_TEMPLATE}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'candidatos_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ADICIONADO — função centralizada para lidar com a decisão do RH no dialog.
  // Recebe a action escolhida, chama o backend e trata sucesso/erro.
  const handleResolve = (action: 'create_new' | 'update' | 'cancel') => {
    if (action === 'cancel') {
      setDuplicateInfo(null);
      return;
    }
    if (!duplicateInfo) return;

    resolveDuplicate(
      {
        action,
        extractedData: duplicateInfo.extractedData,
        filename: duplicateInfo.filename,
        existingCandidateId:
          action === 'update' ? duplicateInfo.existingCandidateId : undefined,
      },
      {
        onSuccess: (candidate) => {
          setPdfCandidate(candidate);
          setDuplicateInfo(null); // fecha o dialog após sucesso
        },
        onError: (e) => alert(`Erro: ${e.message}`),
      }
    );
  };

  return (
    <AppPage title="Importar Candidatos" subtitle="Adicione candidatos via PDF (IA), CSV ou JSON"
      breadcrumbs={[{ label: 'Importar Candidatos' }]}
      actions={<AppButton variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate}>Template CSV</AppButton>}>

      <AppSection>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); reset(); }} sx={{ mb: 3 }}>
          <Tab icon={<AutoAwesomeIcon />} iconPosition="start" label="PDF (IA)" />
          <Tab label="CSV" />
          <Tab label="JSON" />
        </Tabs>

        {/* PDF */}
        {tab === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }} icon={<AutoAwesomeIcon />}>
              <strong>Groq.</strong> Faça upload do currículo em PDF — a IA extrai automaticamente nome, skills, experiências, formação, idiomas e certificações.
            </Alert>

            <Alert severity="warning" sx={{ mb: 3 }} icon={<GppMaybeIcon />}>
              <strong>Aviso LGPD:</strong> Ao importar este currículo, confirmo que o candidato
              foi informado sobre o tratamento dos seus dados pessoais para fins de recrutamento,
              conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).
            </Alert>
            <Box sx={{ border: '2px dashed', borderColor: pdfFile ? 'primary.main' : 'divider', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => pdfRef.current?.click()}>
              <PictureAsPdfIcon sx={{ fontSize: 52, color: pdfFile ? 'primary.main' : 'text.disabled', mb: 1 }} />
              <Typography variant="body1" fontWeight={600}>{pdfFile ? pdfFile.name : 'Clique para selecionar o currículo em PDF'}</Typography>
              <Typography variant="caption" color="text.secondary">{pdfFile ? `${(pdfFile.size/1024).toFixed(1)} KB` : 'Máximo: 10MB · Formato: .pdf'}</Typography>
              <input ref={pdfRef} type="file" accept=".pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); reset(); } }} />
            </Box>
            {pdfLoading && <Box mt={2}><Typography variant="caption" color="text.secondary">Analisando com IA...</Typography><LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} /></Box>}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <AppButton
                variant="contained"
                loading={pdfLoading}
                disabled={!pdfFile}
                startIcon={<AutoAwesomeIcon />}
                onClick={() =>
                  pdfFile &&
                  importPdf(pdfFile, {
                    // MODIFICADO — onSuccess agora verifica se o retorno é duplicata
                    // ANTES: sempre tratava o resultado como CandidateDetail e exibia o card de sucesso
                    // DEPOIS: verifica 'duplicateDetected' antes de decidir o que renderizar
                    onSuccess: (result) => {
                      if ('duplicateDetected' in result && result.duplicateDetected) {
                        // Duplicata detectada — abre o dialog de decisão com os dados retornados
                        setDuplicateInfo(result as DuplicateDetected);
                        setPdfFile(null);
                      } else {
                        // Fluxo normal — exibe o card de sucesso com o perfil do candidato
                        setPdfCandidate(result as CandidateDetail);
                        setPdfFile(null);
                      }
                    },
                    onError: (e) => alert(`Erro: ${e.message}`),
                  })
                }
              >
                Extrair com IA
              </AppButton>
            </Box>
            {pdfCandidate && <PdfSuccessCard candidate={pdfCandidate} />}
          </Box>
        )}

        {/* CSV */}
        {tab === 1 && (
          <Box>
            <Box sx={{ border: '2px dashed', borderColor: csvFile ? 'primary.main' : 'divider', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => csvRef.current?.click()}>
              <UploadFileIcon sx={{ fontSize: 48, color: csvFile ? 'primary.main' : 'text.disabled', mb: 1 }} />
              <Typography variant="body1" fontWeight={600}>{csvFile ? csvFile.name : 'Clique para selecionar o CSV'}</Typography>
              <Typography variant="caption" color="text.secondary">{csvFile ? `${(csvFile.size/1024).toFixed(1)} KB` : '.csv'}</Typography>
              <input ref={csvRef} type="file" accept=".csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCsvFile(f); reset(); } }} />
            </Box>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <AppButton variant="contained" loading={csvLoading} disabled={!csvFile} startIcon={<UploadFileIcon />}
                onClick={() => csvFile && importCsv(csvFile, { onSuccess: (l) => { setImportLog(l); setCsvFile(null); }, onError: (e) => alert(e.message) })}>
                Importar CSV
              </AppButton>
            </Box>
            {importLog && <ImportLogResult log={importLog} />}
          </Box>
        )}

        {/* JSON */}
        {tab === 2 && (
          <Box>
            <Box component="textarea" value={jsonText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setJsonText(e.target.value); setJsonError(''); }}
              placeholder={'[\n  {\n    "full_name": "João Silva",\n    "email": "joao@email.com",\n    "location": "São Paulo, SP",\n    "skills": [{ "name": "Python", "level": "Avançado", "years_experience": 5 }],\n    "languages": [], "certifications": [], "educations": [], "experiences": []\n  }\n]'}
              sx={{ width: '100%', minHeight: 240, p: 2, fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid', borderColor: jsonError ? 'error.main' : 'divider', borderRadius: 2, resize: 'vertical', outline: 'none', bgcolor: 'background.paper', color: 'text.primary', '&:focus': { borderColor: 'primary.main' } }} />
            {jsonError && <Alert severity="error" sx={{ mt: 1 }}>{jsonError}</Alert>}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <AppButton variant="contained" loading={jsonLoading} disabled={!jsonText.trim()} startIcon={<UploadFileIcon />}
                onClick={() => { try { const p = JSON.parse(jsonText); if (!Array.isArray(p)) { setJsonError('JSON deve ser um array'); return; } importJson(p, { onSuccess: (l) => { setImportLog(l); setJsonText(''); }, onError: (e) => setJsonError(e.message) }); } catch { setJsonError('JSON inválido'); } }}>
                Importar JSON
              </AppButton>
            </Box>
            {importLog && <ImportLogResult log={importLog} />}
          </Box>
        )}
      </AppSection>

      <AppSection title="Formato CSV">
        <Typography variant="body2" color="text.secondary" mb={1}>Campos compostos: <code>;</code> separa itens, <code>:</code> separa sub-campos.</Typography>
        <Box component="pre" sx={{ bgcolor: 'grey.900', color: 'grey.100', p: 2, borderRadius: 2, fontSize: '0.72rem', overflowX: 'auto' }}>
{`full_name,headline,email,location,skills,languages,certifications,education,experiences
João Silva,Dev Backend,joao@email.com,São Paulo SP,Python:Avançado:5;JS:Inter:2,Inglês:B2,AWS:Amazon:2023,USP:CC:Bach:2018,BBTS:Dev:2022:2024:false`}
        </Box>
      </AppSection>

      {/* ADICIONADO — dialog de decisão exibido quando o backend detecta e-mail duplicado.
          O RH escolhe entre três opções:
          - "Atualizar cadastro existente": sobrescreve os dados do candidato já cadastrado
          - "Importar como candidato novo": cria novo registro sem e-mail (evita conflito UNIQUE)
          - "Cancelar importação": fecha o dialog sem persistir nada
          O onClose é bloqueado durante a requisição para evitar fechamento acidental. */}
      <AppDialog
        open={!!duplicateInfo}
        onClose={() => !resolveLoading && setDuplicateInfo(null)}
        title="Candidato já cadastrado"
        maxWidth="sm"
        actions={
          <AppButton
            variant="outlined"
            color="error"
            onClick={() => handleResolve('cancel')}
            disabled={resolveLoading}
          >
            Cancelar importação
          </AppButton>
        }
      >
        {duplicateInfo && (
          <Box>
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
              O e-mail deste currículo já pertence ao candidato{' '}
              <strong>{duplicateInfo.existingCandidateName}</strong>.
              O que deseja fazer?
            </Alert>


            <Box display="flex" flexDirection="column" gap={1.5}>
              <AppButton
                variant="contained"
                color="primary"
                loading={resolveLoading}
                onClick={() => handleResolve('update')}
              >
                Atualizar cadastro existente
              </AppButton>

              <AppButton
                variant="outlined"
                loading={resolveLoading}
                onClick={() => handleResolve('create_new')}
              >
                Importar como candidato novo
              </AppButton>
            </Box>
          </Box>
        )}
      </AppDialog>

    </AppPage>
  );
}