// The app compares predictions across these five supported music genres.
export const GENRES = ["acoustic", "edm", "hip-hop", "pop", "rock"] as const;

// TypeScript uses this type to catch genre names that are not in the list above.
export type Genre = (typeof GENRES)[number];

// This list keeps all fifteen API input fields in a consistent order.
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

// The radar displays only these five fields and keeps this same order for both shapes.
export const RADAR_FEATURE_KEYS = [
  "danceability",
  "energy",
  "acousticness",
  "valence",
  "tempo",
] as const;

export type RadarFeatureKey = (typeof RADAR_FEATURE_KEYS)[number];

// These are the numeric and true-or-false values sent to the Python API.
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

// Form fields keep numbers as text while users edit them; the checkbox stays true or false.
export type TrackFeatureDraft = Record<NumericFeatureKey, string> & {
  explicit: boolean;
};

// Pick just the five chart fields from the complete set of track features.
export type FeatureValues = Pick<TrackFeatures, RadarFeatureKey>;
export type FieldErrors = Partial<Record<ModelFeatureKey, string>>;
export type PredictionSource = "mock" | "model";
export type GenreProbabilities = Record<Genre, number>;

// A successful API response includes a winner, its confidence, all scores, and their source.
export interface GenrePrediction {
  genre: Genre;
  confidence: number;
  probabilities: GenreProbabilities;
  source: PredictionSource;
}

// The app calls this shared predict method to request a result from the backend.
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

// Each entry supplies one slider's label, limits, step size, and explanation.
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

// Load these initial values so every required input is present when the page first opens.
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

// Turn the stored genre key into a readable label for the interface.
export function genreLabel(genre: Genre): string {
  if (genre === "edm") return "EDM";
  if (genre === "hip-hop") return "Hip-hop";
  return genre[0].toUpperCase() + genre.slice(1);
}
