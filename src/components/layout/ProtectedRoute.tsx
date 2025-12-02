import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Logo } from '../common/Logo';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-swan-white">
                <Logo size="md" variant="icon" className="animate-pulse" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
