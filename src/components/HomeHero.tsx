import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Play, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { AniListMedia } from '../types';

interface HomeHeroProps {
  trending: AniListMedia[];
  onSelectAnime: (anime: AniListMedia) => void;
}

export default function HomeHero({ trending, onSelectAnime }: HomeHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trending]);

  if (trending.length === 0) return null;

  const currentAnime = trending[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + Math.min(trending.length, 5)) % Math.min(trending.length, 5));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
  };

  const stripHtml = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="relative w-full h-[400px] md:h-[550px] overflow-hidden rounded-3xl bg-[#050505] border border-white/5 shadow-2xl transition-all">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={() => onSelectAnime(currentAnime)}
        >
          {/* Banner Image with gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent z-10" />
          
          <img
            src={currentAnime.bannerImage || currentAnime.coverImage.extraLarge}
            alt={currentAnime.title.english || currentAnime.title.romaji}
            className="w-full h-full object-cover object-center scale-102 filter brightness-[0.7] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />

          {/* Text Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12 max-w-3xl flex flex-col items-start space-y-3 md:space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30 backdrop-blur-md flex items-center space-x-1"
            >
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span>Trending Now</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-5xl font-serif italic text-white tracking-tighter drop-shadow-md text-left leading-tight"
            >
              {currentAnime.title.english || currentAnime.title.romaji}
            </motion.h1>

            {/* Tags/Meta badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-300 font-medium"
            >
              {currentAnime.averageScore && (
                <div className="flex items-center text-amber-400 space-x-1 bg-white/5 px-2 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                  <Star size={14} className="fill-amber-400" />
                  <span>{(currentAnime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              {currentAnime.seasonYear && (
                <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{currentAnime.seasonYear}</span>
                </div>
              )}
              <div className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                {currentAnime.status}
              </div>
              <div className="hidden md:flex items-center space-x-2">
                {currentAnime.genres.slice(0, 3).map((genre) => (
                  <span key={genre} className="bg-white/5 px-2 py-1 rounded-md text-xs text-gray-400 border border-white/5">
                    {genre}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-xs md:text-sm text-gray-400 text-left line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed font-normal"
            >
              {stripHtml(currentAnime.description)}
            </motion.p>

            {/* CTA Option */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center space-x-2 bg-white hover:bg-violet-400 text-black font-bold px-8 py-3 rounded-full transition-colors text-sm mt-2 cursor-pointer shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAnime(currentAnime);
              }}
            >
              <Play size={16} fill="currentColor" />
              <span>Watch Now</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bars Indicators */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center space-x-2">
        {trending.slice(0, 5).map((anime, idx) => (
          <button
            key={anime.id}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-violet-400' : 'w-2 bg-white/10 hover:bg-white/20'
            }`}
            title={anime.title.english || anime.title.romaji}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
        <button
          onClick={handlePrev}
          className="p-2 md:p-3 rounded-full bg-black/60 text-gray-300 border border-white/5 hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-md cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20">
        <button
          onClick={handleNext}
          className="p-2 md:p-3 rounded-full bg-black/60 text-gray-300 border border-white/5 hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-md cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
