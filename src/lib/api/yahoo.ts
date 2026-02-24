import NodeCache from 'node-cache';

// Cache quotes for 5 minutes, historical for 2 hours
const quoteCache = new NodeCache({ stdTTL: 300 });
const historyCache = new NodeCache({ stdTTL: 7200 });

// Singleton YahooFinance instance (lazy-initialized)
let yfInstance: any = null;
async function getYF() {
    if (!yfInstance) {
        const YahooFinance = (await import('yahoo-finance2')).default;
        yfInstance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });
    }
    return yfInstance;
}

export interface YahooQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    previousClose: number;
    marketState: string;
}

export interface YahooHistoryItem {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    value: number; // volume
}

/**
 * Get a real-time stock quote from Yahoo Finance.
 * Taiwan stocks use the `.TW` suffix (e.g., `2330.TW`).
 */
export async function getYahooQuote(symbol: string): Promise<YahooQuote> {
    const twSymbol = symbol.includes('.') ? symbol : `${symbol}.TW`;
    const cacheKey = `yq_${twSymbol}`;

    const cached = quoteCache.get<YahooQuote>(cacheKey);
    if (cached) return cached;

    const yf = await getYF();
    const q = await yf.quote(twSymbol);

    const result: YahooQuote = {
        symbol: symbol,
        name: q.shortName || q.longName || `Stock ${symbol}`,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        open: q.regularMarketOpen ?? 0,
        high: q.regularMarketDayHigh ?? 0,
        low: q.regularMarketDayLow ?? 0,
        volume: q.regularMarketVolume ?? 0,
        previousClose: q.regularMarketPreviousClose ?? 0,
        marketState: q.marketState || 'UNKNOWN',
    };

    quoteCache.set(cacheKey, result);
    return result;
}

/**
 * Get historical OHLCV data from Yahoo Finance using the `chart()` API.
 * This is the recommended endpoint (historical() is deprecated).
 * Also injects today's live candle from quote() to ensure the chart
 * matches the header price.
 */
export async function getYahooHistory(symbol: string, days: number = 180): Promise<YahooHistoryItem[]> {
    const twSymbol = symbol.includes('.') ? symbol : `${symbol}.TW`;
    const cacheKey = `yh_${twSymbol}_${days}`;

    const cached = historyCache.get<YahooHistoryItem[]>(cacheKey);
    if (cached) return cached;

    const yf = await getYF();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const period1 = startDate.toISOString().split('T')[0];
    const period2 = endDate.toISOString().split('T')[0];

    // Use chart() API — fast and reliable
    const chartResult = await yf.chart(twSymbol, {
        period1,
        period2,
        interval: '1d'
    });

    const quotes = chartResult.quotes || [];

    // Sort ascending by date
    const sorted = quotes.sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const result: YahooHistoryItem[] = sorted
        .filter((item: any) => item.close != null && item.open != null) // Filter out null candles
        .map((item: any) => ({
            time: new Date(item.date).toISOString().split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            value: item.volume || 0
        }));

    // Inject today's live candle from quote() to sync with the header.
    // This ensures the last bar of the chart matches the header price.
    try {
        const liveQuote = await getYahooQuote(symbol);
        const todayStr = new Date().toISOString().split('T')[0];
        const lastCandle = result.length > 0 ? result[result.length - 1] : null;

        if (liveQuote.price > 0 && liveQuote.open > 0) {
            if (lastCandle && lastCandle.time === todayStr) {
                // Update today's existing candle with the latest live values
                lastCandle.open = liveQuote.open;
                lastCandle.high = liveQuote.high;
                lastCandle.low = liveQuote.low;
                lastCandle.close = liveQuote.price;
                lastCandle.value = liveQuote.volume;
            } else {
                // Append an intraday candle for today
                result.push({
                    time: todayStr,
                    open: liveQuote.open,
                    high: liveQuote.high,
                    low: liveQuote.low,
                    close: liveQuote.price,
                    value: liveQuote.volume
                });
            }
        }
    } catch (e) {
        // Live injection is best-effort — chart still works without it
        console.warn('Could not inject live candle:', e);
    }

    historyCache.set(cacheKey, result);
    return result;
}
