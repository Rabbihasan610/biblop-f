import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/SiteShell';
import { UserArea } from '@/components/UserArea';
const sections = ['dashboard','deposit','withdraw','transactions','profile'] as const;
type Section = typeof sections[number];
export const metadata: Metadata = { title: 'User Account | Jaba9' };
export default async function UserPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; if (!sections.includes(section as Section)) notFound(); return <SiteShell><UserArea section={section as Section}/></SiteShell>; }
