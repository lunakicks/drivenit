import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { PageTransition } from '../components/layout/PageTransition';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { LogOut, Edit2, User as UserIcon, Heart, Zap, Trophy } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { user, signOut, checkUser } = useAuthStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
    };

    const handleSaveProfile = async (data: { displayName: string; email: string }) => {
        // In a real app, you would call an API to update the user's profile here.
        // For now, we'll just refresh the user data.
        // Assuming there's an updateProfile method in useAuthStore or similar, 
        // but since I don't see one in the interface I saw earlier, 
        // I will assume the modal handles the API call via a prop or we just reload.

        // Actually, looking at EditProfileModal props, it takes onSave.
        // And looking at useAuthStore, it doesn't have updateProfile.
        // I'll implement a dummy onSave or use supabase directly if needed, 
        // but for now let's just re-fetch user.

        // Wait, the EditProfileModal was updated to take onSave.
        // Let's assume we pass a function that updates supabase.
        // Since I can't easily add a new method to store right now without reading it again,
        // I will implement the update logic here using supabase directly if possible,
        // or just mock it for the UI restoration.

        // Actually, better to just pass a function that calls checkUser after a small delay 
        // or assume the modal does the update. 
        // The EditProfileModal I saw earlier calls onSave(formData).

        // Let's import supabase to do the update
        const { supabase } = await import('../lib/supabase');

        if (user) {
            await supabase.auth.updateUser({
                data: { display_name: data.displayName }
            });
            // Also update email if changed (requires confirmation usually)
            if (data.email !== user.email) {
                await supabase.auth.updateUser({ email: data.email });
            }
            await checkUser();
        }
    };

    if (!user) {
        return null;
    }

    return (
        <PageTransition>
            <div className="p-6 space-y-6 pb-24">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        <Edit2 size={24} />
                    </button>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-2">
                        <UserIcon size={48} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                        </h2>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center space-y-2">
                        <Heart className="text-red-500" size={32} fill="currentColor" />
                        <span className="text-2xl font-bold text-gray-800">{(user as any).hearts ?? 5}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hearts</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center space-y-2">
                        <Zap className="text-yellow-500" size={32} fill="currentColor" />
                        <span className="text-2xl font-bold text-gray-800">{(user as any).xp ?? 0}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total XP</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center space-y-2">
                        <Trophy className="text-purple-500" size={32} />
                        <span className="text-2xl font-bold text-gray-800">{(user as any).streak ?? 0}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day Streak</span>
                    </div>
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full p-4 rounded-2xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors flex items-center justify-center gap-3"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={{
                    displayName: user.user_metadata?.display_name || '',
                    email: user.email || '',
                }}
                onSave={handleSaveProfile}
            />
        </PageTransition>
    );
};
