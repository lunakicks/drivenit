import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { User, Heart, Flame, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/layout/PageTransition';
import { InfoModal } from '../components/ui/InfoModal';

export const ProfilePage: React.FC = () => {
    const { user, signOut } = useAuthStore();
    const [activeModal, setActiveModal] = useState<'streak' | 'xp' | 'league' | null>(null);

    if (!user) return null;

    const stats = [
        {
            id: 'streak',
            icon: <Flame className="text-orange-500" size={24} />,
            label: 'Day Streak',
            value: (user as any).streak || 0,
            modalTitle: "Day Streak",
            modalDesc: "Keep your streak alive by practicing every day! If you miss a day, your streak resets to zero."
        },
        {
            id: 'xp',
            icon: <Heart className="text-red-500" size={24} />,
            label: 'Total XP',
            value: (user as any).xp || 0,
            modalTitle: "Total XP",
            modalDesc: "Earn XP by answering questions correctly. You get 10 XP for every correct answer!"
        },
        {
            id: 'league',
            icon: <User className="text-blue-500" size={24} />,
            label: 'League',
            value: 'Bronze',
            modalTitle: "Bronze League",
            modalDesc: "You are currently in the Bronze League. Keep earning XP to promote to Silver and unlock new rewards!"
        },
    ];

    const activeStat = stats.find(s => s.id === activeModal);

    return (
        <PageTransition>
            <div className="p-6 pb-24">
                <h1 className="text-2xl font-bold text-eel-grey mb-6">Profile</h1>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-feather-green rounded-full flex items-center justify-center text-3xl font-bold text-white">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-eel-grey">{user.email?.split('@')[0]}</h2>
                        <p className="text-hare-grey">Joined 2025</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {stats.map((stat) => (
                        <button
                            key={stat.id}
                            onClick={() => setActiveModal(stat.id as any)}
                            className="bg-white border-2 border-card-border rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            {stat.icon}
                            <span className="text-2xl font-bold text-eel-grey">{stat.value}</span>
                            <span className="text-sm text-hare-grey font-bold uppercase">{stat.label}</span>
                        </button>
                    ))}
                </div>

                <InfoModal
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    title={activeStat?.modalTitle || ''}
                    description={activeStat?.modalDesc || ''}
                    icon={activeStat?.icon}
                />

                <button
                    onClick={() => {
                        signOut();
                        toast.success('Signed out successfully');
                    }}
                    className="w-full py-3 rounded-xl border-2 border-card-border font-bold text-eel-grey uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </PageTransition>
    );
};
