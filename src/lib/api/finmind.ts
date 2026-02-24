import { fetchTWSESnapshot } from './twse';

export interface FinancialStats {
    symbol: string;
    peRatio: number;
    pbRatio: number;
    dividendYield: number;
    revenueGrowth: number;
    grossMargin: number;
    operatingMargin: number;
    debtToEquity: number;
}

export async function getFinancialStats(symbol: string): Promise<FinancialStats> {
    try {
        // Taiwan Stock BWIBBU (Yield, P/E, P/B)
        const twseData = await fetchTWSESnapshot(
            'BWIBBU_ALL',
            'https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL'
        );

        const stock = twseData.find((s: any) => s.Code === symbol);

        if (stock) {
            return {
                symbol,
                peRatio: parseFloat(stock.PEratio) || 0, // It could be empty or '-' if negative earnings
                pbRatio: parseFloat(stock.PBratio) || 0,
                dividendYield: parseFloat(stock.DividendYield) || 0,
                // Mock structural data for quarterly metrics (since Open API is daily only)
                revenueGrowth: 15.2,
                grossMargin: 38.6,
                operatingMargin: 20.1,
                debtToEquity: 0.45,
            };
        }
    } catch (e) {
        console.error("Finmind TWSE Sync Error:", e);
    }

    // Fallback if data fails or stock doesn't exist
    return {
        symbol, peRatio: 0, pbRatio: 0, dividendYield: 0,
        revenueGrowth: 0, grossMargin: 0, operatingMargin: 0, debtToEquity: 0
    };
}
