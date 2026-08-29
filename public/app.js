(function () {
    const REQUEST_TIMEOUT_MS = 10_000;

    /** Finds the first matching element within an optional root. */
    function select(selector, root = document) {
        return root.querySelector(selector);
    }

    /** Escapes API text before inserting it into an HTML template. */
    function escapeHtml(value) {
        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(value ?? '').replace(/[&<>"']/g, (character) => entities[character]);
    }

    /** Extracts a safe readable message from a Laravel error envelope. */
    function readableError(payload) {
        const fieldMessage = payload?.errors
            ? Object.values(payload.errors).flat().find(Boolean)
            : null;
        if (fieldMessage) return String(fieldMessage);
        if (typeof payload?.message === 'string') return payload.message;
        return 'We could not complete your request. Please try again.';
    }

    /** Calls a same-origin BFF endpoint with a timeout and one safe GET retry. */
    async function requestJson(url, options = {}) {
        const attempts = !options.method || options.method === 'GET' ? 2 : 1;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            const controller = new AbortController();
            const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    signal: controller.signal,
                });
                let payload;
                try {
                    payload = await response.json();
                } catch {
                    throw new Error('The service is temporarily unavailable. Please try again.');
                }
                if (!response.ok || payload.status !== 'success')
                    throw new Error(readableError(payload));
                return payload.data;
            } catch (error) {
                if (attempt === attempts - 1) {
                    if (error?.name === 'AbortError')
                        throw new Error('The request timed out. Please try again.');
                    throw error instanceof Error
                        ? error
                        : new Error('Unable to connect right now.');
                }
            } finally {
                window.clearTimeout(timer);
            }
        }
    }

    /** Normalizes a CMS six-digit color into a browser-safe hex value. */
    function validHex(value) {
        if (typeof value !== 'string') return null;
        const normalized = value.startsWith('#') ? value : `#${value}`;
        return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : null;
    }

    /** Applies Laravel branding, currency metadata, favicon, and theme colors. */
    async function loadSettings() {
        try {
            const data = await requestJson('/api/public/settings');
            const setting = data.general_setting ?? {};
            const branding = data.branding ?? {};
            const siteName = String(setting.site_name || 'Jaba9');
            document.title = `${siteName} - Betting Platform`;
            document.documentElement.dataset.currency = String(setting.cur_text || '');
            document.documentElement.dataset.currencySymbol = String(setting.cur_sym || '');
            document.querySelectorAll('.currency-label').forEach((node) => {
                node.textContent = `${setting.cur_sym || ''} ${setting.cur_text || ''}`.trim();
            });
            document.querySelectorAll('.footer-site-name').forEach((node) => {
                node.textContent = siteName;
            });
            document.querySelectorAll('.logo-text').forEach((node) => {
                if (!branding.logo) return void (node.textContent = siteName);
                const image = document.createElement('img');
                Object.assign(image, {
                    src: branding.logo,
                    alt: siteName,
                    className: 'site-logo-image',
                });
                node.replaceChildren(image);
            });
            if (branding.favicon) {
                let icon = select('link[rel="icon"]');
                if (!icon) {
                    icon = document.createElement('link');
                    icon.rel = 'icon';
                    document.head.appendChild(icon);
                }
                icon.href = branding.favicon;
            }
            const primary = validHex(setting.base_color);
            const secondary = validHex(setting.secondary_color);
            if (primary) document.documentElement.style.setProperty('--gold', primary);
            if (secondary) document.documentElement.style.setProperty('--gold-dark', secondary);
        } catch (error) {
            console.error('General settings unavailable', error);
        }
    }

    /** Renders one escaped catalogue game card. */
    function gameCard(game) {
        const fallbackUrl = `/game/${encodeURIComponent(game.slug || game.id)}?id=${encodeURIComponent(game.id)}`;
        return `<a class="game-card" href="${escapeHtml(game.launch_url || fallbackUrl)}" data-game="${escapeHtml(game.id)}"><img src="${escapeHtml(game.image_url || '/assets/images/games/default-small.svg')}" alt="${escapeHtml(game.name)}" loading="lazy"><div class="game-name">${escapeHtml(game.name)}</div></a>`;
    }

    /** Loads clickable categories and games from the public API. */
    async function loadCatalogue() {
        try {
            const [home, categories] = await Promise.all([
                requestJson('/api/public/home'),
                requestJson('/api/public/categories'),
            ]);
            const categoriesNode = select('#categoryScroll');
            const gamesNode = select('#gameGrid');
            const recentGamesNode = select('#recentGameGrid');
            if (categoriesNode)
                categoriesNode.innerHTML = categories
                    .map(
                        (item) =>
                            `<a class="cat-item" href="/category/${encodeURIComponent(item.slug)}">${escapeHtml(item.icon || '🎮')} ${escapeHtml(item.name)}</a>`,
                    )
                    .join('');
            if (gamesNode)
                gamesNode.innerHTML = home.popular_games?.length
                    ? home.popular_games.map(gameCard).join('')
                    : '<p class="col-span-full text-center py-8">No games are available.</p>';
            if (recentGamesNode)
                recentGamesNode.innerHTML = home.recent_clicked_games?.length
                    ? home.recent_clicked_games.map(gameCard).join('')
                    : '<p class="col-span-full text-center py-8">No recently clicked games yet.</p>';
            /** Records clicks and immediately refreshes the recent unique game list. */
            document.addEventListener('click', async (event) => {
                const card = event.target.closest('[data-game]');
                if (!card) return;
                event.preventDefault();
                try {
                    const clickedGame = await requestJson('/api/public/click', {
                        method: 'POST',
                        body: JSON.stringify({ game_id: Number(card.dataset.game) }),
                    });
                    if (recentGamesNode) {
                        const recentGames = [
                            clickedGame,
                            ...(home.recent_clicked_games || []).filter(
                                (game) => game.id !== clickedGame.id,
                            ),
                        ].slice(0, 20);
                        home.recent_clicked_games = recentGames;
                        recentGamesNode.innerHTML = recentGames.map(gameCard).join('');
                    }
                } catch (error) {
                    console.error('Game click could not be recorded', error);
                }
                const launchUrl = card.getAttribute('href');
                if (launchUrl && launchUrl !== '#') window.top.location.href = launchUrl;
            });
        } catch (error) {
            console.error('Catalogue unavailable', error);
        }
    }

    /** Displays a safe authentication message inside the target form. */
    function showFormMessage(form, text) {
        let node = select('.api-message', form);
        if (!node) {
            node = document.createElement('p');
            node.className = 'api-message text-xs mt-2';
            form.appendChild(node);
        }
        node.textContent = text;
    }

    /** Prevents repeated form submission while an authentication request is active. */
    function setSubmitting(form, loading) {
        const button = select('button[type="submit"]', form);
        if (!button) return;
        button.disabled = loading;
        button.setAttribute('aria-busy', String(loading));
    }

    /** Connects existing login and registration forms to Next BFF routes. */
    function initializeAuthentication() {
        const routes = [
            ['#loginModal form', '/api/auth/login'],
            ['#registerModal form', '/api/auth/register'],
        ];
        routes.forEach(([selector, route]) => {
            const form = select(selector);
            if (!form) return;
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const values = Object.fromEntries(new FormData(form));
                if (
                    route.endsWith('/register') &&
                    values.password !== values.password_confirmation
                ) {
                    showFormMessage(form, 'Password and confirm password must match.');
                    return;
                }
                setSubmitting(form, true);
                try {
                    await requestJson(route, {
                        method: 'POST',
                        body: JSON.stringify(values),
                    });
                    window.top.location.href = '/dashboard';
                } catch (error) {
                    showFormMessage(form, error.message);
                    setSubmitting(form, false);
                }
            });
        });
    }

    /** Enables accessible show/hide controls already present in password fields. */
    function initializePasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach((button) => {
            button.addEventListener('click', () => {
                const input = button.previousElementSibling;
                const reveal = input?.type === 'password';
                if (!input) return;
                input.type = reveal ? 'text' : 'password';
                button.setAttribute('aria-pressed', String(reveal));
            });
        });
    }

    /** Connects the forgot-password link to the bounded recovery endpoints. */
    function initializePasswordRecovery() {
        const link = select('#loginModal a');
        if (!link) return;
        link.dataset.recoveryEndpoints =
            '/api/auth/password/email /api/auth/password/verify /api/auth/password/reset';
    }

    /** Starts all homepage integrations after the standalone document is ready. */
    function initializeHomepage() {
        loadSettings();
        loadCatalogue();
        initializeAuthentication();
        initializePasswordToggles();
        initializePasswordRecovery();
        document.querySelectorAll('.live-score-card').forEach((card) => {
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');
            card.addEventListener('click', () => (window.top.location.href = '/sportsbook'));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.top.location.href = '/sportsbook';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initializeHomepage);
})();
