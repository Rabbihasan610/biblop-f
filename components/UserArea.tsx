'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { fallbackTransactions, fallbackUser } from '@/lib/fallback-data';
import { Icon, type IconName } from './Icons';

type Json = Record<string, unknown>;
type Section = 'dashboard'|'deposit'|'withdraw'|'transactions'|'profile';
const nav: [Section, string, IconName][] = [['dashboard','Dashboard','home'],['deposit','Deposit','wallet'],['withdraw','Withdraw','arrow'],['transactions','History','history'],['profile','Profile','user']];
const money = (value: unknown) => `৳${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function request(resource: string, options: RequestInit = {}) {
  const response = await fetch(`/api/user/${resource}`, { headers: { Accept: 'application/json', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) }, ...options });
  const payload = await response.json() as Json;
  if (response.status === 401) {
    window.location.replace('/?auth=login');
    throw new Error('Your session has ended. Please sign in again.');
  }
  if (!response.ok || payload.status !== 'success') throw new Error(String(payload.message || 'Account API unavailable.'));
  return (payload.data || {}) as Json;
}

export function UserArea({ section }: { section: Section }) {
  const [data, setData] = useState<Json>(fallbackUser), [records, setRecords] = useState<Json[]>(fallbackTransactions), [source, setSource] = useState<'api'|'fallback'>('fallback');
  const [methods, setMethods] = useState<Json[]>([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [page, setPage] = useState(1);
  const load = useCallback(async () => {
    setBusy(true); setMessage('');
    try {
      if (section === 'dashboard') setData(await request('dashboard'));
      if (section === 'profile') setData(await request('profile'));
      if (section === 'transactions') { const result = await request('transactions'); const value = (result.transactions || result) as Json | Json[]; setRecords(Array.isArray(value) ? value : (value.data as Json[]) || []); }
      if (section === 'deposit') { const result = await request('deposit-methods'); setMethods((result.methods || []) as Json[]); }
      if (section === 'withdraw') { const result = await request('withdraw-methods'); setMethods((result.withdrawMethod || result.methods || []) as Json[]); }
      setSource('api');
    } catch { setSource('fallback'); if (section === 'dashboard' || section === 'profile') setData(fallbackUser); if (section === 'transactions') setRecords(fallbackTransactions); }
    finally { setBusy(false); }
  }, [section]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const user = (data.user || fallbackUser.user) as Json, widget = (data.widget || fallbackUser.widget) as Json;
  const filtered = useMemo(() => records.filter(item => (!search || `${item.trx} ${item.details}`.toLowerCase().includes(search.toLowerCase())) && (!status || String(item.status).toLowerCase() === status)), [records, search, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8)), visible = filtered.slice((page - 1) * 8, page * 8);
  async function submit(event: FormEvent<HTMLFormElement>, resource: string) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setMessage('');
    try {
      const values = Object.fromEntries(new FormData(form));
      const result = await request(resource, { method: 'POST', body: JSON.stringify(values) });
      if (resource === 'withdraw' && result.trx) {
        const confirmation = new FormData(); confirmation.append('trx', String(result.trx)); confirmation.append('withdraw_information', String(values.withdraw_information || ''));
        await request('withdraw-confirm', { method: 'POST', body: confirmation });
      }
      form.reset(); setMessage(resource === 'deposit' ? 'Deposit request created successfully.' : resource === 'withdraw' ? 'Withdrawal request submitted successfully.' : 'Profile updated successfully.'); setSource('api');
    }
    catch { setMessage('API is currently unavailable. The fallback preview remains active; no real transaction was created.'); setSource('fallback'); }
    finally { setBusy(false); }
  }
  return <main className="account-layout page-enter">
    <aside className="account-sidebar"><div><p className="eyebrow">User account</p><h2>{String(user.firstname || user.username || 'Player')}</h2><span>{money(widget.total_balance || user.balance)}</span></div><nav>{nav.map(([key,label,icon]) => <Link className={section === key ? 'active' : ''} key={key} href={`/user/${key}`}><Icon name={icon}/>{label}</Link>)}</nav><Link href="/games" className="sidebar-games"><Icon name="games"/>Browse games</Link></aside>
    <section className="account-content"><header className="account-heading"><div><p className="eyebrow">{section === 'transactions' ? 'Account activity' : 'Wallet & account'}</p><h1>{nav.find(([key]) => key === section)?.[1]}</h1></div><span className={`source-badge ${source}`}>{busy ? 'Loading…' : source === 'api' ? 'Live API data' : 'Fallback data'}</span></header>
      {message && <p className="account-message" aria-live="polite">{message}</p>}
      {section === 'dashboard' && <><div className="stat-grid">{[['Available balance',money(widget.total_balance || user.balance)],['Total deposited',money(widget.total_invest)],['Pending requests',money(widget.pending_requests)],['Net result',money(widget.net_profit_loss)],['Games played',widget.total_played || 0],['Games won',widget.total_won_count || 0]].map(([label,value]) => <article key={String(label)}><span>{String(label)}</span><strong>{String(value)}</strong></article>)}</div><section className="account-card"><div className="card-title"><h2>Recent transactions</h2><Link href="/user/transactions">View all <Icon name="arrow"/></Link></div><TransactionRows rows={fallbackTransactions.slice(0, 5)}/></section></>}
      {section === 'deposit' && <PaymentForm kind="deposit" methods={methods} busy={busy} onSubmit={event => void submit(event, 'deposit')}/>} 
      {section === 'withdraw' && <PaymentForm kind="withdraw" methods={methods} busy={busy} onSubmit={event => void submit(event, 'withdraw')}/>} 
      {section === 'transactions' && <section className="account-card"><div className="record-tools"><label className="search-field"><Icon name="search"/><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search transaction or reference"/></label><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option></select></div><TransactionRows rows={visible}/><div className="pagination"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(value => value + 1)}>Next</button></div></section>}
      {section === 'profile' && <form className="account-form account-card" onSubmit={event => void submit(event, 'profile-save')}><div className="form-grid"><label>First name<input name="firstname" defaultValue={String(user.firstname || '')} required/></label><label>Last name<input name="lastname" defaultValue={String(user.lastname || '')} required/></label><label>Email<input name="email" type="email" defaultValue={String(user.email || '')} required/></label><label>Phone<input name="mobile" defaultValue={String(user.mobile || user.phone || '')}/></label><label>Address<input name="address" defaultValue={String(user.address || '')}/></label><label>City<input name="city" defaultValue={String(user.city || '')}/></label><label>Post code<input name="zip" defaultValue={String(user.zip || '')}/></label></div><button className="button-yellow" disabled={busy}>Save profile</button></form>}
    </section>
  </main>;
}

function PaymentForm({ kind, methods, busy, onSubmit }: { kind: 'deposit'|'withdraw'; methods: Json[]; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const fallbackMethods: Json[] = kind === 'deposit' ? [{ name: 'bKash', method_code: 'BKASH', currency: 'BDT' }, { name: 'Nagad', method_code: 'NAGAD', currency: 'BDT' }, { name: 'Bank Transfer', method_code: 'BANK', currency: 'BDT' }] : [{ id: 1, name: 'bKash', min_limit: 500, max_limit: 50000 }, { id: 2, name: 'Nagad', min_limit: 500, max_limit: 50000 }, { id: 3, name: 'Bank Transfer', min_limit: 1000, max_limit: 200000 }];
  const options = methods.length ? methods : fallbackMethods;
  return <form className="payment-layout account-card" onSubmit={onSubmit}><div className="payment-copy"><Icon name="wallet"/><p className="eyebrow">Secure wallet</p><h2>{kind === 'deposit' ? 'Add balance' : 'Request a withdrawal'}</h2><p>{kind === 'deposit' ? 'Choose an enabled payment channel. The API supplies live limits and instructions.' : 'Withdrawals are reviewed against account and destination information.'}</p></div><div className="account-form"><label>Payment method<select name="method_code" required><option value="">Select a method</option>{options.map((method, index) => <option key={String(method.id || method.method_code || index)} value={String(method.method_code || method.id || '')}>{String(method.name)}{method.currency ? ` (${String(method.currency)})` : ''}</option>)}</select></label>{kind === 'deposit' && <input type="hidden" name="currency" value="BDT"/>}<label>Amount<input name="amount" type="number" inputMode="decimal" min="100" step="0.01" placeholder="0.00" required/></label>{kind === 'withdraw' && <label>Destination/account information<textarea name="withdraw_information" rows={4} placeholder="Wallet number or bank details" required/></label>}<button className="button-yellow" disabled={busy}>{busy ? 'Please wait…' : kind === 'deposit' ? 'Create deposit' : 'Submit withdrawal'}</button></div></form>;
}

function TransactionRows({ rows }: { rows: Json[] }) { return <div className="record-list">{rows.length ? rows.map((item, index) => <article key={String(item.id || index)}><span className="record-icon"><Icon name="history"/></span><div><strong>{String(item.details || 'Transaction')}</strong><small>#{String(item.trx || item.id)} · {String(item.created_at || '')}</small></div><span className={item.trx_type === '-' ? 'amount negative' : 'amount'}>{money(item.amount)}</span><b>{String(item.status || 'Completed')}</b></article>) : <p className="empty-row">No records found.</p>}</div>; }
