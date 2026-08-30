import type { Metadata } from 'next';
import { CatalogueExplorer } from '@/components/CatalogueExplorer';
import { SiteShell } from '@/components/SiteShell';
export const metadata: Metadata = { title: 'Game Categories | Jaba9' };
export default function CategoriesPage() { return <SiteShell><CatalogueExplorer directory="categories" title="Game Categories" description="Browse every category, then search, filter and paginate its games."/></SiteShell>; }
