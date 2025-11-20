import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { useAuthStore } from './stores/useAuthStore';

import { Home } from './pages/Home';
import { QuizPage } from './pages/QuizPage';
const Practice = () => <div className="p-4"><h1 className="text-2xl font-bold text-eel-grey">Practice</h1></div>;
const Bookmarks = () => <div className="p-4"><h1 className="text-2xl font-bold text-eel-grey">Bookmarks</h1></div>;
const Profile = () => <div className="p-4"><h1 className="text-2xl font-bold text-eel-grey">Profile</h1></div>;

function App() {
  const { checkUser, loading } = useAuthStore();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-feather-green font-bold text-xl">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={
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

        <Route path="/practice" element={
          <ProtectedRoute>
            <MobileLayout>
              <Practice />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <MobileLayout>
              <Bookmarks />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MobileLayout>
              <Profile />
            </MobileLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
