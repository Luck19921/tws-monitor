import { NextResponse } from 'next/server';
import axios from 'axios';
import NodeCache from 'node-cache';

export const dynamic = 'force-dynamic';

// Cache for 2 hours
const metricsCache = new NodeCache({ stdTTL: 7200 });

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
        const cacheKey = `metrics_${symbol}`;

        const cached = metricsCache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const startDate = getPastDateString(30); // Get last 30 days to ensure we have the most recent trading day

        // Fetch Data from FinMind Concurrently
        const [institutionalRes, marginRes] = await Promise.all([
            axios.get('https://api.finmindtrade.com/api/v4/data', {
                params: { dataset: 'TaiwanStockInstitutionalInvestorsBuySell', data_id: symbol, start_date: startDate }
            }),
            axios.get('https://api.finmindtrade.com/api/v4/data', {
                params: { dataset: 'TaiwanStockMarginPurchaseShortSale', data_id: symbol, start_date: startDate }
            })
        ]);

        // Process Institutional Data (Foreign, Trust, Dealer)
        let institutional = {
            foreignBuy: 0, foreignSell: 0,
            trustBuy: 0, trustSell: 0,
            dealerBuy: 0, dealerSell: 0,
            date: ''
        };

        if (institutionalRes.data?.msg === 'success' && institutionalRes.data?.data?.length > 0) {
            const data = institutionalRes.data.data;
            // Get the latest available date
            const latestDate = data[data.length - 1].date;
            institutional.date = latestDate;

            const latestDayData = data.filter((d: any) => d.date === latestDate);
            latestDayData.forEach((item: any) => {
                if (item.name === 'Foreign_Investor') {
                    institutional.foreignBuy = item.buy;
                    institutional.foreignSell = item.sell;
                } else if (item.name === 'Investment_Trust') {
                    institutional.trustBuy = item.buy;
                    institutional.trustSell = item.sell;
                } else if (item.name.includes('Dealer')) { // Dealer_self & Dealer_Hedging
                    institutional.dealerBuy += item.buy;
                    institutional.dealerSell += item.sell;
                }
            });
        }

        // Process Margin Data (Margin Purchase 融資 & Short Sale 融券)
        let margin = {
            MarginPurchaseTodayBalance: 0,
            MarginPurchaseLimit: 0,
            ShortSaleTodayBalance: 0,
            ShortSaleLimit: 0,
            date: ''
        };

        if (marginRes.data?.msg === 'success' && marginRes.data?.data?.length > 0) {
            const data = marginRes.data.data;
            const latest = data[data.length - 1]; // Assume array is sorted by date ascending
            margin = {
                MarginPurchaseTodayBalance: latest.MarginPurchaseTodayBalance,
                MarginPurchaseLimit: latest.MarginPurchaseLimit,
                ShortSaleTodayBalance: latest.ShortSaleTodayBalance,
                ShortSaleLimit: latest.ShortSaleLimit,
                date: latest.date
            };
        }

        const result = {
            symbol,
            institutional,
            margin
        };

        metricsCache.set(cacheKey, result);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Metrics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch advanced metrics' }, { status: 500 });
    }
}
