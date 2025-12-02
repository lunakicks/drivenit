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
            <div className="min-h-screen flex flex-col items-center justify-center bg-swan-white gap-4">
                <Logo size="md" variant="icon" className="animate-pulse" />
                <p className="text-feather-green font-bold">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
