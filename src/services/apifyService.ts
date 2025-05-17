import { APIFY_CONFIG } from '@/config/apify';

interface ApifyRunInput {
    startUrls: { url: string }[];
    maxRequestsPerCrawl?: number;
    [key: string]: any;
}

interface ApifyRunOptions {
    memory?: number;
    timeout?: number;
}

class ApifyError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'ApifyError';
    }
}

class ApifyService {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly actorId: string;
    private readonly defaultTimeout: number = 30000; // 30 seconds

    constructor() {
        this.baseUrl = APIFY_CONFIG.BASE_URL;
        this.apiKey = APIFY_CONFIG.API_KEY;
        this.actorId = APIFY_CONFIG.ACTOR_ID;
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (!response.ok) {
                let errorMessage = `Apify API error: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // If parsing error response fails, use default message
                }
                throw new ApifyError(errorMessage, response.status);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof ApifyError) {
                throw error;
            }
            if (error.name === 'AbortError') {
                throw new ApifyError('Request timed out');
            }
            throw new ApifyError(
                error instanceof Error ? error.message : 'An unexpected error occurred'
            );
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async startScraping(input: ApifyRunInput, options: ApifyRunOptions = {}) {
        if (!this.isConfigured()) {
            throw new ApifyError('Apify service is not properly configured');
        }

        const endpoint = `/acts/${this.actorId}/runs`;
        const body = {
            ...input,
            memory: options.memory || 4096,
            timeout: options.timeout || 300,
        };

        return this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async getRunStatus(runId: string) {
        if (!runId) {
            throw new ApifyError('Run ID is required');
        }
        const endpoint = `/acts/${this.actorId}/runs/${runId}`;
        return this.makeRequest(endpoint);
    }

    async getRunResults(runId: string) {
        if (!runId) {
            throw new ApifyError('Run ID is required');
        }
        const endpoint = `/acts/${this.actorId}/runs/${runId}/dataset/items`;
        return this.makeRequest(endpoint);
    }

    async stopRun(runId: string) {
        if (!runId) {
            throw new ApifyError('Run ID is required');
        }
        const endpoint = `/acts/${this.actorId}/runs/${runId}/stop`;
        return this.makeRequest(endpoint, { method: 'POST' });
    }

    isConfigured(): boolean {
        return Boolean(this.apiKey && this.actorId);
    }

    validateProductUrl(url: string): boolean {
        if (!url) return false;
        try {
            const parsedUrl = new URL(url);
            return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch {
            return false;
        }
    }
}

// Create a singleton instance
const apifyService = new ApifyService();

export default apifyService; 