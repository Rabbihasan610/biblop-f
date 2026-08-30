import type { Metadata } from 'next';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';

export const metadata: Metadata = { title: 'Jaba9 - Betting Platform', description: 'Jaba9 online gaming, casino, sportsbook, and affiliate platform' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Password managers, translators, and accessibility extensions can add
  // attributes to these two elements before React hydrates the page. The app
  // tree remains strictly checked; only the browser-owned root boundaries are
  // allowed to differ from the server snapshot.
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>;
}
