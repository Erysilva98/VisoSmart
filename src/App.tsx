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
import { AppFeedback } from '@/components/ui/AppFeedback';

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
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    void init().then(() => setReady(true)).catch(() => setInitError(true));
  }, [init]);

  if (initError) return <main className="flex min-h-screen items-center justify-center bg-ink-50 p-6"><div role="alert" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-card"><h1 className="text-lg font-semibold">Não foi possível abrir seus dados</h1><p className="mt-2 text-sm text-ink-600">Seus registros não foram apagados. Tente abrir novamente.</p><button type="button" onClick={() => { setInitError(false); void init().then(() => setReady(true)).catch(() => setInitError(true)); }} className="btn-primary mt-4 w-full">Tentar novamente</button></div></main>;

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
      <AppFeedback />
    </HashRouter></MotionConfig>
  );
}
