import {
  MODEL_FEATURE_ORDER,
  RADAR_FEATURE_KEYS,
  type FeatureValues,
  type FieldErrors,
  type ModelFeatureKey,
  type NumericFeatureKey,
  type TrackFeatureDraft,
  type TrackFeatures,
} from "../domain";

interface NumberRule {
  min: number;
  max: number;
  integer?: boolean;
}

// These bounds match the allowed API inputs and help catch mistakes before sending a request.
export const FEATURE_RULES: Readonly<Record<NumericFeatureKey, NumberRule>> = {
  danceability: { min: 0, max: 1 },
  energy: { min: 0, max: 1 },
  key: { min: -1, max: 11, integer: true },
  loudness: { min: -60, max: 5 },
  mode: { min: 0, max: 1, integer: true },
  speechiness: { min: 0, max: 1 },
  acousticness: { min: 0, max: 1 },
  instrumentalness: { min: 0, max: 1 },
  liveness: { min: 0, max: 1 },
  valence: { min: 0, max: 1 },
  tempo: { min: 0, max: 250 },
  time_signature: { min: 0, max: 7, integer: true },
  duration_ms: { min: 1, max: 6_000_000, integer: true },
  popularity: { min: 0, max: 100, integer: true },
};

// Turn saved numbers into editable form text while keeping the checkbox value unchanged.
export function createTrackFeatureDraft(features: TrackFeatures): TrackFeatureDraft {
  const draft = {} as TrackFeatureDraft;
  for (const key of MODEL_FEATURE_ORDER) {
    if (key === "explicit") draft.explicit = features.explicit;
    else draft[key] = String(features[key]);
  }
  return draft;
}

export interface ParsedTrackFeatures {
  features: TrackFeatures | null;
  errors: FieldErrors;
}

// Convert form text back to numbers and collect a message for each invalid field.
export function parseTrackFeatureDraft(draft: TrackFeatureDraft): ParsedTrackFeatures {
  const errors: FieldErrors = {};
  const parsed = { explicit: draft.explicit } as TrackFeatures;

  for (const key of MODEL_FEATURE_ORDER) {
    if (key === "explicit") continue;
    const raw = draft[key].trim();
    const rule = FEATURE_RULES[key];
    // An empty box counts as missing input rather than silently becoming zero.
    const value = raw === "" ? Number.NaN : Number(raw);

    if (!Number.isFinite(value)) errors[key] = "Enter a number.";
    else if (value < rule.min || value > rule.max) {
      errors[key] = `Use a value from ${rule.min} to ${rule.max}.`;
    } else if (rule.integer && !Number.isInteger(value)) errors[key] = "Use a whole number.";
    else parsed[key] = value;
  }

  // Only return a complete API payload when every required field passes validation.
  return Object.keys(errors).length > 0
    ? { features: null, errors }
    : { features: parsed, errors };
}

// Copy only the five displayed features without changing the full API input object.
export function pickRadarFeatures(features: TrackFeatures): FeatureValues {
  return Object.fromEntries(
    RADAR_FEATURE_KEYS.map((key) => [key, features[key]]),
  ) as FeatureValues;
}

// Convert milliseconds into a minutes:seconds label for the duration control.
export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 1) return "Invalid duration";
  const totalSeconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Check that a field name from an API error belongs to one of our known inputs.
export function isModelFeatureKey(value: unknown): value is ModelFeatureKey {
  return typeof value === "string" && (MODEL_FEATURE_ORDER as readonly string[]).includes(value);
}
