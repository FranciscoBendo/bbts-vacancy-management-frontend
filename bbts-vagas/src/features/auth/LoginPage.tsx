import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Alert,
  TextField, MenuItem, Divider, InputAdornment, IconButton,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { User, UserRole } from '../../shared/types';
import { useAuth } from './authContext';
import { AppButton } from '../../shared/components/AppButton';

interface BackendResponse {
  accessToken: string;
  userId: number;
  name: string;
  role: string;
}

interface AuthResult { token: string; user: User; }

function mapResponse(res: BackendResponse): AuthResult {
  return {
    token: res.accessToken,
    user: { id: String(res.userId), name: res.name, role: res.role as UserRole },
  };
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('REQUESTER');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation<AuthResult, Error, void>({
    mutationFn: () => http.post<BackendResponse>(ENDPOINTS.LOGIN, { email, password }).then(mapResponse),
    onSuccess: ({ token, user }) => login(user, token),
  });

  const registerMutation = useMutation<AuthResult, Error, void>({
    mutationFn: () => http.post<BackendResponse>(ENDPOINTS.REGISTER, { name, email, password, role }).then(mapResponse),
    onSuccess: ({ token, user }) => login(user, token),
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;

  const handleSubmit = () => {
    if (mode === 'login') loginMutation.mutate();
    else registerMutation.mutate();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    loginMutation.reset();
    registerMutation.reset();
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #0F2560 0%, #1A3A8F 60%, #1a5fa8 100%)', px: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%', border: 'none', borderRadius: 4 }}>
        <CardContent sx={{ p: 5 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={4}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 1, display: 'flex' }}>
              <WorkOutlineIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="primary.main" lineHeight={1.1}>BBTS</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Gestão de Vagas</Typography>
            </Box>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {mode === 'login' ? 'Entre com seu e-mail e senha para continuar' : 'Preencha os dados para criar sua conta'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

          <Box display="flex" flexDirection="column" gap={2}>
            {mode === 'register' && (
              <TextField label="Nome completo" fullWidth size="small"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
            )}

            <TextField label="E-mail" type="email" fullWidth size="small"
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete="email" />

            <TextField label="Senha" type={showPassword ? 'text' : 'password'} fullWidth size="small"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )}} />

            {mode === 'register' && (
              <TextField label="Perfil de acesso" select fullWidth size="small"
                value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <MenuItem value="REQUESTER">Solicitante</MenuItem>
                <MenuItem value="RH">Recursos Humanos (RH)</MenuItem>
              </TextField>
            )}

            <AppButton variant="contained" size="large" fullWidth loading={isPending}
              onClick={handleSubmit} sx={{ py: 1.5, mt: 1 }}>
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </AppButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </Typography>
            <AppButton variant="text" size="small" onClick={switchMode} sx={{ mt: 0.5 }}>
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </AppButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
