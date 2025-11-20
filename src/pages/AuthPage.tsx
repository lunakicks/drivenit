import React, { useState } from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export const AuthPage: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const { user } = useAuthStore();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-swan-white flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-feather-green mb-2">Patente Pro</h1>
                <p className="text-hare-grey font-bold text-lg">Learn Italian Driving Rules</p>
            </div>
            <AuthForm view={view} onToggleView={() => setView(view === 'login' ? 'signup' : 'login')} />
        </div>
    );
};
