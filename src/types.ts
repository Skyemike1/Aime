export interface AniListMedia {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english: string;
    native: string;
    userPreferred: string;
  };
  bannerImage: string | null;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  description: string | null;
  season: string | null;
  seasonYear: number | null;
  trending: number;
  popularity: number;
  averageScore: number | null;
  episodes: number | null;
  status: string;
  genres: string[];
  studios?: {
    nodes: Array<{ name: string }>;
  };
}

export interface ZenshinEpisode {
  episode?: string;
  anidbEid?: string;
  type?: string;
  length?: string;
  airdate?: string;
  title?: {
    en?: string;
    ja?: string;
    [key: string]: string | undefined;
  };
  nameTvdb?: string | null;
  tvdbShowId?: number;
  tvdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  absoluteEpisodeNumber?: number;
  runtime?: number;
  overview?: string | null;
  image?: string | null;
  airDate?: string;
}

export interface ZenshinMappingResponse {
  mainTitle?: string;
  title?: {
    main?: string;
    english?: string;
    en?: string;
    ja?: string;
    [key: string]: string | undefined;
  };
  date?: {
    startDate?: string;
    endDate?: string | null;
  };
  episodes?: Record<string, ZenshinEpisode>;
  mappings?: {
    livechart_id?: number;
    thetvdb_id?: number;
    anime_planet_id?: string;
    imdb_id?: string;
    anisearch_id?: number;
    themoviedb_id?: number;
    anidb_id?: number;
    kitsu_id?: number;
    mal_id?: number;
    type?: string;
    notify_moe_id?: string;
    anilist_id?: number;
  };
}

export interface SearchFilters {
  search: string;
  genre: string | null;
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear: number | null;
  format: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | null;
  sort: 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'UPDATED_AT_DESC' | null;
  page: number;
}
