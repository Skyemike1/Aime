import React, { useState } from 'react';
import { HelpCircle, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';

interface EpisodePlayerProps {
  anilistId: number;
  malId?: number;
  episodeNumber: string;
  episodeTitle?: string;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

type ServerKey = 'vidlink_query' | 'vidlink_path' | 'vidsrc_me' | 'vidsrc_cc' | 'vidsrc_to' | 'embed_su';

export default function EpisodePlayer({
  anilistId,
  malId,
  episodeNumber,
  episodeTitle,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: EpisodePlayerProps) {
  const [activeServer, setActiveServer] = useState<ServerKey>('vidlink_query');

  const getServerUrl = (server: ServerKey, ep: string): string => {
    const showId = malId || anilistId;
    switch (server) {
      case 'vidlink_query':
        return `https://vidlink.pro/embed/anime/${anilistId}?episode=${ep}&primaryColor=a78bfa&autoplay=true`;
      case 'vidlink_path':
        return `https://vidlink.pro/embed/anime/${anilistId}/${ep}?primaryColor=a78bfa&autoplay=true`;
      case 'vidsrc_me':
        return `https://vidsrc.me/embed/anime/${showId}/${ep}`;
      case 'vidsrc_cc':
        return `https://vidsrc.cc/v2/embed/anime/${showId}/${ep}`;
      case 'vidsrc_to':
        return `https://vidsrc.to/embed/anime/${showId}/${ep}`;
      case 'embed_su':
        return `https://embed.su/embed/anime/${showId}/${ep}`;
      default:
        return '';
    }
  };

  const servers: Array<{ id: ServerKey; name: string }> = [
    { id: 'vidlink_query', name: 'VidLink' },
    { id: 'vidlink_path', name: 'VidLink (Alt)' },
    { id: 'vidsrc_me', name: 'VidSrc.me' },
    { id: 'vidsrc_cc', name: 'VidSrc.cc' },
    { id: 'vidsrc_to', name: 'VidSrc.to' },
    { id: 'embed_su', name: 'Embed.su' },
  ];

  return (
    <div className="flex flex-col space-y-4 w-full bg-[#050505] border border-white/5 rounded-3xl p-4 md:p-6 shadow-2xl">
      {/* Player Header */}
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
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span>Online — {servers.find((s) => s.id === activeServer)?.name}</span>
        </div>
      </div>

      {/* Embed frame — fills aspect-video, plays inside the page */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
        <iframe
          key={`${activeServer}-${episodeNumber}`}
          src={getServerUrl(activeServer, episodeNumber)}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer"
          title={`Episode ${episodeNumber}`}
        />
      </div>

      {/* Server selector + controls */}
      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 flex flex-col space-y-2 text-left">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <HelpCircle size={13} className="text-gray-500" />
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider">
              Blank screen? Switch server or
            </span>
            <a
              href={getServerUrl(activeServer, episodeNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xxs font-bold text-violet-400 hover:text-violet-300 underline uppercase tracking-wider flex items-center gap-0.5"
            >
              Open in New Tab
              <ExternalLink size={10} />
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            {servers.map((server) => (
              <button
                key={server.id}
                onClick={() => setActiveServer(server.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  activeServer === server.id
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                    : 'bg-[#080808] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                }`}
              >
                {server.name}
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
            onClick={() => {
              const cur = activeServer;
              const tmp: ServerKey = cur === 'vidlink_query' ? 'vidsrc_me' : 'vidlink_query';
              setActiveServer(tmp);
              setTimeout(() => setActiveServer(cur), 50);
            }}
            className="p-2 border border-white/10 bg-[#080808] text-gray-400 hover:text-violet-400 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer"
            title="Reload player"
          >
            <RefreshCw size={13} />
          </button>

          <a
            href={getServerUrl(activeServer, episodeNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-white/10 bg-[#080808] text-gray-400 hover:text-violet-400 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer flex items-center justify-center"
            title="Open in new tab"
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
