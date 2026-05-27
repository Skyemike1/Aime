import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SearchFilters } from '../types';
import { ANIME_GENRES } from '../lib/anilist';

interface ExploreBarProps {
  filters: SearchFilters;
  onFilterChange: (updater: (prev: SearchFilters) => SearchFilters) => void;
  onTriggerSearch: () => void;
}

export default function ExploreBar({ filters, onFilterChange, onTriggerSearch }: ExploreBarProps) {
  const years = Array.from({ length: 33 }, (_, i) => 2027 - i); // From 2027 down to 1995

  const updateField = <K extends keyof SearchFilters>(field: K, value: SearchFilters[K]) => {
    onFilterChange((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset page on filter changes
    }));
  };

  const handleClearFilters = () => {
    onFilterChange(() => ({
      search: '',
      genre: null,
      season: null,
      seasonYear: null,
      format: null,
      sort: 'TRENDING_DESC',
      page: 1,
    }));
  };

  const activeFiltersCount = [
    filters.genre,
    filters.season,
    filters.seasonYear,
    filters.format,
    filters.sort !== 'TRENDING_DESC' ? filters.sort : null,
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-white/5 border border-white/5 rounded-3xl p-4 md:p-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Main Search Input */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateField('search', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onTriggerSearch();
            }}
            placeholder="Search anime by title, synonyms or keywords..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#080808] border border-white/5 text-[#E0E0E0] placeholder-gray-550 focus:outline-none focus:border-violet-500/50 text-sm transition-colors"
          />
          {filters.search && (
            <button
               onClick={() => updateField('search', '')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onTriggerSearch}
            className="flex-1 lg:flex-none bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/10 cursor-pointer"
          >
            Search
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center space-x-1 border border-white/10 hover:border-white/20 bg-white/5 text-gray-400 hover:text-white px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-white/5">
        {/* Genres */}
        <div className="flex flex-col space-y-1">
          <label className="text-xxs font-semibold text-gray-500 tracking-wider uppercase flex items-center space-x-1">
            <SlidersHorizontal size={10} />
            <span>Genre</span>
          </label>
          <select
            value={filters.genre || ''}
            onChange={(e) => updateField('genre', e.target.value ? e.target.value : null)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#080808] border border-white/5 text-gray-300 text-xs focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="">All Genres</option>
            {ANIME_GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex flex-col space-y-1">
          <label className="text-xxs font-semibold text-gray-500 tracking-wider uppercase">
            Season
          </label>
          <select
            value={filters.season || ''}
            onChange={(e) => updateField('season', e.target.value ? (e.target.value as any) : null)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#080808] border border-white/5 text-gray-300 text-xs focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="">All Seasons</option>
            <option value="WINTER">Winter</option>
            <option value="SPRING">Spring</option>
            <option value="SUMMER">Summer</option>
            <option value="FALL">Fall</option>
          </select>
        </div>

        {/* Year */}
        <div className="flex flex-col space-y-1">
          <label className="text-xxs font-semibold text-gray-500 tracking-wider uppercase">
            Year
          </label>
          <select
            value={filters.seasonYear || ''}
            onChange={(e) => updateField('seasonYear', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#080808] border border-white/5 text-gray-300 text-xs focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div className="flex flex-col space-y-1">
          <label className="text-xxs font-semibold text-gray-500 tracking-wider uppercase">
            Format
          </label>
          <select
            value={filters.format || ''}
            onChange={(e) => updateField('format', e.target.value ? (e.target.value as any) : null)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#080808] border border-white/5 text-gray-300 text-xs focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="">All Formats</option>
            <option value="TV">TV Series</option>
            <option value="MOVIE">Movie</option>
            <option value="OVA">OVA</option>
            <option value="ONA">ONA</option>
            <option value="SPECIAL">Special</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-col space-y-1 col-span-2 md:col-span-1">
          <label className="text-xxs font-semibold text-gray-500 tracking-wider uppercase flex items-center space-x-1">
            <ArrowUpDown size={10} />
            <span>Sort By</span>
          </label>
          <select
            value={filters.sort || ''}
            onChange={(e) => updateField('sort', e.target.value ? (e.target.value as any) : null)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#080808] border border-white/5 text-gray-300 text-xs focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="TRENDING_DESC">Trending</option>
            <option value="POPULARITY_DESC">Most Popular</option>
            <option value="SCORE_DESC">Top Rated</option>
            <option value="UPDATED_AT_DESC">Recently Updated</option>
          </select>
        </div>
      </div>
    </div>
  );
}
