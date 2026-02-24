import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;

        // Deterministic Mock for Investor Composition (Large vs Retail)
        // FinMind API for this is paid tier, and TDCC open data links rotate.
        // We use a deterministic hash of the symbol string to generate stable,
        // realistic looking float distributions for the UI Pie chart.

        let hash = 0;
        for (let i = 0; i < symbol.length; i++) {
            hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate a pseudo-random percentage between 40% and 85% for Large Holders
        const randomSeed = Math.abs(hash) % 1000;
        const largeHolderRatio = 40 + (randomSeed / 1000) * 45;
        const retailRatio = 100 - largeHolderRatio;

        return NextResponse.json({
            symbol,
            dataDate: new Date().toISOString().split('T')[0],
            composition: {
                largeHolders: parseFloat(largeHolderRatio.toFixed(2)),
                retail: parseFloat(retailRatio.toFixed(2))
            }
        });

    } catch (error) {
        console.error('Composition API Route Error:', error);
        return NextResponse.json({ error: 'Failed to fetch composition data' }, { status: 500 });
    }
}
