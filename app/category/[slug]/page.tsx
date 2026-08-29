import { CatalogueExplorer } from '@/components/CatalogueExplorer';
import { SiteShell } from '@/components/SiteShell';
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const title = slug.split('-').map(word => word[0]?.toUpperCase() + word.slice(1)).join(' '); return <SiteShell><CatalogueExplorer title={`${title} Games`} description={`Search and filter all games in the ${title} category.`} initialCategory={slug}/></SiteShell>; }
