'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  fallbackCategories,
  fallbackGames,
  fallbackProviders,
  type CatalogueOption,
  type Game,
} from '@/lib/fallback-data';
import { Icon } from './Icons';

type Json = Record<string, unknown>;
const PAGE_SIZE = 12;
const DEFAULT_GAME_IMAGE = '/assets/images/games/default-small.svg';

function arrayFrom(value: unknown): Json[] {
  if (Array.isArray(value)) return value as Json[];
  if (value && typeof value === 'object') {
    const object = value as Json;
    if (Array.isArray(object.data)) return object.data as Json[];
    for (const key of ['games', 'providers', 'categories']) {
      if (Array.isArray(object[key])) return object[key] as Json[];
    }
  }
  return [];
}

function optionOf(item: Json, index: number): CatalogueOption {
  const name = String(item.name || item.title || `Option ${index + 1}`);
  return {
    id: Number(item.id || index + 1),
    name,
    slug: String(item.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
  };
}

function gameOf(item: Json, index: number): Game {
  const provider = (item.provider || {}) as Json;
  const category = (item.category || {}) as Json;
  const name = String(item.name || item.title || `Game ${index + 1}`);
  return {
    id: Number(item.id || index + 1),
    name,
    slug: String(item.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    provider: String(provider.name || item.provider_name || item.provider || 'Provider'),
    provider_slug: String(provider.slug || item.provider_slug || ''),
    category: String(category.name || item.category_name || item.category || 'Game'),
    category_slug: String(category.slug || item.category_slug || ''),
    image_url: String(item.image_url || item.image || ''),
    launch_url: String(item.launch_url || ''),
    is_live: Boolean(item.is_live),
  };
}

function recordGameClick(gameId: number) {
  void fetch('/api/public/click', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId }),
    keepalive: true,
  }).catch(() => undefined);
}

export function CatalogueExplorer({
  title = 'All Games',
  description = 'Search every enabled game, category and provider.',
  initialCategory = '',
  initialProvider = '',
  initialSearch = '',
  directory,
}: {
  title?: string;
  description?: string;
  initialCategory?: string;
  initialProvider?: string;
  initialSearch?: string;
  directory?: 'categories' | 'providers';
}) {
  const [games, setGames] = useState<Game[]>(fallbackGames);
  const [categories, setCategories] = useState(fallbackCategories);
  const [providers, setProviders] = useState(fallbackProviders);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [provider, setProvider] = useState(initialProvider);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<'api' | 'fallback'>('fallback');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const get = (url: string) => fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    }).then(async response => {
      const payload = await response.json();
      if (!response.ok || payload.status !== 'success') throw new Error('API unavailable');
      return payload as { data: unknown; meta?: { pagination?: { last_page?: number } } };
    });
    Promise.all([
      get('/api/public/games?per_page=48'),
      get('/api/public/categories'),
      get('/api/public/providers'),
    ]).then(async ([firstGames, categoryPayload, providerPayload]) => {
      const lastPage = Math.max(1, Number(firstGames.meta?.pagination?.last_page || 1));
      const remainingPages = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, index) =>
          get(`/api/public/games?per_page=48&page=${index + 2}`)),
      );
      const gameData = [firstGames, ...remainingPages].flatMap(payload => arrayFrom(payload.data));
      const categoryData = arrayFrom(categoryPayload.data);
      const providerData = arrayFrom(providerPayload.data);
      const apiGames = gameData.map(gameOf);
      const apiCategories = categoryData.map(optionOf);
      const apiProviders = providerData.map(optionOf);
      if (apiGames.length) setGames(apiGames);
      if (apiCategories.length) setCategories(apiCategories);
      const nestedProviders = categoryData.flatMap(item => arrayFrom(item.providers)).map(optionOf);
      if (apiProviders.length || nestedProviders.length) {
        setProviders(apiProviders.length
          ? apiProviders
          : nestedProviders.filter((item, index, all) => all.findIndex(candidate => candidate.slug === item.slug) === index));
      }
      if (apiGames.length || apiCategories.length) setSource('api');
    }).catch(() => setSource('fallback')).finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => games.filter(game => {
    const term = search.trim().toLowerCase();
    return (!term || `${game.name} ${game.provider} ${game.category}`.toLowerCase().includes(term))
      && (!category || game.category_slug === category)
      && (!provider || game.provider_slug === provider);
  }), [games, search, category, provider]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const directoryItems = directory === 'categories' ? categories : providers;

  function change(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return <main className="page-main catalogue-page page-enter">
    <section className="catalogue-intro">
      <p className="eyebrow">Game catalogue</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <span className={`source-badge ${source}`}>{loading ? 'Connecting…' : source === 'api' ? 'Live API data' : 'Fallback data'}</span>
    </section>

    {directory && <section className="home-content-section" aria-label={`${directory} directory`}>
      <div className="home-section-heading">
        <h2><span/>All {directory === 'categories' ? 'Categories' : 'Providers'}</h2>
      </div>
      <div className="catalogue-directory-scroll">
        {directoryItems.map(item => <Link className="cat-item" key={item.slug} href={`/${directory === 'categories' ? 'category' : 'provider'}/${item.slug}`}>{item.name}</Link>)}
      </div>
    </section>}

    <section className="home-content-section catalogue-panel">
      <div className="home-section-heading">
        <h2><span/>{title}</h2>
        <p><strong>{filtered.length}</strong> games · Page {currentPage} of {pages}</p>
      </div>
      <div className="catalogue-tools">
        <label className="search-field"><Icon name="search"/><input value={search} onChange={event => change(setSearch, event.target.value)} placeholder="Search games, categories or providers" aria-label="Global catalogue search"/></label>
        <label><span>Category</span><select value={category} onChange={event => change(setCategory, event.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label><span>Provider</span><select value={provider} onChange={event => change(setProvider, event.target.value)}><option value="">All providers</option>{providers.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <button className="reset-filter" onClick={() => { setSearch(''); setCategory(''); setProvider(''); setPage(1); }}><Icon name="filter"/>Reset</button>
      </div>

      <div className="home-game-grid">
        {visible.length ? visible.map(game => <Link
          className="game-card"
          href={`/game/${game.slug}?id=${game.id}`}
          key={game.id}
          title={`${game.name} · ${game.provider}`}
          onClick={() => recordGameClick(game.id)}
        >
          {/* A native image preserves the exact home-card sizing for dynamic API URLs. */}
          <img
            src={game.image_url || DEFAULT_GAME_IMAGE}
            alt={game.name}
            loading="lazy"
            onError={event => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_GAME_IMAGE;
            }}
          />
          <div className="game-name">{game.name}</div>
        </Link>) : <div className="empty-state"><Icon name="search"/><h2>No matching games</h2><p>Try clearing one or more filters.</p></div>}
      </div>

      <nav className="pagination" aria-label="Catalogue pages">
        <button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
        {Array.from({ length: pages }, (_, index) => index + 1)
          .slice(Math.max(0, page - 3), Math.max(5, page + 2))
          .map(value => <button className={value === page ? 'active' : ''} key={value} onClick={() => setPage(value)} aria-current={value === page ? 'page' : undefined}>{value}</button>)}
        <button disabled={page >= pages} onClick={() => setPage(value => value + 1)}>Next</button>
      </nav>
    </section>
  </main>;
}
