export const APIFY_CONFIG = {
    API_KEY: import.meta.env.VITE_APIFY_API_KEY,
    ACTOR_ID: import.meta.env.VITE_APIFY_ACTOR_ID,
    BASE_URL: 'https://api.apify.com/v2',
};

// Validate environment variables
const requiredEnvVars = ['VITE_APIFY_API_KEY', 'VITE_APIFY_ACTOR_ID'];
for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
        console.warn(`Missing required environment variable: ${envVar}`);
    }
} 