import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import NodeCache from 'node-cache';

// Cache news for 30 minutes
const newsCache = new NodeCache({ stdTTL: 1800 });

export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

export async function fetchContextualNews(symbol: string): Promise<NewsItem[]> {
    const cacheKey = `news_${symbol}`;
    const cached = newsCache.get<NewsItem[]>(cacheKey);

    if (cached) return cached;

    try {
        // We use Yahoo Finance Taiwan RSS feed for the specific stock
        const rssUrl = `https://tw.stock.yahoo.com/rss?s=${symbol}`;

        const response = await axios.get(rssUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const parsedXml = await parseStringPromise(response.data);

        // Extract items safely
        const items = parsedXml?.rss?.channel?.[0]?.item || [];

        const news: NewsItem[] = items.slice(0, 5).map((item: any, idx: number) => ({
            id: `${symbol}-news-${idx}`,
            title: item.title?.[0] || 'No Title',
            link: item.link?.[0] || '#',
            pubDate: item.pubDate?.[0] ? new Date(item.pubDate[0]).toLocaleDateString() : 'Unknown Date',
            source: 'Yahoo Finance TW' // Yahoo RSS source
        }));

        newsCache.set(cacheKey, news);
        return news;

    } catch (error) {
        console.error(`Failed to fetch news for ${symbol}:`, error);
        // If RSS fails (e.g. CORS or structure change), return graceful empty array
        return [];
    }
}
