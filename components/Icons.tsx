import type { SVGProps } from 'react';

export type IconName = 'home'|'games'|'search'|'user'|'wallet'|'history'|'provider'|'category'|'play'|'menu'|'close'|'arrow'|'filter'|'affiliate';

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  games: <><path d="M7 8h10a5 5 0 0 1 4.7 6.7l-1.2 3.4a2.7 2.7 0 0 1-4.5 1l-1.6-1.6H9.6L8 19.1a2.7 2.7 0 0 1-4.5-1l-1.2-3.4A5 5 0 0 1 7 8Z"/><path d="M7 12v4m-2-2h4m7-1h.01m3 2h.01"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  wallet: <><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H20v16H5.5A2.5 2.5 0 0 1 3 17.5Z"/><path d="M3 7h17m-5 5h7v5h-7a2.5 2.5 0 0 1 0-5Z"/></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5m4-1v6l4 2"/></>,
  provider: <><path d="M4 20V8l8-4 8 4v12M2 20h20"/><path d="M8 10h2m4 0h2m-8 4h2m4 0h2"/></>,
  category: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  play: <path d="m8 5 11 7-11 7Z"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  filter: <path d="M4 6h16M7 12h10m-7 6h4"/>,
  affiliate: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="7" r="2"/><path d="M2 20a6 6 0 0 1 12 0m0-6a5 5 0 0 1 8 4"/></>,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
