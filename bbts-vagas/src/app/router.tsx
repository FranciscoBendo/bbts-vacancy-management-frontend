import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AppShell } from '../shared/layouts/AppShell';
import { useAuth } from '../features/auth/authContext';

const LoginPage               = lazy(() => import('../features/auth/LoginPage'));
const VacanciesListPage       = lazy(() => import('../features/vacancies/VacanciesListPage'));
const VacancyCreatePage       = lazy(() => import('../features/vacancies/VacancyCreatePage'));
const VacancyDetailsPage      = lazy(() => import('../features/vacancies/VacancyDetailsPage'));
const ApprovalsQueuePage      = lazy(() => import('../features/approvals/ApprovalsQueuePage'));
const CandidatesByVacancyPage = lazy(() => import('../features/candidates/CandidatesByVacancyPage'));
const CandidatesListPage      = lazy(() => import('../features/candidates/CandidatesListPage'));
const CandidateDetailPage     = lazy(() => import('../features/candidates/CandidateDetailPage'));
const ImportCandidatesPage    = lazy(() => import('../features/imports/ImportCandidatesPage'));
const DashboardPage           = lazy(() => import('../features/dashboard/DashboardPage'));

const Loading = () => <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
const S = (C: React.ComponentType) => <Suspense fallback={<Loading />}><C /></Suspense>;

function PrivateRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'RH' ? <Navigate to="/approvals" replace /> : <Navigate to="/vacancies" replace />;
}

const router = createBrowserRouter([
  { path: '/login', element: S(LoginPage) },
  { path: '/', element: <AppShell />, children: [
    { index: true, element: <RootRedirect /> },
    { element: <PrivateRoute allowedRoles={['REQUESTER','RH']} />, children: [
      { path: 'vacancies', element: S(VacanciesListPage) },
      { path: 'vacancies/:id', element: S(VacancyDetailsPage) },
      { path: 'vacancies/:id/candidates', element: S(CandidatesByVacancyPage) },
      { path: 'candidates', element: S(CandidatesListPage) },
      { path: 'candidates/:id', element: S(CandidateDetailPage) },
      { path: 'dashboard', element: S(DashboardPage) },
    ]},
    { element: <PrivateRoute allowedRoles={['REQUESTER']} />, children: [
      { path: 'vacancies/new', element: S(VacancyCreatePage) },
    ]},
    { element: <PrivateRoute allowedRoles={['RH']} />, children: [
      { path: 'approvals', element: S(ApprovalsQueuePage) },
      { path: 'candidates/import', element: S(ImportCandidatesPage) },
    ]},
  ]},
]);

export function AppRouter() { return <RouterProvider router={router} />; }
