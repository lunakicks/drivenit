import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface AuthFormProps {
    view: 'login' | 'signup';
    onToggleView: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ view, onToggleView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Account created successfully! Please check your email.');
                // For demo purposes, we might want to auto-login or show a success message
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Logged in successfully!');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred during authentication');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-card border-2 border-card-border">
            <h2 className="text-2xl font-bold text-center text-eel-grey mb-6">
                {view === 'login' ? 'Welcome Back!' : 'Create Profile'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-eel-grey mb-2 uppercase tracking-wide">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-hare-grey" size={20} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-swan-white border-2 border-card-border rounded-xl focus:border-sky-blue focus:outline-none transition-colors font-bold text-eel-grey placeholder-hare-grey"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-eel-grey mb-2 uppercase tracking-wide">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-hare-grey" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 bg-swan-white border-2 border-card-border rounded-xl focus:border-sky-blue focus:outline-none transition-colors font-bold text-eel-grey placeholder-hare-grey"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-hare-grey hover:text-eel-grey transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-wrong-red/10 text-wrong-red-dark rounded-xl text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={clsx(
                        "w-full py-3 rounded-xl font-extrabold text-white uppercase tracking-widest shadow-btn transition-transform active:translate-y-[4px] active:shadow-none",
                        loading ? "bg-hare-grey cursor-not-allowed" : "bg-sky-blue hover:bg-sky-blue-dark"
                    )}
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : (view === 'login' ? 'Log In' : 'Create Account')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-hare-grey font-bold text-sm">
                    {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={onToggleView}
                        className="ml-2 text-sky-blue hover:underline uppercase tracking-wide"
                    >
                        {view === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};
