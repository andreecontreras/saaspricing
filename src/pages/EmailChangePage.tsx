import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, AlertCircle } from 'lucide-react';

const EmailChangePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Basic validation
        if (!currentEmail || !newEmail || !password) {
            setError('All fields are required');
            setIsSubmitting(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setError('Please enter a valid email address');
            setIsSubmitting(false);
            return;
        }

        try {
            // Here you would typically make an API call to update the email
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
            navigate('/settings');
        } catch (err) {
            setError('Failed to update email. Please try again.');
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
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-6 mx-auto">
                        <Mail className="w-6 h-6 text-blue-600" />
                    </div>

                    <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
                        Change Email Address
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Email
                            </label>
                            <input
                                id="currentEmail"
                                type="email"
                                value={currentEmail}
                                onChange={(e) => setCurrentEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="your.current@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                New Email
                            </label>
                            <input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="your.new@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-700">
                                For security reasons, we'll send a verification link to both your current and new email addresses.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Email Address'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmailChangePage; 