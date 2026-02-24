import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const watchLists = await prisma.watchList.findMany({
            include: {
                stocks: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(watchLists);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch WatchLists' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newWatchList = await prisma.watchList.create({
            data: { name },
            include: { stocks: true }
        });

        return NextResponse.json(newWatchList, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create WatchList' }, { status: 500 });
    }
}
