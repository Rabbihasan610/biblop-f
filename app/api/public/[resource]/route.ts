import { cookies } from 'next/headers';
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
const fallbackRoutes: Record<string, string[]> = {
    home: ['/api/home'],
    providers: ['/api/providers'],
    categories: ['/api/categories'],
    games: ['/api/games'],
};

/**
 * Keeps Laravel-hosted public assets behind the same origin as the frontend.
 *
 * Laravel returns absolute URLs (often 127.0.0.1 in local/standalone setups).
 * Sending those URLs to the browser both leaks the internal origin and makes
 * images fail under the frontend CSP. Next's /assets and /uploads rewrites are
 * the browser-safe public entry points.
 */
function sameOriginAssets(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sameOriginAssets);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, child]) => [key, sameOriginAssets(child)]),
        );
    }
    if (typeof value !== 'string') return value;

    try {
        const url = new URL(value);
        const upstreamOrigin = new URL(backend).origin;
        if (
            url.origin === upstreamOrigin &&
            (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/uploads/'))
        ) {
            return `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        // Non-URL strings are ordinary API data and should remain unchanged.
    }
    return value;
}

/** Proxies allowlisted public read requests to Laravel. */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resource: string }> },
) {
    const { resource } = await params;
    const primaryPath = routes[resource];
    if (!primaryPath) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    const candidates = [primaryPath, ...(fallbackRoutes[resource] ?? [])];
    try {
        let lastError: unknown;
        for (const path of candidates) {
            try {
                const upstream = await upstreamFetch(
                    `${backend}${path}${request.nextUrl.search}`,
                    { headers: { Accept: 'application/json' }, cache: 'no-store' },
                    true,
                );
                return NextResponse.json(sameOriginAssets(await upstream.json()), {
                    status: upstream.status,
                });
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError instanceof Error ? lastError : new Error('Catalogue API unavailable');
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
        const payload = (await request.json().catch(() => ({}))) as { game_id?: unknown; id?: unknown };
        const gameId = Number(payload.game_id ?? payload.id);
        if (!Number.isSafeInteger(gameId) || gameId < 1) {
            return NextResponse.json(
                { status: 'error', message: 'A valid game is required.' },
                { status: 422 },
            );
        }

        const token = (await cookies()).get('jaba9_token')?.value
            ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
        const upstream = await upstreamFetch(
            `${backend}/api/v1/catalogue/games/${gameId}/launch`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ game_id: gameId }),
                cache: 'no-store',
            },
            false,
        );
        const responsePayload = await upstream.json().catch(() => ({ status: 'error', message: 'Upstream returned no content.' }));
        return NextResponse.json(sameOriginAssets(responsePayload), { status: upstream.status });
    } catch {
        return NextResponse.json(
            { status: 'error', message: 'The catalogue service is temporarily unavailable.' },
            { status: 502 },
        );
    }
}
