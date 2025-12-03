import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Logo } from '../common/Logo';

export const InitialRoute: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

    useEffect(() => {
        const checkOnboarding = () => {
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            setShouldShowOnboarding(!hasSeenOnboarding);
            setIsLoading(false);
        };

        checkOnboarding();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <Logo size="lg" variant="icon" className="animate-pulse" />
            </div>
        );
    }

    if (shouldShowOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Navigate to="/auth" replace />;
};
