import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'JUBO88 - Betting Platform', description: 'JUBO88 online gaming, casino, sportsbook, and affiliate platform' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
