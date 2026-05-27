import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Calendar, RefreshCw, LayoutGrid, Radio, Heart, HelpCircle, Film, Sparkles } from 'lucide-react';
import { AniListMedia, ZenshinEpisode, ZenshinMappingResponse } from '../types';
import { fetchZenshinMapping } from '../lib/zenshin';
import EpisodePlayer from './EpisodePlayer';

interface EpisodeThumbnailProps {
  imageSrc?: string | null;
  fallbackBanner?: string | null;
  fallbackCover: string;
  episodeNumber: string;
}

function EpisodeThumbnail({ imageSrc, fallbackBanner, fallbackCover, episodeNumber }: EpisodeThumbnailProps) {
  const initialSrc = imageSrc || fallbackBanner || fallbackCover;
  const [src, setSrc] = useState(initialSrc);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    setSrc(imageSrc || fallbackBanner || fallbackCover);
    setHasTriedFallback(false);
  }, [imageSrc, fallbackBanner, fallbackCover]);

  const handleError = () => {
    if (!hasTriedFallback) {
      setHasTriedFallback(true);
      if (src === imageSrc && fallbackBanner) {
        setSrc(fallbackBanner);
      } else {
        setSrc(fallbackCover);
      }
    } else if (src !== fallbackCover) {
      setSrc(fallbackCover);
    }
  };

  return (
    <img
      src={src}
      alt={`Episode ${episodeNumber}`}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
}

interface AnimeDetailProps {
  anime: AniListMedia;
  onClose: () => void;
}

export default function AnimeDetail({ anime, onClose }: AnimeDetailProps) {
  const [zenshinData, setZenshinData] = useState<ZenshinMappingResponse | null>(null);
  const [loadingMapping, setLoadingMapping] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'watch' | 'info'>('watch');

  const playerRef = useRef<HTMLDivElement>(null);

  // Parse total episodes if zenshin mappings are unavailable
  const nominalEpisodeCount = anime.episodes || 12;

  useEffect(() => {
    let active = true;
    setLoadingMapping(true);
    setZenshinData(null);
    setSelectedEpisode(null);

    async function load() {
      try {
        const data = await fetchZenshinMapping(anime.id, anime.idMal);
        if (active) {
          setZenshinData(data);
          // Auto select first episode if episodes are mapped
          if (data && data.episodes && Object.keys(data.episodes).length > 0) {
            // Pick the lowest numeric episode key
            const numericKeys = Object.keys(data.episodes)
              .filter((k) => !isNaN(Number(k)))
              .sort((a, b) => Number(a) - Number(b));
            if (numericKeys.length > 0) {
              setSelectedEpisode(numericKeys[0]);
            } else {
              setSelectedEpisode(Object.keys(data.episodes)[0]);
            }
          } else {
            // Fallback to episode 1
            setSelectedEpisode('1');
          }
        }
      } catch (err) {
        console.error('Error in mapping fetcher:', err);
      } finally {
        if (active) {
          setLoadingMapping(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [anime]);

  const handleSelectEpisode = (epNum: string) => {
    setSelectedEpisode(epNum);
    // Smooth scroll to video player
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNextEpisode = (keyList: string[]) => {
    if (!selectedEpisode) return;
    const currentIdx = keyList.indexOf(selectedEpisode);
    if (currentIdx !== -1 && currentIdx < keyList.length - 1) {
      handleSelectEpisode(keyList[currentIdx + 1]);
    }
  };

  const handlePrevEpisode = (keyList: string[]) => {
    if (!selectedEpisode) return;
    const currentIdx = keyList.indexOf(selectedEpisode);
    if (currentIdx !== -1 && currentIdx > 0) {
      handleSelectEpisode(keyList[currentIdx - 1]);
    }
  };

  const stripHtml = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // Divide episodes into Regular (numeric ones) and Specials (extras / openings)
  let regularEpisodes: Array<{ key: string; ep: ZenshinEpisode }> = [];
  let specialEpisodes: Array<{ key: string; ep: ZenshinEpisode }> = [];

  if (zenshinData && zenshinData.episodes) {
    Object.entries(zenshinData.episodes).forEach(([key, ep]) => {
      const isNumeric = !isNaN(Number(key));
      if (isNumeric) {
        regularEpisodes.push({ key, ep });
      } else {
        specialEpisodes.push({ key, ep });
      }
    });

    // Sort regular numerically ascending
    regularEpisodes.sort((a, b) => Number(a.key) - Number(b.key));
  } else {
    // Generate mock fallback numeric indexes
    for (let i = 1; i <= nominalEpisodeCount; i++) {
      regularEpisodes.push({
        key: String(i),
        ep: {
          episode: String(i),
          type: 'Regular Episode',
          title: { en: `Episode ${i}` },
        },
      });
    }
  }

  const allEpisodeKeys = [
    ...regularEpisodes.map((r) => r.key),
    ...specialEpisodes.map((s) => s.key),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex justify-center py-4 px-3 sm:px-4 md:py-8">
      {/* Background Anime Backdrop Mask blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt=""
          className="w-full h-full object-cover filter blur-3xl opacity-20 brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[#050505]/85" />
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-5xl bg-[#080808] border border-white/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Banner with blur */}
        <div className="relative h-[200px] sm:h-[280px] w-full bg-[#050505]">
          <img
            src={anime.bannerImage || anime.coverImage.extraLarge}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-black/60" />

          {/* Close Action Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-45 bg-black/60 hover:bg-white hover:text-black p-2 text-gray-300 rounded-full border border-white/5 transition-all cursor-pointer shadow-md"
          >
            <X size={20} />
          </button>

          {/* Floated Header details */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 flex flex-col md:flex-row gap-4 items-start md:items-end">
            <img
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt=""
              className="w-24 sm:w-36 rounded-2xl border-4 border-[#080808] shadow-2xl bg-[#050505] hidden sm:block object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-left space-y-2">
              <h1 className="text-xl sm:text-3xl font-serif italic text-white tracking-tighter drop-shadow-md">
                {anime.title.english || anime.title.romaji}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-350 font-medium pb-2">
                {anime.averageScore && (
                  <div className="flex items-center text-amber-400 space-x-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 shadow-sm">
                    <Star size={13} className="fill-amber-400 stroke-amber-400" />
                    <span>{(anime.averageScore / 10).toFixed(1)} Rating</span>
                  </div>
                )}
                {anime.seasonYear && (
                  <div className="flex items-center space-x-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 shadow-sm">
                    <Calendar size={13} className="text-gray-400" />
                    <span>{anime.season} {anime.seasonYear}</span>
                  </div>
                )}
                <div className="bg-white/10 px-2.5 py-1 rounded-md border border-white/10 font-bold text-xxs tracking-wider uppercase">
                  {anime.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls Menu */}
        <div className="border-b border-white/5 px-6 bg-[#080808]/85 flex items-center justify-between">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('watch')}
              className={`py-4 text-sm font-semibold tracking-wide relative cursor-pointer ${
                activeTab === 'watch' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Watch Online</span>
              {activeTab === 'watch' && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 text-sm font-semibold tracking-wide relative cursor-pointer ${
                activeTab === 'info' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Overview & Info</span>
              {activeTab === 'info' && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-gray-500 text-xxs font-bold uppercase tracking-wider">
            <Radio size={12} className="text-violet-400" />
            <span>HQ Streaming Servers Connected</span>
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {activeTab === 'watch' ? (
            <div className="space-y-6 flex flex-col items-center">
              {/* Mounted Video Player */}
              {selectedEpisode && (
                <div ref={playerRef} className="w-full">
                  <EpisodePlayer
                    anilistId={anime.id}
                    malId={anime.idMal || zenshinData?.mappings?.mal_id}
                    episodeNumber={selectedEpisode}
                    episodeTitle={
                      zenshinData?.episodes?.[selectedEpisode]?.title?.en ||
                      zenshinData?.episodes?.[selectedEpisode]?.nameTvdb ||
                      `Episode ${selectedEpisode}`
                    }
                    hasPrev={allEpisodeKeys.indexOf(selectedEpisode) > 0}
                    hasNext={allEpisodeKeys.indexOf(selectedEpisode) < allEpisodeKeys.length - 1}
                    onPrev={() => handlePrevEpisode(allEpisodeKeys)}
                    onNext={() => handleNextEpisode(allEpisodeKeys)}
                  />
                </div>
              )}

              {/* Title Section */}
              <div className="w-full text-left self-start mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-md sm:text-lg font-serif italic text-white flex items-center space-x-2">
                    <LayoutGrid size={16} className="text-violet-400" />
                    <span>Select Episode</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {loadingMapping
                      ? 'Looking up episode translations and screens...'
                      : zenshinData
                      ? `Successfully mapped ${Object.keys(zenshinData.episodes || {}).length} episodes via Zenshin DB`
                      : 'Zenshin DB mappings offline - loaded fallback series links'}
                  </p>
                </div>

                {loadingMapping && (
                  <span className="flex items-center space-x-1 bg-white/5 px-2.5 py-1 rounded text-xxs text-gray-500 italic border border-white/5">
                    <RefreshCw size={10} className="animate-spin text-violet-400" />
                    <span>Syncing database...</span>
                  </span>
                )}
              </div>

              {/* Grid of Regular Episodes */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularEpisodes.map(({ key, ep }) => {
                  const isActive = selectedEpisode === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectEpisode(key)}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer select-none border transition-all ${
                        isActive
                          ? 'bg-black border-violet-500/50 shadow-2xl shadow-violet-500/5'
                          : 'bg-[#080808]/60 border-white/5 hover:border-white/10 hover:bg-[#080808]'
                      }`}
                    >
                      {/* Episode Thumbnail */}
                      <div className="relative aspect-video w-full bg-[#050505] overflow-hidden">
                        <EpisodeThumbnail
                          imageSrc={ep.image}
                          fallbackBanner={anime.bannerImage}
                          fallbackCover={anime.coverImage.extraLarge || anime.coverImage.large}
                          episodeNumber={key}
                        />

                        {/* Top corner indicator badge */}
                        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-black/90 backdrop-blur-md text-xs font-bold text-[#E0E0E0] border border-white/5">
                          EP {key}
                        </div>

                        {/* Floating Play Overlay */}
                        <div className="absolute inset-0 bg-violet-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <span className="bg-white text-black font-bold px-3.5 py-1.5 rounded-full text-xxs uppercase tracking-wider shadow">
                            Play Ep
                          </span>
                        </div>
                      </div>

                      {/* Content detailed rows */}
                      <div className="p-3 text-left flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h4
                            className={`text-xs sm:text-sm font-bold line-clamp-1 group-hover:text-violet-400 transition-colors ${
                              isActive ? 'text-violet-400' : 'text-[#E0E0E0]'
                            }`}
                          >
                            {ep.title?.en || ep.nameTvdb || `Episode ${key}`}
                          </h4>
                          {ep.overview && (
                            <p className="text-[11px] leading-relaxed text-gray-500 line-clamp-2 md:line-clamp-3">
                              {ep.overview}
                            </p>
                          )}
                        </div>

                        {/* Extra metadata footer */}
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium pt-2 mt-2 border-t border-white/5">
                          <span>{ep.length || ep.runtime ? `${ep.length || ep.runtime + 'm'}` : '24m'}</span>
                          <span>{ep.airdate || ep.airDate || 'Aired'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid of Special Episodes */}
              {specialEpisodes.length > 0 && (
                <div className="w-full text-left pt-6 border-t border-white/5">
                  <h4 className="text-sm sm:text-md font-serif italic text-white flex items-center space-x-1.5 mb-4">
                    <Sparkles size={14} className="text-violet-400" />
                    <span>Specials & Extras</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {specialEpisodes.map(({ key, ep }) => {
                      const isActive = selectedEpisode === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectEpisode(key)}
                          className={`text-left py-2.5 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all truncate flex flex-col space-y-1 ${
                            isActive
                              ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                              : 'bg-[#080808] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                          }`}
                        >
                          <span className="font-bold text-[10px] text-violet-400/80">{key}</span>
                          <span className="truncate">{ep.title?.en || `Special ${key}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Detailed Anime statistics info view */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left font-sans">
              {/* Left Column: Description */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-md sm:text-lg font-serif italic text-white">
                  Synopsis
                </h3>
                <p className="text-sm leading-relaxed text-gray-400 font-light whitespace-pre-line bg-white/5 border border-white/5 p-5 sm:p-6 rounded-2xl">
                  {stripHtml(anime.description) || 'No core synopsis registered.'}
                </p>
              </div>

              {/* Right Column: Statistics lists */}
              <div className="space-y-5 bg-[#080808] border border-white/5 p-5 sm:p-6 rounded-2xl">
                <h3 className="text-sm font-serif italic text-violet-400 border-b border-white/5 pb-2">
                  Statistics Mapping
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  {anime.studios?.nodes && anime.studios.nodes.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">Studio</span>
                      <span className="text-gray-300 font-semibold">{anime.studios.nodes[0].name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-gray-300 font-semibold uppercase">{anime.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Release Format</span>
                    <span className="text-gray-300 font-semibold">{zenshinData?.mappings?.type || 'TV Series'}</span>
                  </div>
                  {anime.episodes && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Licensed Episodes</span>
                      <span className="text-gray-300 font-semibold">{anime.episodes}</span>
                    </div>
                  )}
                  {zenshinData?.mappings?.mal_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">MAL ID</span>
                      <span className="text-gray-300 font-mono text-[11px]">{zenshinData.mappings.mal_id}</span>
                    </div>
                  )}
                  {zenshinData?.mappings?.anidb_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">AniDB ID</span>
                      <span className="text-gray-300 font-mono text-[11px]">{zenshinData.mappings.anidb_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">AniList ID</span>
                    <span className="text-gray-300 font-mono text-[11px]">{anime.id}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="pt-3 border-t border-white/5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {anime.genres.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded bg-[#050505] border border-white/5 text-xxs text-violet-400 font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
