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

const PROXY_BASE = import.meta.env.VITE_PROXY_URL as string | undefined;

function proxyUrl(directUrl: string): string {
  if (!PROXY_BASE) return directUrl;
  return `${PROXY_BASE}/proxy?url=${encodeURIComponent(directUrl)}`;
}

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

  const getDirectUrl = (server: ServerKey, ep: string): string => {
    const showId = malId || anilistId;
    switch (server) {
      case 'vidlink_query':
        return `https://vidlink.pro/embed/anime/${anilistId}?episode=${ep}&primaryColor=a78bfa`;
      case 'vidlink_path':
        return `https://vidlink.pro/embed/anime/${anilistId}/${ep}?primaryColor=a78bfa`;
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

  const getServerUrl = (server: ServerKey, ep: string): string => {
    return proxyUrl(getDirectUrl(server, ep));
  };

  const servers: Array<{ id: ServerKey; name: string; speed: string }> = [
    { id: 'vidlink_query', name: 'VidLink (Query)', speed: 'Ultra' },
    { id: 'vidlink_path', name: 'VidLink (Path)', speed: 'Ultra' },
    { id: 'vidsrc_me', name: 'VidSrc.me', speed: 'High' },
    { id: 'vidsrc_cc', name: 'VidSrc.cc', speed: 'Fast' },
    { id: 'vidsrc_to', name: 'VidSrc.to', speed: 'Normal' },
    { id: 'embed_su', name: 'Embed.su', speed: 'High' },
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
            Episode {episodeNumber} {episodeTitle ? `: ${episodeTitle}` : ''}
          </h2>
        </div>

        <div className="text-xxs font-medium bg-white/5 border border-white/5 text-gray-400 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span>Online - {servers.find((s) => s.id === activeServer)?.name}</span>
        </div>
      </div>

      {/* Proxy status notice */}
      {PROXY_BASE ? (
        <div className="bg-green-950/20 border border-green-500/20 p-3.5 sm:p-4 rounded-xl text-left space-y-2">
          <div className="flex items-start space-x-2.5">
            <HelpCircle className="text-green-400 mt-0.5 shrink-0" size={16} />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-green-300 tracking-wide uppercase">
                Proxy Server Active
              </h4>
              <p className="text-xxs sm:text-xs text-gray-400 leading-relaxed font-light">
                Video requests are routed through your proxy server to bypass domain restrictions.
                If a player still fails, try switching to a backup server below.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-violet-950/20 border border-violet-500/20 p-3.5 sm:p-4 rounded-xl text-left space-y-2">
          <div className="flex items-start space-x-2.5">
            <HelpCircle className="text-violet-400 mt-0.5 shrink-0" size={16} />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-violet-350 tracking-wide uppercase">
                Proxy Not Configured
              </h4>
              <p className="text-xxs sm:text-xs text-gray-400 leading-relaxed font-light">
                Set <span className="text-violet-300 font-mono">VITE_PROXY_URL</span> in your environment to your Railway proxy URL for best playback.
                If the player is blank, use <span className="text-violet-300 font-medium">"Open Direct Link"</span> to watch in a new tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Embed frame wrapper */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#050505] shadow-inner group">
        <iframe
          src={getServerUrl(activeServer, episodeNumber)}
          className="w-full h-full border-0 rounded-2xl"
          allowFullScreen
          scrolling="no"
          referrerPolicy="no-referrer"
          allow="autoplay; encrypted-media; picture-in-picture"
          title={`Player Frame | Episode ${episodeNumber}`}
        />
      </div>

      {/* Backup Servers Block */}
      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 flex flex-col space-y-2 text-left">
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            <HelpCircle size={13} className="text-gray-500" />
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider mr-2">
              If player fails, switch backup server or
            </span>
            <a
              href={getDirectUrl(activeServer, episodeNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xxs font-bold text-violet-400 hover:text-violet-300 underline uppercase tracking-wider flex items-center gap-0.5"
            >
              <span>Open Direct Link</span>
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

        {/* Player Controls */}
        <div className="flex items-center space-x-2">
          {hasPrev && (
            <button
              onClick={onPrev}
              className="px-4 py-2 border border-white/10 bg-[#080808] text-[#E0E0E0] font-semibold text-xs rounded-xl hover:text-violet-400 hover:border-violet-500/30 transition-all cursor-pointer shadow flex items-center space-x-1"
            >
              <span>Prev</span>
            </button>
          )}

          <button
            onClick={() => {
              const current = activeServer;
              const temp = current === 'vidlink_query' ? 'vidsrc_me' : 'vidlink_query';
              setActiveServer(temp);
              setTimeout(() => setActiveServer(current), 10);
            }}
            className="p-2 border border-white/10 bg-[#080808] text-gray-400 hover:text-violet-400 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer"
            title="Reload Video Player"
          >
            <RefreshCw size={13} />
          </button>

          <a
            href={getDirectUrl(activeServer, episodeNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-white/10 bg-[#080808] text-gray-400 hover:text-violet-400 rounded-xl hover:border-violet-500/30 transition-colors cursor-pointer flex items-center justify-center"
            title="Open in Direct Tab"
          >
            <ExternalLink size={13} />
          </a>

          {hasNext && (
            <button
              onClick={onNext}
              className="px-5 py-2 bg-white hover:bg-violet-400 font-bold text-xs rounded-xl text-black transition-all cursor-pointer shadow-md flex items-center space-x-1"
            >
              <span>Next</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
