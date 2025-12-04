import React from 'react';
import clsx from 'clsx';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'icon' | 'full';
}

export const Logo: React.FC<LogoProps> = ({
    className,
    size = 'md',
    variant = 'full'
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-20 h-20',
        xl: 'w-32 h-32'
    };

    const textSizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
        xl: 'text-5xl'
    };

    return (
        <div className={clsx("flex items-center gap-3", className)}>
            <img
                src="/images/logo.png"
                alt="drivenit Logo"
                className={clsx(
                    "object-contain",
                    sizeClasses[size]
                )}
            />

            {variant === 'full' && (
                <span className={clsx(
                    "font-extrabold text-feather-green tracking-tight",
                    textSizeClasses[size]
                )}>
                    drivenit
                </span>
            )}
        </div>
    );
};
