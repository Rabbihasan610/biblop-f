import Link from 'next/link';
import type { PublicPage } from '@/lib/public-content';
import { SiteShell } from './SiteShell';

export function PublicContentShell({ page }: { page: PublicPage }) {
  return <SiteShell><main className="page-main catalogue-page page-enter">
    <section className="catalogue-intro">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
    </section>
    <section className="home-content-section">
      <div className="home-section-heading"><h2><span/>Information</h2></div>
      <div className="home-content-grid">{page.sections.map(section => <article className="home-content-card" key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></article>)}</div>
    </section>
    <div className="content-actions"><Link className="content-primary" href="/games">Browse games</Link><Link href="/contact">Contact support</Link></div>
  </main></SiteShell>;
}
