import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Landing } from '@/pages/Landing';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Goals } from '@/pages/Goals';
import { Learn } from '@/pages/Learn';
import { Profile } from '@/pages/Profile';
import { Budgets } from '@/pages/Budgets';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const onboarding = useStore((s) => s.onboarding);
  const location = useLocation();
  if (!onboarding.completed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const init = useStore((s) => s.init);
  const onboarding = useStore((s) => s.onboarding);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void init().finally(() => setReady(true));
  }, [init]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={onboarding.completed ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/onboarding" element={onboarding.completed ? <Navigate to="/dashboard" replace /> : <Onboarding />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/gastos" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/planejamento" element={<Navigate to="/orcamentos" replace />} />
      <Route path="/metas" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/aprender" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
      <Route path="/analises" element={<Navigate to="/dashboard" replace />} />
      <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/previsoes" element={<Navigate to="/perfil" replace />} />
      <Route path="/orcamentos" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
      <Route path="/investimentos" element={<Navigate to="/perfil" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user"><HashRouter>
      <AppRoutes />
    </HashRouter></MotionConfig>
  );
}
