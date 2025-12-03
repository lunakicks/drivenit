import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { MobileLayout } from './components/layout/MobileLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { useAuthStore } from './stores/useAuthStore';
import { Logo } from './components/common/Logo';

import { Home } from './pages/Home';
import { QuizPage } from './pages/QuizPage';
import { PracticePage } from './pages/PracticePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { ProfilePage } from './pages/ProfilePage';
import { Onboarding } from './pages/Onboarding';
import { InitialRoute } from './components/layout/InitialRoute';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />

        <Route path="/" element={<InitialRoute />} />

        <Route path="/home" element={
          <ProtectedRoute>
            <MobileLayout>
              <Home />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="/quiz/:categoryId" element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        } />

        <Route path="/quiz/practice/:mode" element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        } />

        <Route path="/practice" element={
          <ProtectedRoute>
            <MobileLayout>
              <PracticePage />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <MobileLayout>
              <BookmarksPage />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MobileLayout>
              <ProfilePage />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { checkUser, loading } = useAuthStore();

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-swan-white gap-4">
        <Logo size="lg" variant="icon" className="animate-pulse" />
        <p className="text-feather-green font-bold text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <AppRoutes />
    </Router>
  );
}

export default App;
