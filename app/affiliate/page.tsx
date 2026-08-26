import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AffiliatePanel } from '@/components/AffiliatePanel';

export const metadata: Metadata = { title: 'Affiliate Centre | JUBO88', description: 'Affiliate reporting, referrals, earnings and withdrawals.' };
export default async function AffiliatePage() { return <AffiliatePanel initiallyAuthenticated={Boolean((await cookies()).get('jubo88_affiliate_token')?.value)} />; }
