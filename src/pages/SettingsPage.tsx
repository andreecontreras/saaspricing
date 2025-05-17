import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Bell,
    Shield,
    Globe,
    Zap,
    Eye,
    ArrowLeft,
    Moon,
    Sun,
    Palette,
    Volume2,
    BellRing,
    RefreshCw,
    User,
    Mail,
    CreditCard,
    LogOut,
    Lock
} from 'lucide-react';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const settingsSections = [
        {
            title: 'Account',
            icon: <User className="text-indigo-500" size={20} />,
            settings: [
                {
                    type: 'profile-header',
                    name: 'Andree Contreras',
                    email: 'andree@gmail.com',
                    plan: 'Free Plan',
                    avatar: 'AC'
                },
                {
                    type: 'divider',
                    label: 'Account Settings'
                },
                {
                    name: 'Email Address',
                    description: 'andree@gmail.com',
                    type: 'account-item',
                    icon: <Mail className="text-gray-400" size={16} />,
                    action: {
                        label: 'Change',
                        onClick: () => navigate('/settings/email')
                    }
                },
                {
                    name: 'Current Plan',
                    description: 'Free Plan • 100 searches/month',
                    type: 'account-item',
                    icon: <CreditCard className="text-gray-400" size={16} />,
                    action: {
                        label: 'Upgrade',
                        variant: 'primary',
                        onClick: () => navigate('/settings/upgrade')
                    },
                    badge: {
                        text: 'Free',
                        color: 'gray'
                    }
                },
                {
                    name: 'Password',
                    description: 'Last changed 3 months ago',
                    type: 'account-item',
                    icon: <Lock className="text-gray-400" size={16} />,
                    action: {
                        label: 'Update',
                        onClick: () => navigate('/settings/password')
                    }
                },
                {
                    type: 'divider',
                    label: 'Danger Zone'
                },
                {
                    name: 'Sign Out',
                    description: 'Sign out from all devices',
                    type: 'danger-item',
                    icon: <LogOut className="text-red-400" size={16} />,
                    onClick: () => {/* Handle sign out */ }
                }
            ]
        },
        {
            title: 'Notifications',
            icon: <Bell className="text-yellow-500" size={20} />,
            settings: [
                {
                    name: 'Price Drop Alerts',
                    description: 'Get notified when product prices decrease',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    name: 'Alert Sound',
                    description: 'Play a sound when notifications appear',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    name: 'Check Frequency',
                    description: 'How often to check for price changes',
                    type: 'select',
                    options: ['5 minutes', '15 minutes', '30 minutes', '1 hour'],
                    defaultValue: '15 minutes'
                }
            ]
        },
        {
            title: 'Display',
            icon: <Eye className="text-blue-500" size={20} />,
            settings: [
                {
                    name: 'Theme',
                    description: 'Choose your preferred appearance',
                    type: 'theme-select',
                    options: ['light', 'dark', 'system'],
                    defaultValue: theme
                },
                {
                    name: 'Compact Mode',
                    description: 'Show more content in less space',
                    type: 'toggle',
                    defaultValue: false
                }
            ]
        },
        {
            title: 'Privacy',
            icon: <Shield className="text-green-500" size={20} />,
            settings: [
                {
                    name: 'Share Analytics',
                    description: 'Help us improve with anonymous data',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    name: 'Search History',
                    description: 'Save your recent searches',
                    type: 'toggle',
                    defaultValue: true
                }
            ]
        },
        {
            title: 'Advanced',
            icon: <Zap className="text-purple-500" size={20} />,
            settings: [
                {
                    name: 'Auto-refresh',
                    description: 'Keep prices up to date automatically',
                    type: 'toggle',
                    defaultValue: true
                },
                {
                    name: 'Currency',
                    description: 'Choose your preferred currency',
                    type: 'select',
                    options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
                    defaultValue: 'USD'
                }
            ]
        }
    ];

    const renderAccountItem = (setting: any) => {
        switch (setting.type) {
            case 'profile-header':
                return (
                    <div className="flex items-center gap-4 p-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                                {setting.avatar}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {setting.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {setting.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {setting.plan}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'divider':
                return (
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-start">
                            <span className="pr-3 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                                {setting.label}
                            </span>
                        </div>
                    </div>
                );

            case 'account-item':
                return (
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                        <div className="flex-shrink-0">
                            {setting.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {setting.name}
                                </h3>
                                {setting.badge && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {setting.badge.text}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {setting.description}
                            </p>
                        </div>
                        {setting.action && (
                            <button
                                onClick={setting.action.onClick}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${setting.action.variant === 'primary'
                                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                {setting.action.label}
                            </button>
                        )}
                    </div>
                );

            case 'danger-item':
                return (
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                        <div className="flex-shrink-0">
                            {setting.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {setting.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {setting.description}
                            </p>
                        </div>
                        <button
                            onClick={setting.onClick}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                            Sign Out
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Scout</span>
                    </button>
                    <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
                </div>

                {/* Settings Grid */}
                <div className="space-y-6">
                    {settingsSections.map((section) => (
                        <div
                            key={section.title}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                {section.icon}
                                <h2 className="text-lg font-semibold text-black dark:text-white">{section.title}</h2>
                            </div>

                            <div className="space-y-3">
                                {section.settings.map((setting, idx) => (
                                    <div key={`${section.title}-setting-${idx}`}>
                                        {section.title === 'Account'
                                            ? renderAccountItem(setting)
                                            : (
                                                <div className="flex items-start justify-between bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                                            {setting.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {setting.description}
                                                        </p>
                                                    </div>

                                                    {setting.type === 'toggle' && (
                                                        <div className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                defaultChecked={setting.defaultValue as boolean}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </div>
                                                    )}

                                                    {setting.type === 'select' && (
                                                        <select
                                                            defaultValue={setting.defaultValue as string}
                                                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                                        >
                                                            {(setting.options as string[]).map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {setting.type === 'theme-select' && (
                                                        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                                            <button
                                                                onClick={() => setTheme('light')}
                                                                className={`p-2 rounded-md transition-colors ${theme === 'light'
                                                                    ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white'
                                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                                    }`}
                                                                title="Light theme"
                                                            >
                                                                <Sun size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme('dark')}
                                                                className={`p-2 rounded-md transition-colors ${theme === 'dark'
                                                                    ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white'
                                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                                    }`}
                                                                title="Dark theme"
                                                            >
                                                                <Moon size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme('system')}
                                                                className={`p-2 rounded-md transition-colors ${theme === 'system'
                                                                    ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white'
                                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                                    }`}
                                                                title="System theme"
                                                            >
                                                                <Palette size={18} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {setting.type === 'color-select' && (
                                                        <div className="flex gap-2">
                                                            {(setting.options as string[]).map((color) => (
                                                                <button
                                                                    key={color}
                                                                    className={`w-6 h-6 rounded-full border-2 ${color === setting.defaultValue
                                                                        ? 'border-gray-900'
                                                                        : 'border-transparent'
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor: `var(--${color}-500)`,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {setting.type === 'info' && setting.action && (
                                                        <button
                                                            onClick={setting.action.onClick}
                                                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                        >
                                                            {setting.action.label}
                                                        </button>
                                                    )}

                                                    {setting.type === 'danger-button' && (
                                                        <button
                                                            onClick={setting.onClick}
                                                            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                        >
                                                            Sign Out
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p>Scout.io Settings • Version 1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage; 