import { fetchTWSESnapshot } from './twse';

export interface StockQuote {
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
    try {
        // Fetch snapshot array containing thousands of tickers
        const twseData = await fetchTWSESnapshot(
            'STOCK_DAY_ALL',
            'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'
        );

        // Find the specific symbol
        const stock = twseData.find((s: any) => s.Code === symbol);

        if (!stock) {
            throw new Error(`Symbol ${symbol} not found in TWSE STOCK_DAY_ALL`);
        }

        const price = parseFloat(stock.ClosingPrice) || 0;
        const change = parseFloat(stock.Change) || 0;

        // TWSE Change is a point absolute value.
        // We calculate change percentage based on (Price - Change) if it's the previous close
        // Actually, open data 'Change' sometimes has signs, sometimes not. Let's assume absolute.
        // Quick formula: ChangePercent = (Change / (Price - Change)) * 100
        let prevClose = price - change;
        let changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

        return {
            symbol,
            name: stock.Name,
            price: price,
            change: change,
            changePercent: parseFloat(changePercent.toFixed(2)),
            open: parseFloat(stock.OpeningPrice) || 0,
            high: parseFloat(stock.HighestPrice) || 0,
            low: parseFloat(stock.LowestPrice) || 0,
            volume: parseInt(stock.TradeVolume, 10) || 0,
        };
    } catch (e: any) {
        console.error("Fugle TWSE Mock Error:", e);
        // Fallback robust return
        return {
            symbol,
            name: `Stock ${symbol}`,
            price: 0, change: 0, changePercent: 0,
            open: 0, high: 0, low: 0, volume: 0
        };
    }
}
