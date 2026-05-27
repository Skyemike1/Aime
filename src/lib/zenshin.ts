import { ZenshinMappingResponse } from '../types';

const PRIMARY_BASE_URL = 'https://zenshin-supabase-api.onrender.com';
const BACKUP_BASE_URL = 'https://zenshin-supabase-api-myig.onrender.com';

async function fetchWithTimeout(url: string, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function fetchZenshinMapping(anilistId: number, malId?: number): Promise<ZenshinMappingResponse | null> {
  const urisToTry: string[] = [];

  // 1. Try by AniList ID on primary
  urisToTry.push(`${PRIMARY_BASE_URL}/mappings?anilist_id=${anilistId}`);
  // 2. Try by AniList ID on backup
  urisToTry.push(`${BACKUP_BASE_URL}/mappings?anilist_id=${anilistId}`);

  if (malId) {
    // 3. Try by MAL ID on primary
    urisToTry.push(`${PRIMARY_BASE_URL}/mappings?mal_id=${malId}`);
    // 4. Try by MAL ID on backup
    urisToTry.push(`${BACKUP_BASE_URL}/mappings?mal_id=${malId}`);
  }

  for (const url of urisToTry) {
    try {
      console.log(`Trying Zenshin mapping endpoint: ${url}`);
      const res = await fetchWithTimeout(url, 6000);
      if (res.ok) {
        const data = await res.json();
        // Check if we got valid mapping data back
        if (data && (data.episodes || data.mappings)) {
          console.log(`Successfully mapped anime via Zenshin on endpoint: ${url}`);
          return data as ZenshinMappingResponse;
        }
      }
    } catch (err) {
      console.warn(`Failed mapping fetch on endpoint ${url}:`, err);
    }
  }

  console.warn(`Could not find Zenshin mapping for AniList ${anilistId} / MAL ${malId} on any endpoint.`);
  return null;
}
