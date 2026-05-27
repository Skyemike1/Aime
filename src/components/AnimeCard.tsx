import { motion } from 'motion/react';
import { Star, PlayCircle } from 'lucide-react';
import { AniListMedia } from '../types';

interface AnimeCardProps {
  anime: AniListMedia;
  onClick: () => void;
  key?: any;
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const displayTitle = anime.title.english || anime.title.romaji || anime.title.userPreferred;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#1A1A1C]/60 border border-white/5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/5 transition-all cursor-pointer select-none"
      onClick={onClick}
    >
      {/* Cover Image Wrapper */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#050505]">
        <img
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 duration-500 ease-out brightness-100 group-hover:brightness-90 transition-all"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Hover absolute play icon button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-15">
          <PlayCircle size={44} className="text-violet-400 drop-shadow-lg" />
        </div>

        {/* Score Pill Overlay */}
        {anime.averageScore && (
          <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 bg-black/85 backdrop-blur-md text-amber-400 font-bold px-1.5 py-0.5 rounded-md text-[10px] sm:text-xxs border border-white/5">
            <Star size={10} className="fill-amber-400 stroke-amber-400" />
            <span>{(anime.averageScore / 10).toFixed(1)}</span>
          </div>
        )}

        {/* Format Pill Overlay */}
        <div className="absolute top-2 right-2 z-10 bg-[#080808]/90 backdrop-blur-md text-gray-350 font-semibold px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] tracking-wide border border-white/5">
          {anime.seasonYear ? `${anime.seasonYear} | ` : ''}
          {anime.status === 'RELEASING' ? 'ONGOING' : anime.status}
        </div>
      </div>

      {/* Info Content Section */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <h3 className="text-xs sm:text-sm font-semibold text-[#E0E0E0] group-hover:text-violet-400 transition-colors line-clamp-2 leading-tight">
          {displayTitle}
        </h3>

        {/* Categories / Genre snippet */}
        <div className="flex flex-wrap gap-1 overflow-hidden h-[18px]">
          {anime.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] bg-[#050505] text-gray-450 border border-white/5 truncate font-medium max-w-[80px]"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
