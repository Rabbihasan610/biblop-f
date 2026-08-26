import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
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
const upstreamFetch = fs.readFileSync(new URL('../lib/upstream-fetch.ts', import.meta.url), 'utf8');
const nextConfig = fs.readFileSync(new URL('../next.config.mjs', import.meta.url), 'utf8');
const packageJson = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('home renders the supplied standalone document shell', () =>
    assert.match(page, /src="\/index\.html"/));
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
    assert.match(source, /\.header-glass \*[\s\S]*border-color: transparent !important/);
    assert.match(source, /body > \.max-w-7xl[\s\S]*padding-top: 86px/);
    assert.equal((source.match(/class="modal-close"/g) || []).length, 4);
    assert.equal((source.match(/aria-label="Close [^"]+ dialog"/g) || []).length, 4);
    assert.match(source, /modal\.setAttribute\('aria-modal', 'true'\)/);
    assert.match(source, /modal\.querySelector\('\.modal-close'\)\?\.focus\(\)/);
    assert.match(source, /modalTrigger instanceof HTMLElement/);
});
test('homepage header follows the two-tier reference structure and keeps dynamic colors', () => {
    assert.match(source, /class="header-top"/);
    assert.match(source, /class="header-nav"/);
    assert.match(source, /Login[\s\S]*Sign Up[\s\S]*currency-label/);
    assert.match(source, /Cricket[\s\S]*Live Casino[\s\S]*Slot Games[\s\S]*Sportsbook/);
    assert.match(source, /\.header-top[\s\S]*background: color-mix\(in srgb, var\(--gold-dark\)/);
    assert.match(source, /\.header-nav[\s\S]*background: color-mix\(in srgb, var\(--gold\)/);
    assert.match(source, /overflow-x: auto/);
    assert.match(homepageIntegration, /querySelectorAll\('\.currency-label'\)/);
});
test('homepage restores the compact mobile header with harmonized API colors', () => {
    assert.match(source, /\.header-top[\s\S]*color-mix\(in srgb, var\(--gold-dark\)/);
    assert.match(source, /\.header-nav[\s\S]*color-mix\(in srgb, var\(--gold\)/);
    assert.match(source, /@media \(max-width: 639px\)[\s\S]*\.header-glass[\s\S]*display: none/);
    assert.match(source, /\.legacy-header\.hidden[\s\S]*display: flex !important/);
    assert.match(source, /\.legacy-header\.hidden[\s\S]*position: fixed/);
    assert.match(source, /background: var\(--gold-dark\)/);
    assert.match(source, /inset: 0 0 auto 0/);
    assert.match(source, /padding-top: 66px/);
});
test('desktop and mobile headers are locked to the viewport top', () => {
    assert.match(
        source,
        /\.header-glass[\s\S]*position: fixed !important[\s\S]*inset: 0 0 auto 0 !important/,
    );
    assert.match(
        source,
        /\.legacy-header\.hidden[\s\S]*position: fixed !important[\s\S]*inset: 0 0 auto 0 !important/,
    );
});
test('header icons and text are horizontally and vertically centered', () => {
    assert.match(
        source,
        /\.header-glass \.header-language[\s\S]*align-items: center[\s\S]*justify-content: center/,
    );
    assert.match(
        source,
        /\.legacy-header \.mobile-only[\s\S]*width: 40px[\s\S]*height: 40px[\s\S]*align-items: center[\s\S]*justify-content: center/,
    );
    assert.match(source, /\.legacy-header \.mobile-only i[\s\S]*transform: none/);
});
test('homepage header controls render without individual boxes', () => {
    assert.match(
        source,
        /\.header-glass \.header-auth-button\.primary[\s\S]*background: transparent !important/,
    );
    assert.match(
        source,
        /\.header-glass \.header-new-badge[\s\S]*background: transparent !important/,
    );
    assert.match(source, /\.legacy-header \.avatar-ring[\s\S]*background: transparent !important/);
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
    assert.match(integration, /\/api\/public\/games/);
    assert.match(integration, /\/api\/public\/categories/);
    assert.match(integration, /\/api\/public\/click/);
    assert.match(integration, /\/api\/public\/settings/);
    assert.match(integration, /data\.general_setting/);
    assert.match(integration, /branding\.logo/);
    assert.match(integration, /validHex/);
    assert.match(source, /id="providerMega"/);
    assert.match(source, /id="recentGameGrid"/);
    assert.match(integration, /home\.popular_games/);
    assert.match(integration, /home\.recent_clicked_games/);
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
});
test('user dashboard is guarded and renders the supplied document', () => {
    assert.match(dashboardPage, /cookies\(\)/);
    assert.match(dashboardPage, /jubo88_token/);
    assert.match(dashboardPage, /redirect\('\/'\)/);
    assert.match(dashboardPage, /src="\/user-dashboard\.html"/);
    assert.match(dashboardSource, /<title>JUBO88 - User Dashboard<\/title>/);
    assert.match(dashboardSource, /id="depositModal"/);
    assert.match(dashboardSource, /id="withdrawModal"/);
    assert.match(dashboardSource, /src="\/user-dashboard-app\.js"/);
    for (const resource of [
        'dashboard',
        'transactions',
        'deposits',
        'withdrawals',
        'game-logs',
        'deposit-methods',
        'withdraw-methods',
        'password',
    ])
        assert.match(dashboardIntegration, new RegExp(`['"]${resource}['"]`));
    for (const resource of ['profile', 'profile-save', 'tickets', 'ticket-create'])
        assert.ok(
            userProxy.includes(`${resource}:`) || userProxy.includes(`'${resource}':`),
            `missing user BFF resource ${resource}`,
        );
    assert.match(userProxy, /jubo88_token/);
    assert.match(userProxy, /Authorization: `Bearer \$\{token\}`/);
    assert.match(userProxy, /routes\[resource\]/);
    for (const label of [
        'Dashboard',
        'Deposit',
        'Withdraw',
        'History',
        'Logs',
        'My Profile',
        'Password Change',
        'Support',
    ])
        assert.match(dashboardSource, new RegExp(`>${label}<|> ${label}<`));
    assert.match(dashboardSource, /goToUserArea/);
    assert.match(
        dashboardSource,
        /Home[\s\S]*Category List[\s\S]*Games[\s\S]*Live[\s\S]*Promotions/,
    );
    assert.match(dashboardSource, /BALANCE CARD[\s\S]*USER MENU[\s\S]*STATISTICS ROW/);
    assert.match(dashboardSource, /class="user-menu-tabs glass"/);
    assert.doesNotMatch(dashboardSource, /goToUserArea\('\/user\//);
    assert.match(dashboardSource, /openModal\('depositModal'\)/);
    assert.match(dashboardSource, /openModal\('accountPanelModal'\)/);
    assert.match(dashboardIntegration, /showProfile/);
    assert.match(dashboardIntegration, /showSupport/);
    assert.match(dashboardIntegration, /withdrawalFields/);
    assert.match(dashboardIntegration, /\/api\/auth\/logout/);
    assert.doesNotMatch(dashboardIntegration, /prompt\(/);
    assert.doesNotMatch(dashboardSource, /href="#"/);
    assert.match(dashboardIntegration, /AbortController/);
    assert.match(dashboardSource, /data-loading="true"/);
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
    assert.match(affiliatePage, /jubo88_affiliate_token/);
    assert.doesNotMatch(affiliatePage + affiliateProxy, /jubo88_token/);
    assert.match(affiliateProxy, /httpOnly: true/);
    assert.match(affiliateProxy, /path: '\/affiliate'/);
    for (const resource of [
        'login',
        'register',
        'dashboard',
        'users',
        'deposits',
        'earnings',
        'withdrawals',
        'transfer',
        'withdraw',
        'logout',
    ])
        assert.ok(
            affiliateProxy.includes(`${resource}:`) || affiliateProxy.includes(`'${resource}':`),
            `missing affiliate resource ${resource}`,
        );
    for (const state of ['Loading', 'No records found', 'temporarily unavailable'])
        assert.match(affiliatePanel + affiliateProxy, new RegExp(state));
    assert.match(affiliatePanel, /commission_balance/);
    assert.match(affiliatePanel, /referral_link/);
});
