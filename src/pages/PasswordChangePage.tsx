import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, AlertCircle, Check } from 'lucide-react';

const PasswordChangePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Password requirements
    const requirements = [
        { id: 1, text: 'At least 8 characters long' },
        { id: 2, text: 'Contains at least one uppercase letter' },
        { id: 3, text: 'Contains at least one number' },
        { id: 4, text: 'Contains at least one special character' }
    ];

    const checkPasswordRequirement = (requirement: { id: number; text: string }) => {
        if (!newPassword) return false;

        switch (requirement.id) {
            case 1:
                return newPassword.length >= 8;
            case 2:
                return /[A-Z]/.test(newPassword);
            case 3:
                return /[0-9]/.test(newPassword);
            case 4:
                return /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
            default:
                return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Validate all requirements
        const allRequirementsMet = requirements.every(checkPasswordRequirement);
        if (!allRequirementsMet) {
            setError('Please meet all password requirements');
            setIsSubmitting(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setIsSubmitting(false);
            return;
        }

        try {
            // Here you would typically make an API call to update the password
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
            navigate('/settings');
        } catch (err) {
            setError('Failed to update password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Settings
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-6 mx-auto">
                        <Lock className="w-6 h-6 text-purple-600" />
                    </div>

                    <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
                        Change Password
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Password Requirements</h4>
                            <ul className="space-y-2">
                                {requirements.map((requirement) => (
                                    <li
                                        key={requirement.id}
                                        className="flex items-center text-sm"
                                    >
                                        <span className={`mr-2 ${checkPasswordRequirement(requirement)
                                                ? 'text-green-500'
                                                : 'text-gray-400'
                                            }`}>
                                            <Check className="w-4 h-4" />
                                        </span>
                                        <span className={
                                            checkPasswordRequirement(requirement)
                                                ? 'text-gray-900'
                                                : 'text-gray-500'
                                        }>
                                            {requirement.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                            <p className="text-sm text-purple-700">
                                For security reasons, you'll be logged out after changing your password.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangePage; 