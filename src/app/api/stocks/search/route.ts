import { NextResponse } from 'next/server';
import axios from 'axios';
import NodeCache from 'node-cache';

export const dynamic = 'force-dynamic';

// Cache for 24 hours since the stock list doesn't change often intraday
const stockCache = new NodeCache({ stdTTL: 86400 });
const CACHE_KEY = 'twse_stock_list';

interface TWSEStock {
    Code: string;
    Name: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        // 1. Get real stock list from cache or TWSE API
        let stockList: TWSEStock[] | undefined = stockCache.get(CACHE_KEY);

        if (!stockList) {
            console.log('Fetching fresh stock list from TWSE OpenAPI...');
            const response = await axios.get('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', {
                timeout: 5000 // TWSE API can occasionally hang
            });

            if (response.data && Array.isArray(response.data)) {
                stockList = response.data.map((item: any) => ({
                    Code: item.Code,
                    Name: item.Name
                }));
                stockCache.set(CACHE_KEY, stockList);
            } else {
                throw new Error("Invalid format from TWSE Open API");
            }
        }

        // 2. Perform search
        if (!query || query.trim().length === 0) {
            // Return top 10 if no query (fallback to popular TSMC etc if we want, or just slice)
            const defaultResults = stockList.slice(0, 10).map((s) => ({
                symbol: s.Code,
                name: s.Name
            }));
            return NextResponse.json({ results: defaultResults });
        }

        const normalizedQuery = query.toLowerCase().trim();

        // Exact matches first, then partial matches to improve UX
        const exactMatches = stockList.filter(stock =>
            stock.Code === normalizedQuery || stock.Name === normalizedQuery
        );

        const partialMatches = stockList.filter(stock =>
            (stock.Code.includes(normalizedQuery) || stock.Name.includes(normalizedQuery)) &&
            !(stock.Code === normalizedQuery || stock.Name === normalizedQuery)
        );

        // Combine and limit to 20 results for dropdown performance
        const combinedResults = [...exactMatches, ...partialMatches].slice(0, 20);

        const results = combinedResults.map(stock => ({
            symbol: stock.Code,
            name: stock.Name
        }));

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Search API Error:', error);
        // Fallback gracefully to a hardcoded critical list if TWSE is down
        const fallback = [
            { symbol: '2330', name: '台積電 (Fallback)' },
            { symbol: '2317', name: '鴻海 (Fallback)' },
            { symbol: '2454', name: '聯發科 (Fallback)' }
        ];
        return NextResponse.json({ results: fallback }, { status: 200 });
    }
}
