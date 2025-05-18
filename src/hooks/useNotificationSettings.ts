import { useState, useEffect } from 'react';

interface NotificationSettings {
    priceDropAlerts: boolean;
    alertSound: boolean;
    checkFrequency: string;
}

export const useNotificationSettings = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        priceDropAlerts: true,
        alertSound: true,
        checkFrequency: '15 minutes'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load settings from Chrome storage when component mounts
        const loadSettings = async () => {
            try {
                const result = await chrome.storage.sync.get([
                    'priceDropAlerts',
                    'alertSound',
                    'checkFrequency'
                ]);

                setSettings({
                    priceDropAlerts: result.priceDropAlerts ?? true,
                    alertSound: result.alertSound ?? true,
                    checkFrequency: result.checkFrequency ?? '15 minutes'
                });
            } catch (error) {
                console.error('Error loading notification settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        try {
            // Update Chrome storage
            await chrome.storage.sync.set(newSettings);

            // Update local state
            setSettings(prev => ({
                ...prev,
                ...newSettings
            }));

            // If price drop alerts were enabled, send message to background script
            if (newSettings.priceDropAlerts === true) {
                chrome.runtime.sendMessage({ type: 'CHECK_PRICE_ALERTS' });
            }

            return true;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            return false;
        }
    };

    return {
        settings,
        isLoading,
        updateSettings
    };
}; 