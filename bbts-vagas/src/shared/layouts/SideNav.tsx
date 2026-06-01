import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PeopleIcon from '@mui/icons-material/People';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/authContext';
import DashboardIcon from '@mui/icons-material/Dashboard';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const REQUESTER_ITEMS: NavItem[] = [
  { label: 'Minhas Vagas', path: '/vacancies', icon: <WorkIcon /> },
  { label: 'Candidatos', path: '/candidates', icon: <PeopleIcon /> },
  { label: 'Criar Vaga', path: '/vacancies/new', icon: <AddCircleOutlineIcon /> },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

const RH_ITEMS: NavItem[] = [
  { label: 'Fila de Aprovação', path: '/approvals', icon: <PendingActionsIcon /> },
  { label: 'Todas as Vagas', path: '/vacancies', icon: <WorkIcon /> },
  { label: 'Candidatos', path: '/candidates', icon: <PeopleIcon /> },
  { label: 'Importar Candidatos', path: '/candidates/import', icon: <UploadFileIcon /> },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

export function SideNav({ open }: { open: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = user?.role === 'RH' ? RH_ITEMS : REQUESTER_ITEMS;

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing={1}
        >
          {user?.role === 'RH' ? 'Recursos Humanos' : 'Solicitante'}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, pt: 1 }}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}