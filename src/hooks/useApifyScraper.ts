import { useState, useCallback, useRef, useEffect } from 'react';
import apifyService from '@/services/apifyService';
import { toast } from 'sonner';

interface ScrapingState {
    isLoading: boolean;
    error: string | null;
    results: any[] | null;
    runId: string | null;
}

export function useApifyScraper() {
    const [state, setState] = useState<ScrapingState>({
        isLoading: false,
        error: null,
        results: null,
        runId: null,
    });

    // Use refs to handle cleanup and prevent memory leaks
    const checkIntervalRef = useRef<NodeJS.Timeout>();
    const timeoutRef = useRef<NodeJS.Timeout>();
    const isMounted = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const startScraping = useCallback(async (url: string) => {
        if (!apifyService.isConfigured()) {
            toast.error('Apify API is not configured properly');
            return;
        }

        if (!apifyService.validateProductUrl(url)) {
            toast.error('Invalid product URL');
            return;
        }

        // Clear any existing intervals/timeouts
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setState(prev => ({ ...prev, isLoading: true, error: null, results: null }));

        try {
            const run = await apifyService.startScraping({
                startUrls: [{ url }],
                maxRequestsPerCrawl: 1, // Limit to just the target URL
            });

            if (!isMounted.current) return;
            setState(prev => ({ ...prev, runId: run.id }));

            // Poll for results
            checkIntervalRef.current = setInterval(async () => {
                if (!isMounted.current) {
                    clearInterval(checkIntervalRef.current);
                    return;
                }

                try {
                    const status = await apifyService.getRunStatus(run.id);

                    if (status.status === 'SUCCEEDED') {
                        clearInterval(checkIntervalRef.current);
                        const results = await apifyService.getRunResults(run.id);

                        if (!isMounted.current) return;
                        setState(prev => ({
                            ...prev,
                            isLoading: false,
                            results: results.items,
                        }));
                        toast.success('Scraping completed successfully');
                    } else if (status.status === 'FAILED' || status.status === 'TIMED-OUT') {
                        clearInterval(checkIntervalRef.current);
                        throw new Error(`Scraping ${status.status.toLowerCase()}`);
                    }
                } catch (error) {
                    if (!isMounted.current) return;
                    clearInterval(checkIntervalRef.current);
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'An error occurred',
                    }));
                    toast.error('Scraping failed');
                }
            }, 2000);

            // Set timeout
            timeoutRef.current = setTimeout(() => {
                if (!isMounted.current) return;
                clearInterval(checkIntervalRef.current);
                if (state.isLoading) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: 'Scraping timed out',
                    }));
                    toast.error('Scraping timed out');
                }
            }, 300000); // 5 minutes

        } catch (error) {
            if (!isMounted.current) return;
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'An error occurred',
            }));
            toast.error('Failed to start scraping');
        }
    }, []);

    const stopScraping = useCallback(async () => {
        if (state.runId && state.isLoading) {
            try {
                await apifyService.stopRun(state.runId);
                if (!isMounted.current) return;
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Scraping cancelled by user',
                }));
                toast.info('Scraping cancelled');
            } catch (error) {
                if (!isMounted.current) return;
                toast.error('Failed to stop scraping');
            }
        }
    }, [state.runId, state.isLoading]);

    return {
        ...state,
        startScraping,
        stopScraping,
    };
} 