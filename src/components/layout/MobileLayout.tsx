import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Bookmark, User } from 'lucide-react';
import clsx from 'clsx';

interface MobileLayoutProps {
    children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Learn', path: '/' },
        { icon: BookOpen, label: 'Practice', path: '/practice' },
        { icon: Bookmark, label: 'Saved', path: '/bookmarks' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-swan-white flex flex-col max-w-md mx-auto border-x border-card-border shadow-2xl relative">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md bg-white border-t-2 border-card-border flex justify-around items-center py-3 z-50">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center gap-1 w-full"
                        >
                            <item.icon
                                size={28}
                                className={clsx(
                                    "transition-colors duration-200",
                                    isActive ? "text-sky-blue fill-sky-blue/20" : "text-hare-grey"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span
                                className={clsx(
                                    "text-xs font-bold uppercase tracking-wide",
                                    isActive ? "text-sky-blue" : "text-hare-grey"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
