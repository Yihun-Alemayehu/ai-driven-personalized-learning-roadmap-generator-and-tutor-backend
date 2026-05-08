import config from '../../config';
import type { PseItem, PseResponse } from './pse.types';

const BASE_URL = 'https://www.googleapis.com/customsearch/v1';

export async function search(query: string, siteSearch?: string): Promise<PseItem[]> {
  const { apiKey, cx } = config.pse;
  if (!apiKey || !cx) return [];

  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    num: '10',
  });
  if (siteSearch) params.set('siteSearch', siteSearch);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${BASE_URL}?${params}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as PseResponse;
    return data.items ?? [];
  } catch {
    clearTimeout(timer);
    return [];
  }
}
