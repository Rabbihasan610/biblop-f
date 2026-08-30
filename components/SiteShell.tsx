'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from './Icons';

type Modal = 'login' | 'register' | 'forgot' | null;
type Json = Record<string, unknown>;

const primaryNavigation = [
  ['Home', '/'],
  ['Games', '/games'],
  ['Categories', '/categories'],
  ['Providers', '/providers'],
  ['Dashboard', '/user/dashboard'],
  ['Affiliate', '/affi/login'],
] as const;

function messageOf(payload: Json) {
  const errors = payload.errors as Record<string, string[]> | undefined;
  return errors
    ? Object.values(errors).flat()[0]
    : String(payload.message || 'Request could not be completed.');
}

function navIsActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/games') return pathname === '/games' || pathname.startsWith('/game/');
  if (href === '/categories') return pathname === '/categories' || pathname.startsWith('/category/');
  if (href === '/providers') return pathname === '/providers' || pathname.startsWith('/provider/');
  if (href === '/user/dashboard') return pathname.startsWith('/user/');
  if (href === '/affi/login') return pathname.startsWith('/affi/');
  return pathname === href;
}

function Brand({ siteName, logoUrl }: { siteName: string; logoUrl: string }) {
  return <Link className="logo-text" href="/" aria-label={`${siteName} homepage`}>
    {logoUrl
      ? <img className="site-logo-image" src={logoUrl} alt={siteName}/>
      : siteName}
  </Link>;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [siteName, setSiteName] = useState('Jaba9');
  const [logoUrl, setLogoUrl] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/public/settings', { headers: { Accept: 'application/json' } })
      .then(response => response.json())
      .then(payload => {
        setSiteName(String(payload?.data?.general_setting?.site_name || 'Jaba9'));
        setLogoUrl(String(payload?.data?.branding?.logo || ''));
      })
      .catch(() => {
        setSiteName('Jaba9');
        setLogoUrl('');
      });
  }, []);

  function open(value: Modal) {
    setMessage('');
    setModal(value);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (modal === 'register' && values.password !== values.password_confirmation) {
      setMessage('Password and confirmation must match.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const route = modal === 'forgot' ? '/api/auth/password/email' : `/api/auth/${modal}`;
      const response = await fetch(route, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = await response.json() as Json;
      if (!response.ok || payload.status !== 'success') throw new Error(messageOf(payload));
      if (modal === 'forgot') {
        form.reset();
        setMessage('Recovery request sent to the administrator. You will receive the next instruction on your registered contact.');
      } else {
        window.location.href = '/user/dashboard';
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="app-shell">
    <header className="header-glass shared-site-header">
      <div className="header-top">
        <div className="header-top-inner">
          <div className="header-brand"><Brand siteName={siteName} logoUrl={logoUrl}/></div>
          <div className="header-actions">
            <button type="button" className="header-auth-button" onClick={() => open('login')}>Login</button>
            <button type="button" className="header-auth-button primary" onClick={() => open('register')}>Sign Up</button>
          </div>
        </div>
      </div>
      <nav className="header-nav" aria-label="Primary navigation">
        <div className="header-nav-inner">
          {primaryNavigation.map(([label, href]) => {
            const active = navIsActive(pathname, href);
            return <Link key={href} href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>{label}</Link>;
          })}
        </div>
      </nav>
    </header>

    {children}

    <footer className="footer-glow shared-site-footer">
      <div className="footer-link-grid">
        <div>
          <h2 className="footer-heading"><i className="fas fa-link" aria-hidden="true"/> Quick Links</h2>
          <Link href="/" className="footer-link"><i className="fas fa-home" aria-hidden="true"/> Home</Link>
          <Link href="/games" className="footer-link"><i className="fas fa-gamepad" aria-hidden="true"/> Games</Link>
          <Link href="/sportsbook" className="footer-link"><i className="fas fa-trophy" aria-hidden="true"/> Sports</Link>
          <Link href="/promotion" className="footer-link"><i className="fas fa-gift" aria-hidden="true"/> Promotions</Link>
        </div>
        <div>
          <h2 className="footer-heading"><i className="fas fa-gavel" aria-hidden="true"/> Legal</h2>
          <Link href="/terms" className="footer-link"><i className="fas fa-file-contract" aria-hidden="true"/> Terms &amp; Conditions</Link>
          <Link href="/privacy" className="footer-link"><i className="fas fa-shield-alt" aria-hidden="true"/> Privacy Policy</Link>
          <Link href="/responsible-gaming" className="footer-link"><i className="fas fa-user-shield" aria-hidden="true"/> Responsible Gaming</Link>
          <Link href="/cookies" className="footer-link"><i className="fas fa-cookie-bite" aria-hidden="true"/> Cookie Policy</Link>
        </div>
      </div>
      <div className="footer-divider"/>
      <div className="footer-bottom">
        <span>© 2026 {siteName} · All rights reserved</span>
        <div className="footer-trust">
          <span><i className="fas fa-lock" aria-hidden="true"/> Secure</span>
          <span><i className="fas fa-check-circle" aria-hidden="true"/> Fair</span>
          <span><i className="fas fa-smile" aria-hidden="true"/> Fun</span>
          <span><i className="fas fa-headset" aria-hidden="true"/> 24/7</span>
        </div>
      </div>
    </footer>

    {modal && <div className="auth-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" onClick={() => setModal(null)} aria-label="Close dialog"><Icon name="close"/></button>
        <p className="eyebrow">Secure account</p>
        <h2 id="auth-title">{modal === 'login' ? 'Welcome back' : modal === 'register' ? 'Create your account' : 'Admin recovery request'}</h2>
        <form onSubmit={submit}>
          {modal === 'register' && <><input name="firstname" placeholder="First name" required/><input name="lastname" placeholder="Last name" required/></>}
          <input name={modal === 'forgot' ? 'value' : 'username'} placeholder={modal === 'forgot' ? 'Registered email or username' : 'Username or email'} required/>
          {modal !== 'forgot' && <input name="password" type="password" minLength={6} placeholder="Password" required/>}
          {modal === 'register' && <input name="password_confirmation" type="password" minLength={6} placeholder="Confirm password" required/>}
          {message && <p className="form-message" aria-live="polite">{message}</p>}
          <button className="button-yellow" disabled={busy}>{busy ? 'Please wait…' : modal === 'forgot' ? 'Send admin request' : modal === 'login' ? 'Login' : 'Register'}</button>
        </form>
        {modal === 'login' && <button className="text-button" onClick={() => open('forgot')}>Forgot password?</button>}
        <button className="text-button" onClick={() => open(modal === 'register' ? 'login' : 'register')}>{modal === 'register' ? 'Already registered? Login' : 'Create a new account'}</button>
      </section>
    </div>}
  </div>;
}
