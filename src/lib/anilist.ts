import { AniListMedia, SearchFilters } from '../types';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

const MEDIA_QUERY_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
    userPreferred
  }
  bannerImage
  coverImage {
    extraLarge
    large
    medium
    color
  }
  description
  season
  seasonYear
  trending
  popularity
  averageScore
  episodes
  status
  genres
  studios(isMain: true) {
    nodes {
      name
    }
  }
`;

export async function fetchFromAniList<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  try {
    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AniList GraphQL Error: ${response.status} - ${errorText}`);
    }

    const { data, errors } = await response.json();
    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }

    return data as T;
  } catch (err) {
    console.error('Failed to fetch from AniList:', err);
    throw err;
  }
}

export async function getHomeAnimeCollections() {
  const query = `
    query {
      trending: Page(page: 1, perPage: 8) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
      popular: Page(page: 1, perPage: 12) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
      topRated: Page(page: 1, perPage: 12) {
        media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;

  interface CollectionResponse {
    trending: { media: AniListMedia[] };
    popular: { media: AniListMedia[] };
    topRated: { media: AniListMedia[] };
  }

  const data = await fetchFromAniList<CollectionResponse>(query);
  return {
    trending: data.trending.media,
    popular: data.popular.media,
    topRated: data.topRated.media,
  };
}

export async function searchAnime(filters: SearchFilters) {
  const query = `
    query ($page: Int, $search: String, $genre: String, $season: Season, $seasonYear: Int, $format: MediaFormat, $sort: [MediaSort]) {
      Page(page: $page, perPage: 24) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(
          search: $search,
          genre: $genre,
          season: $season,
          seasonYear: $seasonYear,
          format: $format,
          sort: $sort,
          type: ANIME,
          isAdult: false
        ) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;

  const variables: Record<string, any> = {
    page: filters.page,
    search: filters.search || undefined,
    genre: filters.genre || undefined,
    season: filters.season || undefined,
    seasonYear: filters.seasonYear || undefined,
    format: filters.format || undefined,
    sort: filters.sort ? [filters.sort] : ['TRENDING_DESC'],
  };

  interface SearchResponse {
    Page: {
      pageInfo: {
        total: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
        perPage: number;
      };
      media: AniListMedia[];
    };
  }

  const data = await fetchFromAniList<SearchResponse>(query, variables);
  return data.Page;
}

export const ANIME_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Ecchi',
  'Fantasy',
  'Hentai',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];
