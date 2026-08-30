'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { fallbackAffiliate, fallbackAffiliateRecords } from '@/lib/fallback-data';
import { Icon } from './Icons';

type Json = Record<string, unknown>;
export type AffiliateSection = 'login'|'register'|'dashboard'|'earnings'|'withdraw'|'history'|'deposit'|'transfer';
const money = (value: unknown) => `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function call(resource: string, options: RequestInit = {}) {
  const response = await fetch(`/api/affiliate/${resource}`, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, ...options });
  const payload = await response.json() as Json;
  if (!response.ok || payload.status !== 'success') throw new Error(String(payload.message || 'Affiliate API unavailable.'));
  return (payload.data || {}) as Json;
}

export function AffiliateArea({ section }: { section: AffiliateSection }) {
  const [dashboard, setDashboard] = useState<Json>(fallbackAffiliate), [records, setRecords] = useState<Json[]>(fallbackAffiliateRecords), [source, setSource] = useState<'api'|'fallback'>('fallback');
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [page, setPage] = useState(1);
  const load = useCallback(async () => {
    if (section === 'login' || section === 'register' || section === 'withdraw' || section === 'deposit' || section === 'transfer') return;
    setBusy(true);
    try {
      if (section === 'dashboard') setDashboard(await call('dashboard'));
      else { const result = await call(section === 'history' ? 'earnings' : section); const value = (result[section] || result.earnings || result) as Json | Json[]; setRecords(Array.isArray(value) ? value : (value.data as Json[]) || []); }
      setSource('api');
    } catch { setDashboard(fallbackAffiliate); setRecords(fallbackAffiliateRecords); setSource('fallback'); }
    finally { setBusy(false); }
  }, [section]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function auth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, values = Object.fromEntries(new FormData(form));
    if (section === 'register' && values.password !== values.password_confirmation) return setMessage('Passwords do not match.');
    setBusy(true); setMessage('');
    try { await call(section, { method: 'POST', body: JSON.stringify(values) }); if (section === 'login') window.location.href = '/affi/dashboard'; else { form.reset(); setMessage('Application submitted. An administrator must approve the affiliate account before login.'); } }
    catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function mutation(event: FormEvent<HTMLFormElement>, resource: string) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setMessage('');
    try { await call(resource, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) }); form.reset(); setMessage(resource === 'transfer' ? 'Balance transfer completed.' : resource === 'deposit' ? 'Affiliate deposit request created.' : 'Affiliate withdrawal request submitted.'); setSource('api'); }
    catch { setMessage('API is unavailable. Form validation passed, but no real balance change was made while fallback mode is active.'); setSource('fallback'); }
    finally { setBusy(false); }
  }
  async function logout() { try { await call('logout', { method: 'POST', body: '{}' }); } finally { window.location.href = '/affi/login'; } }

  if (section === 'login' || section === 'register') return <main className="affiliate-auth-page page-enter"><section><Link className="dynamic-logo" href="/">Affiliate Centre</Link><p className="eyebrow">Affiliate centre</p><h1>{section === 'login' ? 'Affiliate login' : 'Become an affiliate'}</h1><p>{section === 'login' ? 'Access referrals, earnings, deposits, withdrawals and transfers.' : 'Submit your details for administrator approval.'}</p><form onSubmit={auth}>{section === 'register' && <><input name="name" placeholder="Full name" required/><input name="email" type="email" placeholder="Email" required/><input name="phone" placeholder="Phone" required/></>}<input name="username" placeholder="Username or email" required/><input name="password" type="password" minLength={6} placeholder="Password" required/>{section === 'register' && <input name="password_confirmation" type="password" minLength={6} placeholder="Confirm password" required/>}{message && <p className="account-message" aria-live="polite">{message}</p>}<button className="button-yellow" disabled={busy}>{busy ? 'Please wait…' : section === 'login' ? 'Login' : 'Submit application'}</button></form><Link className="auth-switch" href={section === 'login' ? '/affi/register' : '/affi/login'}>{section === 'login' ? 'Create affiliate account' : 'Already approved? Login'}</Link></section></main>;

  const widget = (dashboard.widget || fallbackAffiliate.widget) as Json, affiliate = (dashboard.affiliate || fallbackAffiliate.affiliate) as Json;
  const filtered = records.filter(item => !search || `${item.username} ${item.trx} ${item.email}`.toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8)), visible = filtered.slice((page - 1) * 8, page * 8);
  return <main className="affiliate-layout page-enter"><aside className="account-sidebar affiliate-sidebar"><div><p className="eyebrow">Affiliate panel</p><h2>{String(affiliate.name || affiliate.username || 'Partner')}</h2><span>{money(widget.commission_balance)}</span></div><nav><Link className={section === 'dashboard' ? 'active' : ''} href="/affi/dashboard"><Icon name="home"/>Dashboard</Link><Link className={section === 'earnings' ? 'active' : ''} href="/affi/earnings"><Icon name="wallet"/>Earnings</Link><Link className={section === 'history' ? 'active' : ''} href="/affi/history"><Icon name="history"/>History</Link><Link className={section === 'deposit' ? 'active' : ''} href="/affi/deposit"><Icon name="wallet"/>Deposit</Link><Link className={section === 'withdraw' ? 'active' : ''} href="/affi/withdraw"><Icon name="arrow"/>Withdraw</Link><Link className={section === 'transfer' ? 'active' : ''} href="/affi/transfer"><Icon name="affiliate"/>Transfer</Link></nav><button className="logout-button" onClick={() => void logout()}>Sign out</button></aside>
    <section className="account-content"><header className="account-heading"><div><p className="eyebrow">Partner workspace</p><h1>{section[0].toUpperCase() + section.slice(1)}</h1></div><span className={`source-badge ${source}`}>{busy ? 'Loading…' : source === 'api' ? 'Live API data' : 'Fallback data'}</span></header>{message && <p className="account-message" aria-live="polite">{message}</p>}
      {section === 'dashboard' && <><div className="stat-grid">{[['Referred users',widget.referred_users],['Deposited users',widget.deposited_users],['Referred deposits',money(widget.referred_deposit_total)],['Commission balance',money(widget.commission_balance)],['Total earned',money(widget.total_earned)],['Pending withdrawal',money(widget.pending_withdraw)]].map(([label,value]) => <article key={String(label)}><span>{String(label)}</span><strong>{String(value)}</strong></article>)}</div><label className="referral-box">Referral link<input readOnly value={String(dashboard.referral_link || fallbackAffiliate.referral_link)}/></label><div className="quick-actions"><Link href="/affi/deposit">Deposit balance</Link><Link href="/affi/withdraw">Request withdrawal</Link><Link href="/affi/transfer">Transfer balance</Link></div></>}
      {(section === 'earnings' || section === 'history') && <section className="account-card"><div className="record-tools"><label className="search-field"><Icon name="search"/><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search user, email or reference"/></label></div><AffiliateRows rows={visible}/><div className="pagination"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(value => value + 1)}>Next</button></div></section>}
      {section === 'deposit' && <AffiliateForm title="Deposit affiliate balance" copy="Fund the affiliate wallet using a supported operator channel." button="Create deposit request" onSubmit={event => void mutation(event, 'deposit')} busy={busy}><label>Payment method<select name="payment_method" required><option value="">Select method</option><option>bKash</option><option>Nagad</option><option>Bank Transfer</option></select></label><label>Amount<input name="amount" type="number" min="100" step="0.01" required/></label><label>Payment reference<input name="reference" required/></label></AffiliateForm>}
      {section === 'withdraw' && <AffiliateForm title="Withdraw commission" copy="Submit a destination and amount for administrator review." button="Submit request" onSubmit={event => void mutation(event, 'withdraw')} busy={busy}><label>Amount<input name="amount" type="number" min="100" step="0.01" required/></label><label>Payment method<input name="payment_method" required/></label><label>Destination details<textarea name="withdraw_information" rows={4} required/></label></AffiliateForm>}
      {section === 'transfer' && <AffiliateForm title="Transfer balance" copy="Transfer to any eligible user or another affiliate account." button="Transfer balance" onSubmit={event => void mutation(event, 'transfer')} busy={busy}><label>Recipient type<select name="recipient_type" required><option value="user">User</option><option value="affiliate">Affiliate</option></select></label><label>Recipient username<input name="username" required/></label><label>Amount<input name="amount" type="number" min="100" step="0.01" required/></label><label>Transfer note<input name="note" maxLength={160}/></label></AffiliateForm>}
    </section></main>;
}

function AffiliateForm({ title, copy, button, onSubmit, busy, children }: { title: string; copy: string; button: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean; children: React.ReactNode }) { return <form className="payment-layout account-card" onSubmit={onSubmit}><div className="payment-copy"><Icon name="affiliate"/><p className="eyebrow">Affiliate wallet</p><h2>{title}</h2><p>{copy}</p></div><div className="account-form">{children}<button className="button-yellow" disabled={busy}>{busy ? 'Please wait…' : button}</button></div></form>; }
function AffiliateRows({ rows }: { rows: Json[] }) { return <div className="record-list">{rows.map((item,index) => <article key={String(item.id || index)}><span className="record-icon"><Icon name="affiliate"/></span><div><strong>{String(item.username || `Record ${index + 1}`)}</strong><small>{String(item.email || item.created_at || '')}</small></div><span className="amount">{money(item.amount)}</span><b>{String(item.status || 'Completed')}</b></article>)}</div>; }
