import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
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
    Lock,
    ChevronRight
} from 'lucide-react';

interface Action {
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
}

interface Badge {
    text: string;
    color: 'gray' | 'indigo';
}

interface BaseSetting {
    name: string;
    description: string;
    type: string;
}

interface AccountItem extends BaseSetting {
    type: 'account-item';
    icon: JSX.Element;
    action: Action;
    badge?: Badge;
}

interface ProfileHeader {
    type: 'profile-header';
    name: string;
    email: string;
    plan: string;
    avatar: string;
}

interface Divider {
    type: 'divider';
    label: string;
}

interface ToggleSetting extends BaseSetting {
    type: 'toggle';
    defaultValue: boolean;
    onChange: (value: boolean) => void;
}

interface SelectSetting extends BaseSetting {
    type: 'select';
    options: string[];
    defaultValue: string;
    onChange: (value: string) => void;
}

interface ThemeSelectSetting extends BaseSetting {
    type: 'theme-select';
    options: ('light' | 'dark')[];
    defaultValue: 'light' | 'dark';
    onChange: (value: 'light' | 'dark') => void;
}

type Setting = AccountItem | ProfileHeader | Divider | ToggleSetting | SelectSetting | ThemeSelectSetting;

interface SettingsSection {
    title: string;
    icon: JSX.Element;
    settings: Setting[];
}

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { settings: notificationSettings, updateSettings } = useNotificationSettings();

    const handleThemeChange = async (newTheme: 'light' | 'dark') => {
        try {
            setTheme(newTheme);
            await chrome.storage.sync.set({ theme: newTheme });
        } catch (error) {
            console.error('Failed to save theme preference:', error);
            // You might want to add a toast notification here
        }
    };

    const handleSignOut = async () => {
        try {
            // Add sign out logic here
            console.log('Signing out...');
        } catch (error) {
            console.error('Failed to sign out:', error);
            // You might want to add a toast notification here
        }
    };

    const handleNotificationChange = async (setting: string, value: boolean | string) => {
        try {
            const success = await updateSettings({ [setting]: value });
            if (!success) {
                throw new Error('Failed to update notification settings');
            }
        } catch (error) {
            console.error('Failed to update notification settings:', error);
            // You might want to add a toast notification here
        }
    };

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
                    icon: <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Mail className="text-blue-600 dark:text-blue-400" size={16} />
                    </div>,
                    action: {
                        label: 'Change',
                        variant: 'secondary',
                        onClick: () => navigate('/settings/email')
                    }
                },
                {
                    name: 'Current Plan',
                    description: 'Free Plan • 100 searches/month',
                    type: 'account-item',
                    icon: <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <CreditCard className="text-purple-600 dark:text-purple-400" size={16} />
                    </div>,
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
                    icon: <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Lock className="text-amber-600 dark:text-amber-400" size={16} />
                    </div>,
                    action: {
                        label: 'Update',
                        variant: 'secondary',
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
                    type: 'account-item',
                    icon: <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <LogOut className="text-red-600 dark:text-red-400" size={16} />
                    </div>,
                    action: {
                        label: 'Sign Out',
                        variant: 'danger',
                        onClick: handleSignOut
                    }
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
                    defaultValue: notificationSettings.priceDropAlerts,
                    onChange: (value: boolean) => handleNotificationChange('priceDropAlerts', value)
                },
                {
                    name: 'Alert Sound',
                    description: 'Play a sound when notifications appear',
                    type: 'toggle',
                    defaultValue: notificationSettings.alertSound,
                    onChange: (value: boolean) => handleNotificationChange('alertSound', value)
                },
                {
                    name: 'Check Frequency',
                    description: 'How often to check for price changes',
                    type: 'select',
                    options: ['5 minutes', '15 minutes', '30 minutes', '1 hour'],
                    defaultValue: notificationSettings.checkFrequency,
                    onChange: (value: string) => handleNotificationChange('checkFrequency', value)
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
                    options: ['light', 'dark'],
                    defaultValue: theme,
                    onChange: handleThemeChange
                },
                {
                    name: 'Compact Mode',
                    description: 'Show more content in less space',
                    type: 'toggle',
                    defaultValue: false,
                    onChange: (value: boolean) => console.log('Compact mode:', value)
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
                    defaultValue: true,
                    onChange: (value: boolean) => console.log('Share analytics:', value)
                },
                {
                    name: 'Search History',
                    description: 'Save your recent searches',
                    type: 'toggle',
                    defaultValue: true,
                    onChange: (value: boolean) => console.log('Search history:', value)
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
                    defaultValue: true,
                    onChange: (value: boolean) => console.log('Auto-refresh:', value)
                },
                {
                    name: 'Currency',
                    description: 'Choose your preferred currency',
                    type: 'select',
                    options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
                    defaultValue: 'USD',
                    onChange: (value: string) => console.log('Currency:', value)
                }
            ]
        }
    ];

    const renderAccountItem = (setting: Setting) => {
        switch (setting.type) {
            case 'profile-header':
                return (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6">
                        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-4 ring-white dark:ring-gray-800">
                                <span className="text-xl font-bold text-white">
                                    {setting.avatar}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {setting.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {setting.email}
                                </p>
                                <div className="mt-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-800">
                                        {setting.plan}
                                    </span>
                                </div>
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
                            <span className="px-4 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                                {setting.label}
                            </span>
                        </div>
                    </div>
                );

            case 'account-item':
                return (
                    <div className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200 mt-3">
                        <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            {setting.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {setting.name}
                                </h3>
                                {setting.badge && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${setting.badge.color === 'gray'
                                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        }`}>
                                        {setting.badge.text}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {setting.description}
                            </p>
                        </div>
                        {setting.action && (
                            <button
                                onClick={setting.action.onClick}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${setting.action.variant === 'primary'
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm hover:shadow-md shadow-indigo-500/10'
                                    : setting.action.variant === 'secondary'
                                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                                        : setting.action.variant === 'danger'
                                            ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-sm hover:shadow-md shadow-red-500/10'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {setting.action.label}
                            </button>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const renderSettingItem = (setting: Setting) => {
        switch (setting.type) {
            case 'toggle':
                return (
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 mt-3">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {setting.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {setting.description}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => setting.onChange(!setting.defaultValue)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${setting.defaultValue
                                    ? 'bg-indigo-600 dark:bg-indigo-500'
                                    : 'bg-gray-200 dark:bg-gray-600'
                                    }`}
                                role="switch"
                                aria-checked={setting.defaultValue}
                            >
                                <span className="sr-only">Enable {setting.name}</span>
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${setting.defaultValue ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                );

            case 'select':
                return (
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 mt-3">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {setting.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {setting.description}
                            </p>
                        </div>
                        <div className="flex items-center ml-4">
                            <select
                                value={setting.defaultValue}
                                onChange={(e) => setting.onChange(e.target.value)}
                                className="block rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {setting.options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );

            case 'theme-select':
                return (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 mt-3">
                        <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {setting.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {setting.description}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setting.onChange('light')}
                                className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border transition-all duration-200 ${setting.defaultValue === 'light'
                                        ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Sun size={18} className="text-amber-500" />
                                </div>
                                <span className="font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => setting.onChange('dark')}
                                className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border transition-all duration-200 ${setting.defaultValue === 'dark'
                                        ? 'bg-gray-900 border-gray-700 text-white shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Moon size={18} className="text-indigo-500" />
                                </div>
                                <span className="font-medium">Dark</span>
                            </button>
                        </div>
                    </div>
                );

            default:
                return renderAccountItem(setting);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 p-4">
            <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back to Scout</span>
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">Settings</h1>
                </div>

                {/* Settings Grid */}
                <div className="space-y-6">
                    {settingsSections.map((section) => (
                        <div
                            key={section.title}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                    {section.icon}
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{section.title}</h2>
                            </div>

                            <div className="space-y-2">
                                {section.settings.map((setting, idx) => (
                                    <div key={`${section.title}-setting-${idx}`}>
                                        {renderSettingItem(setting)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <p className="font-medium">Scout.io Settings • Version 1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage; 