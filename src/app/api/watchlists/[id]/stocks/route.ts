import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { symbol, name } = await request.json();

        if (!symbol || !name) {
            return NextResponse.json({ error: 'Symbol and name are required' }, { status: 400 });
        }

        const newStock = await prisma.stock.create({
            data: {
                symbol,
                name,
                watchListId: id
            }
        });

        return NextResponse.json(newStock, { status: 201 });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Stock already in watchlist' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to add stock to WatchList' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const stockId = searchParams.get('stockId');

        if (!stockId) {
            return NextResponse.json({ error: 'Stock ID is required' }, { status: 400 });
        }

        await prisma.stock.delete({
            where: {
                id: stockId,
                watchListId: id // Ensure stock belongs to this watchlist
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove stock' }, { status: 500 });
    }
}
