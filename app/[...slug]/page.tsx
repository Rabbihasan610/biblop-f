import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentShell } from '@/components/PublicContentShell';
import { publicPages } from '@/lib/public-content';

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return Object.keys(publicPages).map(slug => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = (await params).slug.join('/');
  const page = publicPages[key];
  return page ? { title: `${page.title} | JUBO88`, description: page.description } : {};
}

export default async function PublicContentPage({ params }: Props) {
  const key = (await params).slug.join('/');
  const page = publicPages[key];
  if (!page) notFound();
  return <PublicContentShell page={page} />;
}
