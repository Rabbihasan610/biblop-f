'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fallbackGames, type Game } from '@/lib/fallback-data';
import { Icon } from './Icons';

function normalizeGameList(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (!value || typeof value !== 'object') return [];
  const object = value as Record<string, unknown>;
  for (const key of ['data', 'games', 'items']) {
    const candidate = object[key];
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as Record<string, unknown>[];
      if (Array.isArray(nested.games)) return nested.games as Record<string, unknown>[];
      if (Array.isArray(nested.items)) return nested.items as Record<string, unknown>[];
    }
  }
  return [];
}

export function GamePlayer({ slug, id }: { slug: string; id?: string }) {
  const fallback = fallbackGames.find(item => item.slug === slug || String(item.id) === id) || fallbackGames[0];
  const [game, setGame] = useState<Game>(fallback), [fallbackMode, setFallbackMode] = useState(true), [started, setStarted] = useState(false);
  useEffect(() => {
    fetch(`/api/public/games?search=${encodeURIComponent(slug)}&per_page=20`, { headers: { Accept: 'application/json' } }).then(response => response.json()).then(payload => {
      const raw = normalizeGameList(payload?.data ?? payload);
      const found = raw.find((item: Record<string, unknown>) => String(item.slug) === slug || String(item.id) === id) || raw[0];
      if (!found) return;
      setGame({ ...fallback, ...found, id: Number(found.id || fallback.id), name: String(found.name || fallback.name), slug: String(found.slug || slug), launch_url: String(found.launch_url || found.iframe_url || found.url || '') }); setFallbackMode(false);
    }).catch(() => setFallbackMode(true));
  }, [fallback, id, slug]);
  async function startGame() {
    try {
      const response = await fetch('/api/public/click', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ game_id: game.id, id: game.id }) });
      const payload = await response.json();
      const launchUrl =
        payload?.data?.iframe_url ||
        payload?.data?.iframe?.src ||
        payload?.data?.launch_url ||
        payload?.data?.url ||
        payload?.data?.redirect_url ||
        payload?.iframe_url ||
        payload?.iframe?.src ||
        payload?.launch_url ||
        payload?.url ||
        payload?.redirect_url;
      if (response.ok && launchUrl) {
        const nextUrl = String(launchUrl);
        setGame(current => ({ ...current, launch_url: nextUrl }));
        // Render the provider URL in this page. Opening a new window after an
        // awaited request is commonly blocked by browsers as a popup.
        setStarted(true);
        return;
      }
    } catch { /* Fallback preview remains available without the upstream service. */ }
    setStarted(true);
  }
  return <main className="page-main game-play-page page-enter">
    <div className="game-breadcrumb"><Link href="/games">Games</Link><Icon name="arrow"/><span>{game.name}</span></div>
    <section className="play-stage">
      {started && game.launch_url ? <iframe src={game.launch_url} title={`${game.name} game`} allow="fullscreen; autoplay; payment" allowFullScreen sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"/> : started ? <div className="play-placeholder demo-running"><span><Icon name="games"/></span><h1>Demo preview active</h1><p>The live provider is unavailable, so no wager or balance change is being made.</p><button className="button-white" onClick={() => setStarted(false)}>Return to game details</button></div> : <div className="play-placeholder"><span>{game.name.slice(0, 2).toUpperCase()}</span><h1>{game.name}</h1><p>{fallbackMode ? 'Fallback preview is active because the game API is unavailable.' : 'The game is ready to launch securely from the provider.'}</p><button className="button-yellow" onClick={() => void startGame()}><Icon name="play"/>Play now</button></div>}
    </section>
    <section className="game-details"><div><p className="eyebrow">Provider</p><h2>{game.provider}</h2></div><div><p className="eyebrow">Category</p><h2>{game.category}</h2></div><div><p className="eyebrow">Data source</p><h2>{fallbackMode ? 'Frontend fallback' : 'Live API'}</h2></div></section>
  </main>;
}
