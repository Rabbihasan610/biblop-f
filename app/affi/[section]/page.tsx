import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AffiliateArea, type AffiliateSection } from '@/components/AffiliateArea';
import { SiteShell } from '@/components/SiteShell';
const sections: AffiliateSection[] = ['login','register','dashboard','earnings','withdraw','history','deposit','transfer'];
export const metadata: Metadata = { title: 'Affiliate Centre | Jaba9' };
export default async function AffiliatePage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; if (!sections.includes(section as AffiliateSection)) notFound(); return <SiteShell><AffiliateArea section={section as AffiliateSection}/></SiteShell>; }
