import type { Metadata } from 'next';
import { CatalogueExplorer } from '@/components/CatalogueExplorer';
import { SiteShell } from '@/components/SiteShell';
export const metadata: Metadata = { title: 'All Games | Jaba9', description: 'Search and filter the complete game catalogue.' };
export default function GamesPage() { return <SiteShell><CatalogueExplorer/></SiteShell>; }
