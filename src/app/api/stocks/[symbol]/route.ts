import { NextResponse } from 'next/server';
import { getYahooQuote } from '@/lib/api/yahoo';
import { fetchTWSESnapshot } from '@/lib/api/twse';
import { getFinancialStats } from '@/lib/api/finmind';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;

        // Primary: Yahoo Finance for real-time quote
        // Secondary: TWSE OpenAPI for cross-validation + financial stats
        const [yahooQuote, stats] = await Promise.all([
            getYahooQuote(symbol).catch(e => {
                console.error("Yahoo Finance API err:", e.message);
                return null;
            }),
            getFinancialStats(symbol).catch(e => {
                console.error("TWSE BWIBBU API err:", e.message);
                return null;
            })
        ]);

        // Cross-validation: compare Yahoo price with TWSE closing price
        let crossValidation = null;
        try {
            const twseData = await fetchTWSESnapshot(
                'STOCK_DAY_ALL',
                'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'
            );
            const twseStock = twseData.find((s: any) => s.Code === symbol);
            if (twseStock && yahooQuote) {
                const twsePrice = parseFloat(twseStock.ClosingPrice) || 0;
                crossValidation = {
                    yahooPrice: yahooQuote.price,
                    twsePrice: twsePrice,
                    diff: Math.abs(yahooQuote.price - twsePrice),
                    matched: Math.abs(yahooQuote.price - twsePrice) < 5 // Allow small intraday variance
                };
                if (!crossValidation.matched) {
                    console.warn(`⚠️ Cross-validation mismatch for ${symbol}: Yahoo=${yahooQuote.price}, TWSE=${twsePrice}`);
                }
            }
        } catch (e) {
            // TWSE cross-validation is best-effort, don't block main response
        }

        if (!yahooQuote) {
            return NextResponse.json({ error: 'Failed to fetch stock data from all sources' }, { status: 500 });
        }

        return NextResponse.json({
            symbol,
            quote: {
                symbol: yahooQuote.symbol,
                name: yahooQuote.name,
                price: yahooQuote.price,
                change: yahooQuote.change,
                changePercent: yahooQuote.changePercent,
                open: yahooQuote.open,
                high: yahooQuote.high,
                low: yahooQuote.low,
                volume: yahooQuote.volume,
                previousClose: yahooQuote.previousClose,
                marketState: yahooQuote.marketState,
            },
            stats,
            crossValidation,
            source: 'yahoo-finance',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stock API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stock details' }, { status: 500 });
    }
}
