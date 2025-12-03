import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { PageTransition } from '../components/layout/PageTransition';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { HeartsModal } from '../components/profile/HeartsModal';
import { XPModal } from '../components/profile/XPModal';
import { StreakModal } from '../components/profile/StreakModal';
import { LogOut, Edit2, User as UserIcon, Heart, Zap, Trophy } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { user, signOut, checkUser } = useAuthStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isHeartsModalOpen, setIsHeartsModalOpen] = useState(false);
    const [isXPModalOpen, setIsXPModalOpen] = useState(false);
    const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
    };

    const handleSaveProfile = async (data: { displayName: string; email: string }) => {
        console.log('🔵 handleSaveProfile called with:', data);
        const { supabase } = await import('../lib/supabase');

        if (user) {
            console.log('🔵 User exists, proceeding with update. User ID:', user.id);
            try {
                // Update display_name in profiles table using RPC
                console.log('🔵 Calling RPC function...');

                let rpcResult = null;
                let profileError = null;

                try {
                    const rpcTimeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('RPC timeout')), 5000)
                    );

                    const rpcCallPromise = supabase
                        .rpc('update_profile_display_name', { new_display_name: data.displayName });

                    const response = await Promise.race([rpcCallPromise, rpcTimeoutPromise]) as any;
                    rpcResult = response.data;
                    profileError = response.error;
                } catch (timeoutErr) {
                    console.warn('⚠️ RPC call timed out, will try direct update...', timeoutErr);
                    profileError = timeoutErr;
                }

                console.log('🔵 RPC response:', { rpcResult, profileError });

                if (profileError) {
                    console.error('❌ Error updating profile via RPC:', profileError);
                    // Fallback to direct update if RPC fails (e.g. not applied yet)
                    console.log('🔵 Step 3: Trying direct update fallback...');
                    const { error: directError } = await supabase
                        .from('profiles')
                        .update({ display_name: data.displayName })
                        .eq('id', user.id);

                    if (directError) {
                        console.error('❌ Direct update also failed:', directError);
                        throw new Error(`Profile update failed: ${directError.message}`);
                    } else {
                        console.log('✅ Direct update succeeded');
                    }
                } else {
                    console.log('✅ Profile updated successfully via RPC:', rpcResult);
                }

                console.log('🔵 Step 4: Refreshing user data with checkUser()...');
                await checkUser();
                console.log('✅ Profile save completed successfully!');
            } catch (err) {
                console.error('❌ Unexpected error saving profile:', err);
                throw err; // Re-throw to trigger the error handling in EditProfileModal
            }
        } else {
            console.error('❌ No user found!');
            throw new Error('No user found');
        }
    };

    if (!user) return null;

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
                            {user.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                        </h2>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsHeartsModalOpen(true)}
                        className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center space-y-2 hover:border-wrong-red/30 hover:shadow-md transition-all cursor-pointer"
                    >
                        <Heart className="text-wrong-red" size={32} fill="currentColor" />
                        <span className="text-2xl font-bold text-gray-800">{user.hearts ?? 5}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hearts</span>
                    </button>
                    <button
                        onClick={() => setIsXPModalOpen(true)}
                        className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center space-y-2 hover:border-mustard-yellow/30 hover:shadow-md transition-all cursor-pointer"
                    >
                        <Zap className="text-mustard-yellow" size={32} fill="currentColor" />
                        <span className="text-2xl font-bold text-gray-800">{user.xp ?? 0}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total XP</span>
                    </button>
                    <button
                        onClick={() => setIsStreakModalOpen(true)}
                        className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center space-y-2 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer col-span-2"
                    >
                        <Trophy className="text-purple-500" size={32} />
                        <span className="text-2xl font-bold text-gray-800">{user.streak ?? 0}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day Streak</span>
                    </button>
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
                    displayName: user.display_name || user.user_metadata?.display_name || '',
                    email: user.email || '',
                }}
                onSave={handleSaveProfile}
            />

            <HeartsModal
                isOpen={isHeartsModalOpen}
                onClose={() => setIsHeartsModalOpen(false)}
                currentHearts={user.hearts ?? 5}
            />

            <XPModal
                isOpen={isXPModalOpen}
                onClose={() => setIsXPModalOpen(false)}
                currentXP={user.xp ?? 0}
                completedCategories={user.completed_categories?.length ?? 0}
            />

            <StreakModal
                isOpen={isStreakModalOpen}
                onClose={() => setIsStreakModalOpen(false)}
                currentStreak={user.streak ?? 0}
                lastStudyDate={user.last_study_date}
            />
        </PageTransition>
    );
};
