import {
  GENRES,
  MODEL_FEATURE_ORDER,
  type FieldErrors,
  type Genre,
  type GenrePrediction,
  type PredictionClient,
  type PredictionSource,
  type TrackFeatures,
} from "../domain";
import { isModelFeatureKey } from "../lib/trackFeatures";

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type PredictionErrorCode =
  | "validation"
  | "timeout"
  | "network"
  | "response"
  | "server";

export class PredictionServiceError extends Error {
  constructor(
    public readonly code: PredictionErrorCode,
    message: string,
    public readonly fieldErrors: FieldErrors = {},
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "PredictionServiceError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGenre(value: unknown): value is Genre {
  return typeof value === "string" && (GENRES as readonly string[]).includes(value);
}

function isSource(value: unknown): value is PredictionSource {
  return value === "mock" || value === "model";
}

function isProbability(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function parseGenrePrediction(value: unknown): GenrePrediction | null {
  if (!isRecord(value) || !isGenre(value.genre) || !isProbability(value.confidence)) return null;
  if (!isSource(value.source) || !isRecord(value.probabilities)) return null;
  const rawProbabilities = value.probabilities;

  const probabilityKeys = Object.keys(rawProbabilities);
  if (
    probabilityKeys.length !== GENRES.length ||
    !GENRES.every((genre) => isProbability(rawProbabilities[genre]))
  ) {
    return null;
  }

  const probabilities = rawProbabilities as Record<Genre, number>;
  const total = GENRES.reduce((sum, genre) => sum + probabilities[genre], 0);
  const maximum = Math.max(...GENRES.map((genre) => probabilities[genre]));

  if (Math.abs(total - 1) > 0.001) return null;
  if (Math.abs(value.confidence - probabilities[value.genre]) > 0.000001) return null;
  if (Math.abs(probabilities[value.genre] - maximum) > 0.000001) return null;

  return {
    genre: value.genre,
    confidence: value.confidence,
    probabilities: { ...probabilities },
    source: value.source,
  };
}

export function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === "AbortError";
}

function parseValidationErrors(payload: unknown): FieldErrors {
  if (!isRecord(payload) || !Array.isArray(payload.detail)) return {};

  const errors: FieldErrors = {};
  for (const detail of payload.detail) {
    if (!isRecord(detail) || !Array.isArray(detail.loc) || typeof detail.msg !== "string") continue;
    const field = detail.loc.at(-1);
    if (isModelFeatureKey(field)) errors[field] = detail.msg;
  }
  return errors;
}

function createHttpError(status: number, payload: unknown): PredictionServiceError {
  if (status === 422) {
    return new PredictionServiceError(
      "validation",
      "The backend rejected one or more inputs. Check the highlighted fields.",
      parseValidationErrors(payload),
    );
  }
  if (status >= 500) {
    return new PredictionServiceError(
      "server",
      "The classifier is unavailable right now. Try again shortly.",
    );
  }
  return new PredictionServiceError(
    "response",
    `The prediction request was rejected with status ${status}.`,
  );
}

export function serializeTrackFeatures(features: TrackFeatures): Record<string, number | boolean> {
  return Object.fromEntries(MODEL_FEATURE_ORDER.map((key) => [key, features[key]]));
}

export function createPredictionClient(
  apiUrl = "http://localhost:8000",
  fetchImpl: FetchLike = fetch,
  timeoutMs = 10_000,
): PredictionClient {
  const baseUrl = apiUrl.replace(/\/$/, "");

  return {
    async predict(features, signal): Promise<GenrePrediction> {
      if (signal?.aborted) throw new DOMException("The request was cancelled.", "AbortError");

      const controller = new AbortController();
      let timedOut = false;
      const forwardAbort = () => controller.abort();
      signal?.addEventListener("abort", forwardAbort, { once: true });
      const timeout = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      try {
        let response: Response;
        try {
          response = await fetchImpl(`${baseUrl}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serializeTrackFeatures(features)),
            signal: controller.signal,
          });
        } catch (error) {
          if (signal?.aborted) throw new DOMException("The request was cancelled.", "AbortError");
          if (timedOut) {
            throw new PredictionServiceError(
              "timeout",
              "The classifier took longer than 10 seconds. Try again.",
              {},
              { cause: error },
            );
          }
          throw new PredictionServiceError(
            "network",
            "Unable to reach the backend. Confirm that FastAPI is running on the configured URL.",
            {},
            { cause: error },
          );
        }

        let payload: unknown;
        try {
          payload = await response.json();
        } catch (error) {
          if (signal?.aborted) throw new DOMException("The request was cancelled.", "AbortError");
          if (timedOut) {
            throw new PredictionServiceError(
              "timeout",
              "The classifier took longer than 10 seconds. Try again.",
              {},
              { cause: error },
            );
          }
          throw new PredictionServiceError(
            "response",
            "The backend returned an unreadable response.",
            {},
            { cause: error },
          );
        }
        if (!response.ok) throw createHttpError(response.status, payload);

        const result = parseGenrePrediction(payload);
        if (!result) {
          throw new PredictionServiceError(
            "response",
            "The backend returned data that does not match the genre contract.",
          );
        }
        return result;
      } finally {
        window.clearTimeout(timeout);
        signal?.removeEventListener("abort", forwardAbort);
      }
    },
  };
}
