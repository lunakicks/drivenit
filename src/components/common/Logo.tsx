import React from 'react';
import { ShipWheel } from 'lucide-react'; // Using ShipWheel as a steering wheel proxy, or we can use a custom SVG
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
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const textSizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
        xl: 'text-5xl'
    };

    return (
        <div className={clsx("flex items-center gap-3", className)}>
            <div className={clsx(
                "bg-feather-green rounded-xl flex items-center justify-center text-white shadow-sm",
                sizeClasses[size],
                // Add a subtle rotation or style to make it look like an app icon
                "transform -rotate-6"
            )}>
                {/* Using ShipWheel as a steering wheel metaphor */}
                <ShipWheel
                    className={clsx(
                        "animate-spin-slow", // Optional: slow spin if desired, or static
                        size === 'sm' ? 'p-1' : 'p-2'
                    )}
                    strokeWidth={2.5}
                />
            </div>

            {variant === 'full' && (
                <span className={clsx(
                    "font-extrabold text-feather-green tracking-tight",
                    textSizeClasses[size]
                )}>
                    Patente Pro
                </span>
            )}
        </div>
    );
};
