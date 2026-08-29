export type Game = {
  id: number;
  name: string;
  slug: string;
  provider: string;
  provider_slug: string;
  category: string;
  category_slug: string;
  image_url?: string;
  launch_url?: string;
  is_live?: boolean;
};

export type CatalogueOption = { id: number; name: string; slug: string };

export const fallbackCategories: CatalogueOption[] = [
  { id: 1, name: 'Slots', slug: 'slots' },
  { id: 2, name: 'Live Casino', slug: 'live-casino' },
  { id: 3, name: 'Sports', slug: 'sports' },
  { id: 4, name: 'Fishing', slug: 'fishing' },
  { id: 5, name: 'Crash', slug: 'crash' },
  { id: 6, name: 'Table Games', slug: 'table-games' },
];

export const fallbackProviders: CatalogueOption[] = [
  { id: 1, name: 'Jaya Play', slug: 'jaya-play' },
  { id: 2, name: 'Royal Studio', slug: 'royal-studio' },
  { id: 3, name: 'Velocity', slug: 'velocity' },
  { id: 4, name: 'Ocean Arcade', slug: 'ocean-arcade' },
  { id: 5, name: 'Arena Sports', slug: 'arena-sports' },
];

const names = [
  ['Golden Temple', 'slots', 'jaya-play'], ['Royal Roulette', 'live-casino', 'royal-studio'],
  ['Turbo Cricket', 'sports', 'arena-sports'], ['Ocean Hunter', 'fishing', 'ocean-arcade'],
  ['Rocket Rise', 'crash', 'velocity'], ['Blackjack Pro', 'table-games', 'royal-studio'],
  ['Lucky Lanterns', 'slots', 'jaya-play'], ['Live Baccarat', 'live-casino', 'royal-studio'],
  ['Penalty Arena', 'sports', 'arena-sports'], ['Deep Sea Gold', 'fishing', 'ocean-arcade'],
  ['Skyline Crash', 'crash', 'velocity'], ['Dragon Poker', 'table-games', 'jaya-play'],
  ['Red Diamond', 'slots', 'velocity'], ['VIP Sic Bo', 'live-casino', 'royal-studio'],
  ['Premier League', 'sports', 'arena-sports'], ['Reef Shooter', 'fishing', 'ocean-arcade'],
  ['Instant Flight', 'crash', 'velocity'], ['Classic Teen Patti', 'table-games', 'jaya-play'],
] as const;

export const fallbackGames: Game[] = names.map(([name, categorySlug, providerSlug], index) => ({
  id: index + 1,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  provider_slug: providerSlug,
  provider: fallbackProviders.find(item => item.slug === providerSlug)?.name ?? providerSlug,
  category_slug: categorySlug,
  category: fallbackCategories.find(item => item.slug === categorySlug)?.name ?? categorySlug,
  is_live: categorySlug === 'live-casino' || categorySlug === 'sports',
}));

export const fallbackUser = {
  user: { firstname: 'Jaba9', lastname: 'Player', username: 'demo_player', email: 'player@example.com', phone: '01700000000', address: 'Dhaka', city: 'Dhaka', zip: '1207', balance: 12500 },
  widget: { total_balance: 12500, total_invest: 48750, pending_requests: 1200, total_win: 18200, total_played: 128, total_won_count: 51, total_lost_count: 77, net_profit_loss: 2350 },
};

export const fallbackTransactions = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  trx: `J9${String(80420 + index)}`,
  details: index % 3 === 0 ? 'Wallet deposit' : index % 3 === 1 ? 'Game settlement' : 'Withdrawal request',
  amount: [1500, 420, 800][index % 3],
  trx_type: index % 3 === 1 ? '+' : index % 3 === 2 ? '-' : '+',
  status: index % 4 === 0 ? 'Pending' : 'Completed',
  created_at: `2026-08-${String(28 - (index % 20)).padStart(2, '0')}`,
}));

export const fallbackAffiliate = {
  affiliate: { name: 'Demo Partner', username: 'jaba9_partner' },
  widget: { referred_users: 48, deposited_users: 31, referred_deposit_total: 184500, commission_balance: 14750, total_earned: 42800, pending_withdraw: 3500 },
  referral_link: 'https://example.com/register?ref=jaba9_partner',
};

export const fallbackAffiliateRecords = fallbackTransactions.map((item, index) => ({
  ...item,
  username: `referred_user_${index + 1}`,
  email: `user${index + 1}@example.com`,
  amount: 250 + index * 75,
}));
