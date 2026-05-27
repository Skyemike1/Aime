import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Library, Film, Milestone, HelpCircle, Flame, Compass, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { AniListMedia, SearchFilters } from './types';
import { getHomeAnimeCollections, searchAnime } from './lib/anilist';
import HomeHero from './components/HomeHero';
import ExploreBar from './components/ExploreBar';
import AnimeCard from './components/AnimeCard';
import AnimeDetail from './components/AnimeDetail';

export default function App() {
  const [collections, setCollections] = useState<{
    trending: AniListMedia[];
    popular: AniListMedia[];
    topRated: AniListMedia[];
  } | null>(null);

  const [searchResults, setSearchResults] = useState<AniListMedia[] | null>(null);
  const [pageInfo, setPageInfo] = useState<{
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  } | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    genre: null,
    season: null,
    seasonYear: null,
    format: null,
    sort: 'TRENDING_DESC',
    page: 1,
  });

  const [activeAnime, setActiveAnime] = useState<AniListMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load home data on startup
  useEffect(() => {
    async function loadHome() {
      try {
        setLoading(true);
        setError(null);
        await new Promise((resolve) => setTimeout(resolve, 300)); // smooth experience
        const data = await getHomeAnimeCollections();
        setCollections(data);
      } catch (err) {
        console.error('Failed to load collections:', err);
        setError('Failed to connect to AniList services. Please check your browser connection.');
      } finally {
        setLoading(false);
      }
    }
    loadHome();
  }, []);

  // Fetch search results
  const triggerSearch = async (targetFilters: SearchFilters) => {
    try {
      setSearching(true);
      setError(null);
      const data = await searchAnime(targetFilters);
      setSearchResults(data.media);
      setPageInfo(data.pageInfo);
    } catch (err) {
      console.error('Search failure:', err);
      setError('Search could not be processed. Please check query details.');
    } finally {
      setSearching(false);
    }
  };

  // Trigger search when page number updates
  useEffect(() => {
    const hasActiveFilters =
      filters.search.trim() !== '' ||
      filters.genre !== null ||
      filters.season !== null ||
      filters.seasonYear !== null ||
      filters.format !== null ||
      filters.sort !== 'TRENDING_DESC';

    if (hasActiveFilters || filters.page > 1) {
      triggerSearch(filters);
    } else {
      setSearchResults(null);
      setPageInfo(null);
    }
  }, [filters.page]);

  const handleApplySearch = () => {
    // Re-trigger search at page 1 when user clicks "Search"
    if (filters.page === 1) {
      triggerSearch(filters);
    } else {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pageInfo && newPage >= 1 && newPage <= pageInfo.lastPage) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  const isBrowsingSearch = searchResults !== null;

  return (
    <div className="min-h-screen text-[#E0E0E0] bg-[#050505] font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Top Header Navigation bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-550/10">
              <Film size={22} className="text-white stroke-[2.5]" />
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-serif italic text-white tracking-tighter leading-none">
                Zenshin Stream
              </h1>
              <p className="text-[9px] sm:text-xxs font-semibold text-gray-500 uppercase tracking-[0.2em] mt-1 leading-none">
                Mapped Episode Streamer
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xxs font-semibold bg-white/5 border border-white/5 text-gray-400 py-1.5 px-3 rounded-lg flex items-center space-x-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
              </span>
              <span>Zenshin DB Synced</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* Error Callout */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center space-x-3 text-sm">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Hero Banner: Rendered only when not viewing search results */}
        {!isBrowsingSearch && collections && !loading && (
          <HomeHero trending={collections.trending} onSelectAnime={setActiveAnime} />
        )}

        {/* Explore and search filters block */}
        <section className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-lg sm:text-2xl font-serif italic text-white flex items-center space-x-2">
              <Compass size={22} className="text-violet-400" />
              <span>Explore Content Catalog</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Filter mappings database from AniDB, MAL, and TheTVDB by tags or format types
            </p>
          </div>

          <ExploreBar
            filters={filters}
            onFilterChange={setFilters}
            onTriggerSearch={handleApplySearch}
          />
        </section>

        {/* Dynamic Display Grid */}
        <section className="space-y-8 min-h-[400px]">
          {loading || searching ? (
            /* Immersive Loading skeleton */
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <RefreshCw size={44} className="text-violet-400 animate-spin stroke-[1.5]" />
              <p className="text-sm text-gray-500 font-medium animate-pulse">
                Querying database servers...
              </p>
            </div>
          ) : isBrowsingSearch ? (
            /* Custom Search Results view */
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-md sm:text-lg font-serif italic text-white flex items-center space-x-2">
                  <Library size={18} className="text-violet-400" />
                  <span>Search Catalog Mappings ({searchResults.length} matches)</span>
                </h3>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2">
                  <Library size={44} className="text-gray-600" />
                  <h4 className="text-md font-serif italic text-gray-300">No Mapped Matches Found</h4>
                  <p className="text-xs text-gray-500 max-w-sm">
                    We couldn't locate any synced entries matching details. Try adjusting filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {searchResults.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onClick={() => setActiveAnime(anime)}
                    />
                  ))}
                </div>
              )}

              {/* Advanced Pagination UI */}
              {pageInfo && pageInfo.lastPage > 1 && (
                <div className="pt-8 border-t border-white/5 flex justify-center items-center space-x-3 text-sm">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-gray-400 font-semibold text-xs">
                    Page {filters.page} of {pageInfo.lastPage}
                  </span>

                  <button
                    disabled={!pageInfo.hasNextPage}
                    onClick={() => handlePageChange(filters.page + 1)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : collections ? (
            /* Pristine Standard Home Sections */
            <div className="space-y-12 text-left">
              {/* Trending Row */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Flame size={20} className="text-violet-400 fill-violet-500/10" />
                  <h3 className="text-md sm:text-lg font-serif italic text-white">
                    Currently Trending
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {collections.trending.slice(0, 6).map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onClick={() => setActiveAnime(anime)}
                    />
                  ))}
                </div>
              </div>

              {/* Popular Row */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Sparkles size={18} className="text-violet-400" />
                  <h3 className="text-md sm:text-lg font-serif italic text-white">
                    All-Time Popular Shows
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {collections.popular.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onClick={() => setActiveAnime(anime)}
                    />
                  ))}
                </div>
              </div>

              {/* Top Rated Row */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Compass size={18} className="text-violet-400" />
                  <h3 className="text-md sm:text-lg font-serif italic text-white">
                    Critically Acclaimed
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {collections.topRated.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onClick={() => setActiveAnime(anime)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-sm">Failed to connect to databases.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer Branding section */}
      <footer className="w-full bg-[#050505] border-t border-white/5 mt-20 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-sans">
          <div className="text-left space-y-1.5 max-w-sm">
            <h4 className="font-serif italic text-white text-md">Zenshin</h4>
            <p className="leading-relaxed font-light text-gray-400">
              We leverage user-curated mappings to cross-reference MyAnimeList (MAL), AniDB, and TheTVDB schemas dynamically. 
            </p>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-gray-500">Content metadata powered by public GraphQL registries.</p>
            <p className="font-semibold text-gray-400">Zenshin-API Integration Project &copy; 2026</p>
          </div>
        </div>
      </footer>

      {/* Floating Detail Overlay dialog */}
      <AnimatePresence>
        {activeAnime && (
          <AnimeDetail
            anime={activeAnime}
            onClose={() => setActiveAnime(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
