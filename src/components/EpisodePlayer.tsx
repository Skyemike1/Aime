import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { HelpCircle, RefreshCw, Sparkles, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface StreamSource {
  url: string;
  quality: string;
  isM3U8?: boolean;
}

interface StreamData {
  sources: StreamSource[];
  headers?: { Referer?: string; [key: string]: string | undefined };
  download?: string;
}

interface EpisodePlayerProps {
  anilistId: number;
  malId?: number;
  animeTitle: string;
  episodeNumber: string;
  episodeTitle?: string;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

type PlayerState = 'loading' | 'playing' | 'error';

export default function EpisodePlayer({
  animeTitle,
  episodeNumber,
  episodeTitle,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: EpisodePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  const fetchStream = useCallback(async () => {
    setPlayerState('loading');
    setErrorMsg('');
    setStreamData(null);

    try {
      const params = new URLSearchParams({ title: animeTitle, episode: episodeNumber });
      const res = await fetch(`/api/stream?${params}`);
      const data: StreamData & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Stream not found');
      }

      const sources = data.sources ?? [];
      const best =
        sources.find((s) => s.quality === 'default') ||
        sources.find((s) => s.isM3U8) ||
        sources[0];

      setStreamData(data);
      if (best) setSelectedQuality(best.quality);
      setPlayerState('playing');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load stream';
      setErrorMsg(msg);
      setPlayerState('error');
    }
  }, [animeTitle, episodeNumber]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  useEffect(() => {
    if (playerState !== 'playing' || !streamData || !videoRef.current) return;

    const sources = streamData.sources ?? [];
    const source = sources.find((s) => s.quality === selectedQuality) || sources[0];
    if (!source) return;

    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (source.isM3U8 !== false && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        xhrSetup: (xhr) => {
          if (streamData.headers?.Referer) {
            xhr.setRequestHeader('Referer', streamData.headers.Referer);
          }
        },
      });
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.once(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source.url;
      video.play().catch(() => {});
    } else {
      video.src = source.url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playerState, streamData, selectedQuality]);

  const qualities = (streamData?.sources ?? []).map((s) => s.quality);
  const gogoanimeSlug = animeTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const externalUrl = `https://gogoanime.tel/${gogoanimeSlug}-episode-${episodeNumber}`;

  return (
    <div className="flex flex-col space-y-4 w-full bg-[#050505] border border-white/5 rounded-3xl p-4 md:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs tracking-[0.2em]">
            <Sparkles size={14} />
            <span>NOW PLAYING</span>
          </div>
          <h2 className="text-lg md:text-xl font-serif italic text-white mt-1">
            Episode {episodeNumber}{episodeTitle ? `: ${episodeTitle}` : ''}
          </h2>
        </div>

        <div className="text-xxs font-medium bg-white/5 border border-white/5 text-gray-400 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                playerState === 'playing'
                  ? 'bg-green-400'
                  : playerState === 'error'
                  ? 'bg-red-400'
                  : 'bg-yellow-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                playerState === 'playing'
                  ? 'bg-green-500'
                  : playerState === 'error'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
            />
          </span>
          <span>
            {playerState === 'playing'
              ? 'Streaming — GogoAnime'
              : playerState === 'error'
              ? 'Stream Unavailable'
              : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Player */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
        {playerState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black z-10">
            <Loader2 size={36} className="text-violet-400 animate-spin" />
            <p className="text-gray-400 text-sm">
              Finding stream for{' '}
              <span className="text-white font-semibold">{animeTitle}</span>...
            </p>
            <p className="text-gray-600 text-xs">Searching GogoAnime database</p>
          </div>
        )}

        {playerState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-5 bg-black z-10 p-6 text-center">
            <AlertCircle size={36} className="text-red-400" />
            <div className="space-y-1.5">
              <p className="text-white font-semibold text-sm">Stream Not Found</p>
              <p className="text-gray-500 text-xs max-w-xs">{errorMsg}</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={fetchStream}
                className="px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-semibold hover:bg-violet-500/30 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                Retry
              </button>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg text-xs font-semibold hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                Watch on GogoAnime <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full ${playerState === 'playing' ? 'block' : 'hidden'}`}
          controls
          playsInline
          autoPlay
        />
      </div>

      {/* Controls */}
      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 flex flex-col space-y-2 text-left">
          <div className="flex items-center space-x-1.5">
            <HelpCircle size={13} className="text-gray-500" />
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider">
              {qualities.length > 0 ? 'Quality' : 'Loading...'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {qualities.map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuality(q)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  selectedQuality === q
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                    : 'bg-[#080808] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasPrev && (
            <button
              onClick={onPrev}
              className="px-4 py-2 border border-white/10 bg-[#080808] text-[#E0E0E0] font-semibold text-xs rounded-xl hover:text-violet-400 hover:border-violet-500/30 transition-all cursor-pointer shadow"
            >
              Prev
            </button>
          )}

          <button
            onClick={fetchStream}
            className="p-2 border border-white/10 bg-[#080808] text-gray-400 hover:text-violet-400 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer"
            title="Reload stream"
          >
            <RefreshCw size={13} />
          </button>

          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-white/10 bg-[#080808] text-gray-400 hover:text-violet-400 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer flex items-center justify-center"
            title="Open on GogoAnime"
          >
            <ExternalLink size={13} />
          </a>

          {hasNext && (
            <button
              onClick={onNext}
              className="px-5 py-2 bg-white hover:bg-violet-400 font-bold text-xs rounded-xl text-black transition-all cursor-pointer shadow-md"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
