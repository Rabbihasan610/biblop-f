import type { Metadata } from 'next';
import { CatalogueExplorer } from '@/components/CatalogueExplorer';
import { SiteShell } from '@/components/SiteShell';
export const metadata: Metadata = { title: 'Game Providers | Jaba9' };
export default function ProvidersPage() { return <SiteShell><CatalogueExplorer directory="providers" title="Game Providers" description="Explore enabled providers and filter their complete game catalogue."/></SiteShell>; }
