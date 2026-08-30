import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentShell } from '@/components/PublicContentShell';
import { CatalogueExplorer } from '@/components/CatalogueExplorer';
import { SiteShell } from '@/components/SiteShell';
import { publicPages } from '@/lib/public-content';

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return Object.keys(publicPages).filter(slug => slug !== 'games').map(slug => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = (await params).slug.join('/');
  const page = publicPages[key];
  return page ? { title: `${page.title} | Jaba9`, description: page.description } : {};
}

export default async function PublicContentPage({ params }: Props) {
  const key = (await params).slug.join('/');
  const page = publicPages[key];
  if (!page) notFound();
  const catalogueRoutes: Record<string, { category: string; search?: string }> = {
    cricket: { category: 'sports', search: 'cricket' }, casino: { category: 'live-casino' }, slot: { category: 'slots' },
    sportsbook: { category: 'sports' }, fishing: { category: 'fishing' }, crash: { category: 'crash' },
  };
  const catalogue = catalogueRoutes[key];
  if (catalogue) return <SiteShell><CatalogueExplorer title={page.title} description={page.description} initialCategory={catalogue.category} initialSearch={catalogue.search}/></SiteShell>;
  return <PublicContentShell page={page} />;
}
