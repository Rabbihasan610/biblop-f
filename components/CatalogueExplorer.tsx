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
const DEFAULT_CATALOGUE_REQUEST = '/api/public/games?per_page=48';
const DEFAULT_GAME_IMAGE = '/assets/images/games/default-small.svg';

function normalizeCollection(value: unknown): Json[] {
  if (Array.isArray(value)) return value as Json[];
  if (!value || typeof value !== 'object') return [];

  const object = value as Json;
  for (const key of ['data', 'games', 'providers', 'categories', 'items']) {
    const candidate = object[key];
    if (Array.isArray(candidate)) return candidate as Json[];
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Json;
      if (Array.isArray(nested.data)) return nested.data as Json[];
      if (Array.isArray(nested.items)) return nested.items as Json[];
      if (Array.isArray(nested.games)) return nested.games as Json[];
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
  const [pageCount, setPageCount] = useState(1);
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
      return payload as { data: unknown; meta?: { pagination?: { last_page?: number; total?: number } } };
    });

    Promise.all([
      get('/api/public/categories'),
      get('/api/public/providers'),
    ]).then(([categoryPayload, providerPayload]) => {
      const categoryData = normalizeCollection(categoryPayload.data);
      const providerData = normalizeCollection(providerPayload.data);
      const apiCategories = categoryData.map(optionOf);
      const apiProviders = providerData.map(optionOf);
      if (apiCategories.length) setCategories(apiCategories);
      const nestedProviders = categoryData.flatMap(item => normalizeCollection((item.providers as Json) ?? [])).map(optionOf);
      if (apiProviders.length || nestedProviders.length) {
        setProviders(apiProviders.length
          ? apiProviders
          : nestedProviders.filter((item, index, all) => all.findIndex(candidate => candidate.slug === item.slug) === index));
      }
    }).catch(() => undefined);

    const query = new URLSearchParams({ page: String(page) });
    if (search.trim()) query.set('search', search.trim());
    if (category) query.set('category', category);
    if (provider) query.set('provider', provider);

    const requestUrl = `${DEFAULT_CATALOGUE_REQUEST}&${query.toString()}`;

    get(requestUrl)
      .then((payload) => {
        const apiGames = normalizeCollection(payload.data).map(gameOf);
        setGames(apiGames);
        setPageCount(Math.max(1, Number(payload.meta?.pagination?.last_page || 1)));
        setSource(apiGames.length ? 'api' : 'fallback');
      })
      .catch(() => {
        setGames(fallbackGames);
        setPageCount(1);
        setSource('fallback');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, search, category, provider]);

  const filtered = useMemo(() => games, [games]);

  const pages = Math.max(1, pageCount);
  const currentPage = Math.min(page, pages);
  const visible = filtered;
  const directoryItems = directory === 'categories' ? categories : providers;

  function change(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > pages) return;
    setPage(nextPage);
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
        <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>Previous</button>
        {Array.from({ length: pages }, (_, index) => index + 1)
          .slice(Math.max(0, currentPage - 3), Math.max(5, currentPage + 2))
          .map(value => <button className={value === currentPage ? 'active' : ''} key={value} onClick={() => goToPage(value)} aria-current={value === currentPage ? 'page' : undefined}>{value}</button>)}
        <button disabled={currentPage >= pages} onClick={() => goToPage(currentPage + 1)}>Next</button>
      </nav>
    </section>
  </main>;
}
