import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const rootLayout = fs.readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const homepageIntegration = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const dashboardPage = fs.readFileSync(
    new URL('../app/dashboard/page.tsx', import.meta.url),
    'utf8',
);
const dashboardSource = fs.readFileSync(
    new URL('../public/user-dashboard.html', import.meta.url),
    'utf8',
);
const dashboardIntegration = fs.readFileSync(
    new URL('../public/user-dashboard-app.js', import.meta.url),
    'utf8',
);
const userProxy = fs.readFileSync(
    new URL('../app/api/user/[resource]/route.ts', import.meta.url),
    'utf8',
);
const publicContent = fs.readFileSync(new URL('../lib/public-content.ts', import.meta.url), 'utf8');
const publicRoute = fs.readFileSync(new URL('../app/[...slug]/page.tsx', import.meta.url), 'utf8');
const publicShell = fs.readFileSync(
    new URL('../components/PublicContentShell.tsx', import.meta.url),
    'utf8',
);
const affiliatePage = fs.readFileSync(
    new URL('../app/affiliate/page.tsx', import.meta.url),
    'utf8',
);
const affiliatePanel = fs.readFileSync(
    new URL('../components/AffiliatePanel.tsx', import.meta.url),
    'utf8',
);
const affiliateProxy = fs.readFileSync(
    new URL('../app/api/affiliate/[resource]/route.ts', import.meta.url),
    'utf8',
);
const userArea = fs.readFileSync(new URL('../components/UserArea.tsx', import.meta.url), 'utf8');
const userRoute = fs.readFileSync(new URL('../app/user/[section]/page.tsx', import.meta.url), 'utf8');
const affiliateArea = fs.readFileSync(new URL('../components/AffiliateArea.tsx', import.meta.url), 'utf8');
const affiliateRoute = fs.readFileSync(new URL('../app/affi/[section]/page.tsx', import.meta.url), 'utf8');
const catalogue = fs.readFileSync(new URL('../components/CatalogueExplorer.tsx', import.meta.url), 'utf8');
const gamePlayer = fs.readFileSync(new URL('../components/GamePlayer.tsx', import.meta.url), 'utf8');
const siteShell = fs.readFileSync(new URL('../components/SiteShell.tsx', import.meta.url), 'utf8');
const fallbackData = fs.readFileSync(new URL('../lib/fallback-data.ts', import.meta.url), 'utf8');
const globalStyles = fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const upstreamFetch = fs.readFileSync(new URL('../lib/upstream-fetch.ts', import.meta.url), 'utf8');
const publicProxy = fs.readFileSync(
    new URL('../app/api/public/[resource]/route.ts', import.meta.url),
    'utf8',
);
const sharedShellRoutes = [
    '../app/games/page.tsx',
    '../app/categories/page.tsx',
    '../app/providers/page.tsx',
    '../app/category/[slug]/page.tsx',
    '../app/provider/[slug]/page.tsx',
    '../app/game/[slug]/page.tsx',
    '../app/user/[section]/page.tsx',
    '../app/affi/[section]/page.tsx',
    '../app/[...slug]/page.tsx',
    '../app/not-found.tsx',
].map(file => fs.readFileSync(new URL(file, import.meta.url), 'utf8'));
const nextConfig = fs.readFileSync(new URL('../next.config.mjs', import.meta.url), 'utf8');
const packageJson = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('home renders the supplied standalone document shell', () => {
    assert.match(page, /'\/index\.html'/);
    assert.match(page, /'\/index\.html\?auth=login'/);
    assert.match(homepageIntegration, /openModal\?\.\('loginModal'\)/);
});
test('root document tolerates attributes injected before React hydration', () => {
    assert.match(rootLayout, /<html lang="en" suppressHydrationWarning>/);
    assert.match(rootLayout, /<body suppressHydrationWarning>/);
});
test('homepage retains its structure and loads the API integration', () => {
    assert.match(source, /^<!doctype html>/i);
    assert.match(source, /id="promoSlider"/);
    assert.match(source, /id="loginModal"/);
    assert.match(source, /class="bottom-app-bar mobile-only"/);
    assert.match(source, /id="gameGrid"/);
    assert.match(source, /src="\/app\.js"/);
    assert.doesNotMatch(source, /Cricket Clash|Slot Empire|Mega Moolah/);
    assert.match(source, /<\/html>\s*$/);
});
test('homepage uses the requested flat visual system without rendered radius or shadow', () => {
    assert.match(source, /\/\* ── Flat visual system ── \*\//);
    assert.match(source, /border-radius: 0 !important/);
    assert.match(source, /box-shadow: none !important/);
    assert.match(source, /text-shadow: none !important/);
    assert.match(source, /#gameGrid[\s\S]*grid-template-columns: repeat\(2/);
});
test('homepage header and modal controls are fixed and accessible', () => {
    assert.match(source, /\.header-glass[\s\S]*position: fixed/);
    assert.match(source, /\.header-glass a,[\s\S]*\.header-glass button[\s\S]*border-color: transparent/);
    assert.match(source, /body > \.max-w-7xl[\s\S]*padding-top: 86px/);
    assert.equal((source.match(/class="modal-close"/g) || []).length, 4);
    assert.equal((source.match(/aria-label="Close [^"]+ dialog"/g) || []).length, 4);
    assert.match(source, /modal\.setAttribute\('aria-modal', 'true'\)/);
    assert.match(source, /modal\.querySelector\('\.modal-close'\)\?\.focus\(\)/);
    assert.match(source, /modalTrigger instanceof HTMLElement/);
});
test('homepage header follows the two-tier structure and brand palette contrast rules', () => {
    assert.match(source, /class="header-top"/);
    assert.match(source, /class="header-nav"/);
    assert.match(source, /Login[\s\S]*Sign Up/);
    assert.match(source, /Home[\s\S]*Games[\s\S]*Categories[\s\S]*Providers[\s\S]*Dashboard[\s\S]*Affiliate/);
    assert.match(source, /--brand-black: #050505/);
    assert.match(source, /--brand-yellow: #f5c400/);
    assert.match(source, /--brand-red: #e31b23/);
    assert.match(source, /--brand-white: #ffffff/);
    assert.match(source, /\.header-top[\s\S]*background: var\(--brand-black\)[\s\S]*color: var\(--brand-white\)/);
    assert.match(source, /\.header-nav[\s\S]*background: var\(--brand-yellow\)[\s\S]*color: var\(--brand-black\)/);
    assert.match(source, /overflow-x: auto/);
    assert.match(homepageIntegration, /querySelectorAll\('\.currency-label'\)/);
});
test('homepage keeps the same two-tier header on mobile', () => {
    assert.match(source, /@media \(max-width: 639px\)[\s\S]*\.header-glass[\s\S]*display: block !important/);
    assert.match(source, /\.legacy-header\.hidden[\s\S]*display: none !important/);
    assert.match(source, /background: var\(--brand-black\)/);
    assert.match(source, /inset: 0 0 auto 0/);
    assert.match(source, /padding-top: 124px/);
});
test('the unified homepage header is locked to the viewport top', () => {
    assert.match(
        source,
        /\.header-glass[\s\S]*position: fixed !important[\s\S]*inset: 0 0 auto 0 !important/,
    );
});
test('header links are centered with no underline or dropdown arrows', () => {
    assert.match(source, /\.header-nav-inner[\s\S]*justify-content: center/);
    assert.match(source, /\.header-nav a,[\s\S]*text-decoration: none !important[\s\S]*border-bottom: 0 !important/);
    const activeHeader = source.match(/<header class="header-glass">[\s\S]*?<\/header>/)?.[0] || '';
    assert.doesNotMatch(activeHeader, /fa-chevron|arrow-left|chevron-left/);
});
test('homepage header actions use accessible white, red, and yellow contrast', () => {
    assert.match(
        source,
        /\.header-auth-button[\s\S]*background: var\(--brand-white\)[\s\S]*color: var\(--brand-black\)/,
    );
    assert.match(
        source,
        /\.header-auth-button\.primary[\s\S]*background: var\(--brand-red\)[\s\S]*color: var\(--brand-white\)/,
    );
    assert.doesNotMatch(siteShell, /mobile-trigger|global-nav open/);
});

test('all React pages use the same arrow-free, underline-free shared header', () => {
    assert.match(siteShell, /header-glass shared-site-header[\s\S]*header-top[\s\S]*header-top-inner[\s\S]*header-brand[\s\S]*header-actions[\s\S]*header-nav[\s\S]*header-nav-inner/);
    assert.match(siteShell, /Home[\s\S]*Games[\s\S]*Categories[\s\S]*Providers[\s\S]*Dashboard[\s\S]*Affiliate/);
    assert.doesNotMatch(siteShell.match(/<header className="header-glass shared-site-header">[\s\S]*?<\/header>/)?.[0] || '', /name="arrow"|chevron|underline/);
});

test('all React pages use the same homepage footer structure and links', () => {
    assert.match(siteShell, /footer-glow shared-site-footer/);
    assert.match(siteShell, /Quick Links[\s\S]*Home[\s\S]*Games[\s\S]*Sports[\s\S]*Promotions/);
    assert.match(siteShell, /Legal[\s\S]*Terms &amp; Conditions[\s\S]*Privacy Policy[\s\S]*Responsible Gaming[\s\S]*Cookie Policy/);
    assert.match(siteShell, /Secure[\s\S]*Fair[\s\S]*Fun[\s\S]*24\/7/);
});

test('every non-home content route is wrapped by the shared site shell', () => {
    for (const route of sharedShellRoutes) assert.match(route, /SiteShell|PublicContentShell/);
});
test('sidebar and modal close icons have no visual boxes', () => {
    assert.match(source, /\.modal-close[\s\S]*border: 0[\s\S]*background: transparent/);
    assert.match(source, /\.sidebar-close[\s\S]*border: 0[\s\S]*background: transparent/);
    assert.match(source, /aria-label="Close navigation menu"/);
});
test('standalone shells use locally built assets and a same-origin CSP', () => {
    for (const shell of [source, dashboardSource]) {
        assert.match(shell, /href="\/vendor\/static-shell\.css"/);
        assert.match(shell, /href="\/vendor\/fontawesome\/css\/all\.min\.css"/);
        assert.doesNotMatch(
            shell,
            /cdn\.tailwindcss|fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare/,
        );
    }
    assert.match(packageJson.scripts.prebuild, /build:static-assets/);
    assert.ok(packageJson.dependencies['@fortawesome/fontawesome-free']);
    assert.ok(packageJson.devDependencies.tailwindcss);
    assert.doesNotMatch(
        nextConfig,
        /cdn\.tailwindcss|fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare/,
    );
    assert.match(nextConfig, /process\.env\.NODE_ENV === 'development'/);
    assert.match(nextConfig, /\? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"/);
    assert.match(nextConfig, /: "script-src 'self' 'unsafe-inline'"/);
});
test('public catalogue and auth recovery use same-origin BFF routes', () => {
    const integration = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
    assert.match(integration, /\/api\/public\/home/);
    assert.match(publicProxy, /games: '\/api\/v1\/public\/games'/);
    assert.match(integration, /\/api\/public\/categories/);
    assert.match(integration, /\/api\/public\/click/);
    assert.match(integration, /\/api\/public\/settings/);
    assert.match(integration, /data\.general_setting/);
    assert.match(integration, /branding\.logo/);
    assert.match(integration, /validHex/);
    assert.doesNotMatch(source, /id="providerMega"/);
    assert.match(source, /id="recentGameGrid"/);
    assert.match(integration, /home\.popular_games/);
    assert.match(integration, /home\.recent_clicked_games/);
    assert.match(integration, /\/game\/\$\{encodeURIComponent\(game\.slug \|\| game\.id\)\}/);
    assert.match(integration, /href="\/category\/\$\{encodeURIComponent\(item\.slug\)\}"/);
    assert.match(source, /href="\/games"[\s\S]*>View All/);
    assert.match(source, /href="\/categories"[\s\S]*>See All/);
    assert.match(source, /wallet: '\/user\/deposit'/);
    assert.match(integration, /\/api\/auth\/login/);
    assert.match(integration, /\/api\/auth\/register/);
    assert.match(integration, /\/api\/auth\/password\/email/);
    assert.match(integration, /\/api\/auth\/password\/verify/);
    assert.match(integration, /\/api\/auth\/password\/reset/);
    assert.match(integration + source, /password-toggle/);
    assert.match(integration + source, /floating-field/);
    assert.match(integration, /readableError/);
    assert.match(integration, /Password and confirm password must match/);
    assert.match(source, /id="loginModal"/);
    assert.match(integration, /setSubmitting/);
    assert.match(integration, /Unable to connect right now/);
    assert.match(integration, /service is temporarily unavailable/);
    assert.match(integration, /AbortController/);
    assert.match(upstreamFetch, /DEFAULT_TIMEOUT_MS = 10_000/);
    assert.match(upstreamFetch, /retryGet/);
    assert.match(upstreamFetch, /response\.status < 500/);
    assert.match(publicProxy, /function sameOriginAssets/);
    assert.match(publicProxy, /url\.pathname\.startsWith\('\/assets\/'\)/);
    assert.match(publicProxy, /url\.pathname\.startsWith\('\/uploads\/'\)/);
    assert.match(publicProxy, /sameOriginAssets\(await upstream\.json\(\)\)/);
});
test('user account has separate API-first dashboard, payment, history and profile pages', () => {
    assert.match(dashboardPage, /redirect\('\/user\/dashboard'\)/);
    for (const section of ['dashboard', 'deposit', 'withdraw', 'transactions', 'profile'])
        assert.match(userRoute + userArea, new RegExp(section));
    for (const resource of ['dashboard', 'transactions', 'deposit-methods', 'withdraw-methods', 'deposit', 'withdraw', 'profile', 'profile-save'])
        assert.ok(
            userProxy.includes(`${resource}:`) || userProxy.includes(`'${resource}':`),
            `missing user BFF resource ${resource}`,
        );
    assert.match(userProxy, /jaba9_token/);
    assert.match(userProxy, /Authorization: `Bearer \$\{token\}`/);
    assert.match(userArea, /fallbackTransactions/);
    assert.match(userArea, /source-badge/);
    assert.match(userArea, /Search transaction or reference/);
    assert.match(userArea, /className="pagination"/);
});

test('login and registration modals submit phone-ready backend fields', () => {
    assert.match(source, /name="username"[\s\S]*placeholder="Phone number \(01XXXXXXXXX\)"/);
    for (const field of ['firstname', 'lastname', 'mobile', 'email', 'mobile_code', 'country_code', 'password', 'password_confirmation']) {
        assert.match(source, new RegExp(`name="${field}"`));
    }
    assert.doesNotMatch(source, /onsubmit="[\s\S]{0,120}closeModal\('loginModal'\)/);
    assert.match(siteShell, /name="mobile"/);
    assert.match(siteShell, /name="mobile_code"/);
    assert.match(catalogue, /games\?per_page=48/);
    assert.match(catalogue, /last_page/);
    assert.match(catalogue, /remainingPages/);
    assert.doesNotMatch(catalogue, /games\?per_page=100/);
});

test('user dashboard routes require a valid server-side session', () => {
    const proxy = fs.readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');
    const userLayout = fs.readFileSync(new URL('../app/user/layout.tsx', import.meta.url), 'utf8');
    assert.match(proxy, /jaba9_token/);
    assert.match(proxy, /matcher: \['\/dashboard\/:path\*', '\/user\/:path\*'\]/);
    assert.match(proxy, /NextResponse\.redirect/);
    assert.match(userLayout, /api\/user\/dashboard/);
    assert.match(userLayout, /Authorization: `Bearer \$\{token\}`/);
    assert.match(userLayout, /authenticated = response\.ok/);
    assert.match(userLayout, /if \(!authenticated\) redirect/);
    assert.match(userArea, /response\.status === 401/);
    assert.match(userArea, /window\.location\.replace\('\/\?auth=login'\)/);
});

test('catalogue routes provide search, filters, pagination, fallback data and game play', () => {
    assert.match(catalogue, /Global catalogue search/);
    assert.match(catalogue, /All categories/);
    assert.match(catalogue, /All providers/);
    assert.match(catalogue, /className="pagination"/);
    assert.match(catalogue, /fallbackGames/);
    assert.match(catalogue, /className="home-game-grid"/);
    assert.match(catalogue, /className="game-card"/);
    assert.match(catalogue, /className="game-name"/);
    assert.doesNotMatch(catalogue, /modern-game-card|game-art/);
    assert.match(globalStyles, /\.home-game-grid[\s\S]*grid-template-columns: repeat\(3/);
    assert.match(globalStyles, /@media\(min-width:1024px\)[\s\S]*repeat\(6/);
    assert.match(globalStyles, /@media\(max-width:639px\)[\s\S]*repeat\(2/);
    assert.match(gamePlayer, /<iframe/);
    assert.match(gamePlayer, /Fallback preview/);
    assert.match(siteShell, /\/api\/public\/settings/);
    assert.match(siteShell, /Admin recovery request/);
    assert.match(siteShell, /\/api\/auth\/password\/email/);
    assert.match(fallbackData, /fallbackCategories/);
    assert.match(fallbackData, /fallbackProviders/);
});

test('reference content pages use the same compact homepage section format', () => {
    assert.match(publicShell, /catalogue-intro/);
    assert.match(publicShell, /home-content-section/);
    assert.match(publicShell, /home-section-heading/);
    assert.match(publicShell, /home-content-card/);
    assert.match(globalStyles, /font-size: clamp\(1\.75rem, 4vw, 2\.75rem\)/);
    assert.match(globalStyles, /\.account-heading h1,[\s\S]*font-size: 2rem/);
});

test('public reference routes are real metadata-backed pages with working navigation', () => {
    for (const slug of [
        'games',
        'cricket',
        'casino',
        'slot',
        'sportsbook',
        'fishing',
        'crash',
        'promotion',
        'jayarank/challenge',
        'register',
        'faq',
        'contact',
        'terms',
        'privacy',
        'responsible-gaming',
        'cookies',
        'about',
    ]) {
        assert.ok(
            publicContent.includes(`${slug}:`) || publicContent.includes(`'${slug}':`),
            `missing public page ${slug}`,
        );
    }
    assert.match(publicRoute, /generateStaticParams/);
    assert.match(publicRoute, /generateMetadata/);
    assert.match(publicRoute, /notFound\(\)/);
    for (const href of ['/terms', '/privacy', '/responsible-gaming', '/cookies', '/contact'])
        assert.match(publicShell + source, new RegExp(`href=["'{]+${href.replace('/', '\\/')}`));
    assert.doesNotMatch(source, /href="#" class="footer-link"/);
});

test('affiliate panel uses an isolated HTTP-only token and fixed BFF allowlist', () => {
    assert.match(affiliatePage, /redirect\('\/affi\/dashboard'\)/);
    assert.match(affiliateProxy, /jaba9_affiliate_token/);
    assert.doesNotMatch(affiliateProxy, /jaba9_token/);
    assert.match(affiliateProxy, /httpOnly: true/);
    assert.match(affiliateProxy, /path: '\/'/);
    for (const resource of [
        'login',
        'register',
        'dashboard',
        'users',
        'deposits',
        'earnings',
        'withdrawals',
        'transfer',
        'deposit',
        'withdraw',
        'logout',
    ])
        assert.ok(
            affiliateProxy.includes(`${resource}:`) || affiliateProxy.includes(`'${resource}':`),
            `missing affiliate resource ${resource}`,
        );
    for (const section of ['login', 'register', 'dashboard', 'earnings', 'withdraw', 'history', 'deposit', 'transfer'])
        assert.match(affiliateRoute + affiliateArea, new RegExp(section));
    assert.match(affiliateArea, /recipient_type/);
    assert.match(affiliateArea, /commission_balance/);
    assert.match(affiliateArea, /referral_link/);
    assert.match(affiliateArea, /fallbackAffiliateRecords/);
});
