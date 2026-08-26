const DEFAULT_TIMEOUT_MS = 10_000;

export async function upstreamFetch(url: string, init: RequestInit = {}, retryGet = false): Promise<Response> {
  const attempts = retryGet && (!init.method || init.method === 'GET') ? 2 : 1;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.status < 500 || attempt === attempts - 1) return response;
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1) throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Upstream request failed.');
}
