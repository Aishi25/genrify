export const GENRES = ["acoustic", "edm", "hip-hop", "pop", "rock"] as const;

export type Genre = (typeof GENRES)[number];

export const MODEL_FEATURE_ORDER = [
  "danceability",
  "energy",
  "key",
  "loudness",
  "mode",
  "speechiness",
  "acousticness",
  "instrumentalness",
  "liveness",
  "valence",
  "tempo",
  "time_signature",
  "duration_ms",
  "popularity",
  "explicit",
] as const;

export type ModelFeatureKey = (typeof MODEL_FEATURE_ORDER)[number];
export type NumericFeatureKey = Exclude<ModelFeatureKey, "explicit">;

export const RADAR_FEATURE_KEYS = [
  "danceability",
  "energy",
  "acousticness",
  "valence",
  "tempo",
] as const;

export type RadarFeatureKey = (typeof RADAR_FEATURE_KEYS)[number];

export interface TrackFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  time_signature: number;
  duration_ms: number;
  popularity: number;
  explicit: boolean;
}

export type TrackFeatureDraft = Record<NumericFeatureKey, string> & {
  explicit: boolean;
};

export type FeatureValues = Pick<TrackFeatures, RadarFeatureKey>;
export type FieldErrors = Partial<Record<ModelFeatureKey, string>>;
export type PredictionSource = "mock" | "model";
export type GenreProbabilities = Record<Genre, number>;

export interface GenrePrediction {
  genre: Genre;
  confidence: number;
  probabilities: GenreProbabilities;
  source: PredictionSource;
}

export interface PredictionClient {
  predict(features: TrackFeatures, signal?: AbortSignal): Promise<GenrePrediction>;
}

export interface RadarFeatureDefinition {
  key: RadarFeatureKey;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

export const RADAR_FEATURE_DEFINITIONS: readonly RadarFeatureDefinition[] = [
  {
    key: "danceability",
    label: "Danceability",
    shortLabel: "Dance",
    min: 0,
    max: 1,
    step: 0.01,
    description: "How suitable the track feels for dancing.",
  },
  {
    key: "energy",
    label: "Energy",
    shortLabel: "Energy",
    min: 0,
    max: 1,
    step: 0.01,
    description: "The perceived intensity and activity.",
  },
  {
    key: "acousticness",
    label: "Acousticness",
    shortLabel: "Acoustic",
    min: 0,
    max: 1,
    step: 0.01,
    description: "Confidence that the track is acoustic.",
  },
  {
    key: "valence",
    label: "Valence",
    shortLabel: "Valence",
    min: 0,
    max: 1,
    step: 0.01,
    description: "The musical positivity conveyed by the track.",
  },
  {
    key: "tempo",
    label: "Tempo",
    shortLabel: "Tempo",
    min: 0,
    max: 250,
    step: 1,
    description: "The estimated speed in beats per minute.",
  },
] as const;

export const STARTER_TRACK: TrackFeatures = {
  danceability: 0.68,
  energy: 0.46,
  key: 1,
  loudness: -6.7,
  mode: 0,
  speechiness: 0.14,
  acousticness: 0.03,
  instrumentalness: 0,
  liveness: 0.36,
  valence: 0.72,
  tempo: 88,
  time_signature: 4,
  duration_ms: 231000,
  popularity: 73,
  explicit: false,
};

export function genreLabel(genre: Genre): string {
  if (genre === "edm") return "EDM";
  if (genre === "hip-hop") return "Hip-hop";
  return genre[0].toUpperCase() + genre.slice(1);
}
