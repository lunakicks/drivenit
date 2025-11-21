import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { User, Heart, Flame, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
    const { user, signOut } = useAuthStore();

    if (!user) return null;

    const stats = [
        { icon: <Flame className="text-orange-500" size={24} />, label: 'Day Streak', value: (user as any).streak || 0 },
        { icon: <Heart className="text-red-500" size={24} />, label: 'Total XP', value: (user as any).xp || 0 },
        { icon: <User className="text-blue-500" size={24} />, label: 'League', value: 'Bronze' },
    ];

    return (
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
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white border-2 border-card-border rounded-xl p-4 flex flex-col items-center gap-2">
                        {stat.icon}
                        <span className="text-2xl font-bold text-eel-grey">{stat.value}</span>
                        <span className="text-sm text-hare-grey font-bold uppercase">{stat.label}</span>
                    </div>
                ))}
            </div>

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
    );
};
