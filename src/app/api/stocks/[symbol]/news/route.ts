import { NextResponse } from 'next/server';
import { fetchContextualNews } from '@/lib/api/news';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;

        // Fetch News 
        const news = await fetchContextualNews(symbol);

        return NextResponse.json({ symbol, news });

    } catch (error) {
        console.error('News API Route Error:', error);
        return NextResponse.json({ error: 'Failed to fetch contextual news' }, { status: 500 });
    }
}
