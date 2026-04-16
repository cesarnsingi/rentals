import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import { Spinner } from './components/ui';

const HomePage           = React.lazy(() => import('./pages/HomePage'));
const ListingsPage       = React.lazy(() => import('./pages/ListingsPage'));
const PropertyDetailPage = React.lazy(() => import('./pages/PropertyDetailPage'));
const DashboardPage      = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const AdminDashboard     = React.lazy(() => import('./pages/admin/AdminDashboard'));
const LoginPage          = React.lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage       = React.lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Fallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Navbar />
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/"              element={<HomePage />} />
              <Route path="/listings"      element={<ListingsPage />} />
              <Route path="/listings/:slug" element={<PropertyDetailPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/dashboard/*"   element={<DashboardPage />} />
              <Route path="/admin"         element={<AdminDashboard />} />
              <Route path="*"              element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111827', color: '#f9fafb', border: '1px solid #374151' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
