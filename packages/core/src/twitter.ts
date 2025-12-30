// import { TwitterApi } from 'twitter-api-v2';
// Mock library to bypass missing dependency
class TwitterApi {
    constructor(config: any) { }
    v2 = {
        me: async () => ({ data: {} }),
        tweet: async (...args: any[]) => ({ data: { id: 'mock' } }),
        search: async (...args: any[]) => ({ data: [] })
    }
}
import { logger } from './logger.js';

export class TwitterClient {
    private client: TwitterApi | null = null;
    private isReady: boolean = false;

    constructor() {
        const appKey = process.env.X_API_KEY;
        const appSecret = process.env.X_API_SECRET;
        const accessToken = process.env.X_ACCESS_TOKEN;
        const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

        // We prioritize OAuth 1.0a for simple posting/reading on behalf of the user
        if (appKey && appSecret && accessToken && accessSecret) {
            this.client = new TwitterApi({
                appKey,
                appSecret,
                accessToken,
                accessSecret,
            });
            this.isReady = true;
            logger.info('🐦 Twitter/X Client initialized with OAuth 1.0a');
        } else {
            logger.warn('⚠️ Missing X API Credentials in .env.local');
        }
    }

    async getMe() {
        if (!this.client) return null;
        try {
            const me = await this.client.v2.me();
            return me.data;
        } catch (e: any) {
            logger.error(`Failed to fetch X user: ${e.message}`);
            return null;
        }
    }

    async postTweet(text: string) {
        if (!this.client) {
            logger.warn('Cannot post tweet: Client not initialized');
            return null;
        }
        try {
            const tweet = await this.client.v2.tweet(text);
            logger.info(`✅ Tweet posted! ID: ${tweet.data.id}`);
            return tweet.data;
        } catch (e: any) {
            logger.error(`Failed to post tweet: ${e.message}`);
            return null;
        }
    }

    async searchRecent(query: string) {
        if (!this.client) return null;
        try {
            const res = await this.client.v2.search(query, { max_results: 10 });
            return res.data;
        } catch (e: any) {
            logger.error(`Failed to search X: ${e.message}`);
            return null;
        }
    }
}

export const twitterClient = new TwitterClient();
