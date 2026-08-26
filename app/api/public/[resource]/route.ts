import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const routes: Record<string, string> = {
    settings: '/api/general-setting',
    home: '/api/v1/public/home',
    providers: '/api/v1/public/providers',
    categories: '/api/v1/public/categories',
    games: '/api/v1/public/games',
};

/** Proxies allowlisted public read requests to Laravel. */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> },
) {
    const { resource } = await params;
    const path = routes[resource];
    if (!path) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    try {
        const upstream = await upstreamFetch(
            `${backend}${path}${request.nextUrl.search}`,
            { headers: { Accept: 'application/json' }, cache: 'no-store' },
            true,
        );
        return NextResponse.json(await upstream.json(), { status: upstream.status });
    } catch {
        return NextResponse.json(
            { status: 'error', message: 'The catalogue service is temporarily unavailable.' },
            { status: 502 },
        );
    }
}

/** Proxies a public game click without exposing the Laravel origin to the browser. */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> },
) {
    const { resource } = await params;
    if (resource !== 'click') {
        return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    }

    try {
        const payload = (await request.json()) as { game_id?: unknown };
        const gameId = Number(payload.game_id);
        if (!Number.isSafeInteger(gameId) || gameId < 1) {
            return NextResponse.json(
                { status: 'error', message: 'A valid game is required.' },
                { status: 422 },
            );
        }

        const upstream = await upstreamFetch(
            `${backend}/api/v1/public/games/${gameId}/click`,
            {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: '{}',
                cache: 'no-store',
            },
            false,
        );
        return NextResponse.json(await upstream.json(), { status: upstream.status });
    } catch {
        return NextResponse.json(
            { status: 'error', message: 'The catalogue service is temporarily unavailable.' },
            { status: 502 },
        );
    }
}
