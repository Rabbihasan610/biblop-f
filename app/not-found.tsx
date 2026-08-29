import Link from 'next/link';
import { SiteShell } from '@/components/SiteShell';

export default function NotFound() {
  return <SiteShell>
    <main className="page-main page-enter">
      <section className="page-hero">
        <p className="eyebrow">404 · Page not found</p>
        <h1>This page does not exist</h1>
        <p>The address may be outdated or the requested content may no longer be available.</p>
        <Link className="button-yellow" href="/">Return home</Link>
      </section>
    </main>
  </SiteShell>;
}
