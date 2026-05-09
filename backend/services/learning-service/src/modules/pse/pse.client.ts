import config from '../../config';
import type { SerperItem, SerperResponse } from './pse.types';

const SERPER_URL = 'https://google.serper.dev/search';

export async function search(query: string, siteSearch?: string): Promise<SerperItem[]> {
  const { apiKey } = config.serper;
  if (!apiKey) return [];

  // Serper uses site: operator in the query string for domain-restricted searches
  const q = siteSearch ? `${query} site:${siteSearch}` : query;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(SERPER_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q, num: 10 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as SerperResponse;
    return data.organic ?? [];
  } catch {
    clearTimeout(timer);
    return [];
  }
}
