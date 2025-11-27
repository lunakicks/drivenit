import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        displayName: string;
        email: string;
    };
    onSave: (data: { displayName: string; email: string }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose,
    initialData,
    onSave
}) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState<{ displayName?: string; email?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            setErrors({});
            setSubmitError(null);
        }
    }, [isOpen, initialData]);

    const validate = () => {
        const newErrors: { displayName?: string; email?: string } = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        } else if (formData.displayName.length < 2) {
            newErrors.displayName = 'Display name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            setSubmitError('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                        {submitError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                                {submitError}
                            </div>
                        )}

                        <div>
                            <label htmlFor="displayName" className="block text-sm font-bold text-gray-700 mb-1">
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className={`w-full p-3 rounded-xl border-2 ${errors.displayName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} outline-none transition-colors`}
                                placeholder="Enter your name"
                            />
                            {errors.displayName && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.displayName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full p-3 rounded-xl border-2 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} outline-none transition-colors`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-md active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
