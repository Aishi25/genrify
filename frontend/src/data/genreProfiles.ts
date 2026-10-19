import type { FeatureValues, Genre } from "../domain";

/**
 * Reference means from downloads/spotify_dataset.csv.
 * Cleaning mirrors the supplied notebook: deduplicate track_id, then
 * (track_name, artists, album_name), filter the five workshop genres, and mean
 * the five displayed features. The source CSV and notebook remain untouched.
 */
export const GENRE_PROFILES: Readonly<Record<Genre, FeatureValues>> = {
  acoustic: {
    danceability: 0.5492,
    energy: 0.4346,
    acousticness: 0.5679,
    valence: 0.4239,
    tempo: 119.0479,
  },
  edm: {
    danceability: 0.6556,
    energy: 0.7514,
    acousticness: 0.1243,
    valence: 0.4629,
    tempo: 121.6843,
  },
  "hip-hop": {
    danceability: 0.7303,
    energy: 0.6951,
    acousticness: 0.1986,
    valence: 0.5536,
    tempo: 118.4366,
  },
  pop: {
    danceability: 0.5815,
    energy: 0.5812,
    acousticness: 0.4003,
    valence: 0.4788,
    tempo: 121.6421,
  },
  rock: {
    danceability: 0.5496,
    energy: 0.6473,
    acousticness: 0.2281,
    valence: 0.4788,
    tempo: 121.2961,
  },
};

export function getGenreProfile(genre: Genre): FeatureValues {
  return GENRE_PROFILES[genre];
}
