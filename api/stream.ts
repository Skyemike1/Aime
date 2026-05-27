import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, episode } = req.query;

  if (!title || !episode) {
    return res.status(400).json({ error: 'title and episode are required' });
  }

  const titleStr = String(title);
  const episodeNum = parseInt(String(episode));

  try {
    const { ANIME } = await import('@consumet/extensions');
    const provider = new ANIME.Gogoanime();

    let results = (await provider.search(titleStr)).results;

    if (!results || results.length === 0) {
      const simplified = titleStr.split(':')[0].split('(')[0].trim();
      results = (await provider.search(simplified)).results;
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        error: `Could not find "${titleStr}" on GogoAnime`,
      });
    }

    const animeInfo = await provider.fetchAnimeInfo(results[0].id);
    const targetEp = animeInfo.episodes?.find((ep) => ep.number === episodeNum);

    if (!targetEp) {
      return res.status(404).json({
        error: `Episode ${episodeNum} not found`,
        totalEpisodes: animeInfo.episodes?.length ?? 0,
        animeSlug: results[0].id,
      });
    }

    const sources = await provider.fetchEpisodeSources(String(targetEp.id));
    return res.status(200).json(sources);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
