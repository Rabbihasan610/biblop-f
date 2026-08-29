import { GamePlayer } from '@/components/GamePlayer';
import { SiteShell } from '@/components/SiteShell';
export default async function GamePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ id?: string }> }) { const [{ slug }, query] = await Promise.all([params, searchParams]); return <SiteShell><GamePlayer slug={slug} id={query.id}/></SiteShell>; }
