import Link from 'next/link';
import type { PublicPage } from '@/lib/public-content';
import { publicNav } from '@/lib/public-content';

export function PublicContentShell({ page }: { page: PublicPage }) {
  return <div className="content-site">
    <header className="content-header">
      <Link className="content-logo" href="/">JUBO88</Link>
      <nav aria-label="Primary navigation">{publicNav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    </header>
    <main className="content-main">
      <p className="content-eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p className="content-lead">{page.description}</p>
      <div className="content-grid">{page.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}</div>
      <div className="content-actions"><Link className="content-primary" href="/#gameGrid">Browse games</Link><Link href="/contact">Contact support</Link></div>
    </main>
    <footer className="content-footer">
      <nav aria-label="Legal navigation"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/responsible-gaming">Responsible gaming</Link><Link href="/cookies">Cookies</Link><Link href="/about">About</Link></nav>
      <p>18+ only. Play responsibly and follow the laws that apply where you live.</p>
    </footer>
  </div>;
}
