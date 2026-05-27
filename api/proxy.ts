import type { IncomingMessage, ServerResponse } from 'http';

const ALLOWED_HOSTS = [
  'vidlink.pro',
  'vidsrc.me',
  'vidsrc.cc',
  'vidsrc.to',
  'embed.su',
];

function getQuery(req: IncomingMessage): Record<string, string> {
  const url = new URL(req.url || '/', 'http://localhost');
  const result: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { result[k] = v; });
  return result;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { url: targetUrl } = getQuery(req);

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing url query parameter' }));
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid URL' }));
    return;
  }

  const allowed = ALLOWED_HOSTS.some(
    (h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h)
  );

  if (!allowed) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Host not allowed' }));
    return;
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: parsed.origin,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'text/html';
    res.writeHead(upstream.status, {
      'Content-Type': contentType,
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': '',
    });

    const body = await upstream.text();
    res.end(body);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch from upstream' }));
  }
}
