import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function UserDashboardPage() {
  const authenticated = Boolean((await cookies()).get('jubo88_token')?.value);
  if (!authenticated) redirect('/');

  return <iframe className="exact-page" src="/user-dashboard.html" title="JUBO88 user dashboard" />;
}
