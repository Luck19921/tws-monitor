import { NextResponse } from 'next/server';
import { getYahooHistory } from '@/lib/api/yahoo';
import axios from 'axios';

export const dynamic = 'force-dynamic';

// Fallback cache for FinMind (if Yahoo fails)
let finmindCache: Record<string, { timestamp: number, data: any[] }> = {};
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

function getPastDateString(daysAgo: number) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;

        // PRIMARY: Yahoo Finance Historical Data
        try {
            const yahooData = await getYahooHistory(symbol, 180);
            if (yahooData && yahooData.length > 0) {
                console.log(`📈 Yahoo Finance: Fetched ${yahooData.length} days of history for ${symbol}`);
                return NextResponse.json({
                    symbol,
                    data: yahooData,
                    source: 'yahoo-finance'
                });
            }
        } catch (yahooErr: any) {
            console.warn(`Yahoo History failed for ${symbol}:`, yahooErr.message);
        }

        // FALLBACK: FinMind TaiwanStockPrice
        const cached = finmindCache[symbol];
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            return NextResponse.json({ symbol, data: cached.data, source: 'finmind-cache' });
        }

        const startDate = getPastDateString(180);
        console.log(`📉 Falling back to FinMind for ${symbol} starting ${startDate}`);

        const res = await axios.get('https://api.finmindtrade.com/api/v4/data', {
            params: {
                dataset: 'TaiwanStockPrice',
                data_id: symbol,
                start_date: startDate
            }
        });

        if (res.data?.msg === 'success' && res.data?.data) {
            const formattedData = res.data.data.map((item: any) => ({
                time: item.date,
                open: item.open,
                high: item.max,
                low: item.min,
                close: item.close,
                value: item.Trading_Volume
            }));

            finmindCache[symbol] = { timestamp: Date.now(), data: formattedData };

            return NextResponse.json({
                symbol,
                data: formattedData,
                source: 'finmind'
            });
        }

        throw new Error(res.data?.msg || 'All history sources failed');

    } catch (error) {
        console.error('History API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch historical data from all sources' }, { status: 500 });
    }
}
