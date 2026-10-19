import { useEffect, useMemo, useRef, useState } from "react";
import { FeatureControls } from "./components/FeatureControls";
import { GenreRadar } from "./components/GenreRadar";
import { PredictionReadout, type PredictionStatus } from "./components/PredictionReadout";
import {
  RADAR_FEATURE_KEYS,
  STARTER_TRACK,
  type FeatureValues,
  type FieldErrors,
  type GenrePrediction,
  type PredictionClient,
  type TrackFeatureDraft,
} from "./domain";
import {
  createTrackFeatureDraft,
  parseTrackFeatureDraft,
} from "./lib/trackFeatures";
import {
  createPredictionClient,
  isAbortError,
  PredictionServiceError,
} from "./services/prediction";

interface GenrifyWorkspaceProps {
  client: PredictionClient;
  debounceMs?: number;
}

function radarValuesFromDraft(draft: TrackFeatureDraft): FeatureValues {
  return Object.fromEntries(
    RADAR_FEATURE_KEYS.map((key) => {
      const value = Number(draft[key]);
      return [key, Number.isFinite(value) ? value : STARTER_TRACK[key]];
    }),
  ) as FeatureValues;
}

function headerStatus(
  status: PredictionStatus,
  result: GenrePrediction | null,
  error: PredictionServiceError | null,
): string {
  if (status === "loading") return "Reading signal";
  if (status === "invalid" || error?.code === "validation") return "Check inputs";
  if (status === "error") return error?.code === "timeout" ? "Timed out" : "Backend unavailable";
  return result?.source === "model" ? "Model ready" : "Demo ready";
}

export function GenrifyWorkspace({ client, debounceMs = 300 }: GenrifyWorkspaceProps) {
  const [draft, setDraft] = useState(() => createTrackFeatureDraft(STARTER_TRACK));
  const [status, setStatus] = useState<PredictionStatus>("loading");
  const [result, setResult] = useState<GenrePrediction | null>(null);
  const [error, setError] = useState<PredictionServiceError | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});
  const [retryVersion, setRetryVersion] = useState(0);
  const requestVersion = useRef(0);
  const parsed = useMemo(() => parseTrackFeatureDraft(draft), [draft]);
  const radarInputs = useMemo(() => radarValuesFromDraft(draft), [draft]);
  const fieldErrors = { ...parsed.errors, ...serverFieldErrors };

  useEffect(() => {
    const features = parsed.features;
    if (!features) return;

    const version = ++requestVersion.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const nextResult = await client.predict(features, controller.signal);
        if (version !== requestVersion.current || controller.signal.aborted) return;
        setResult(nextResult);
        setStatus("success");
      } catch (requestError) {
        if (
          version !== requestVersion.current ||
          controller.signal.aborted ||
          isAbortError(requestError)
        ) {
          return;
        }

        const failure = requestError instanceof PredictionServiceError
          ? requestError
          : new PredictionServiceError(
              "response",
              "The classifier failed unexpectedly. Try again.",
              {},
              { cause: requestError },
            );
        setError(failure);
        setServerFieldErrors(failure.fieldErrors);
        setStatus("error");
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [client, debounceMs, parsed.features, retryVersion]);

  function handleDraftChange(nextDraft: TrackFeatureDraft) {
    const nextParsed = parseTrackFeatureDraft(nextDraft);
    setDraft(/* BLANK 04 */ draft);
    setResult(null);
    setError(null);
    setServerFieldErrors({});
    setStatus(nextParsed.features ? "loading" : "invalid");
  }

  function retryPrediction() {
    if (!parsed.features) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    setResult(null);
    setError(null);
    setServerFieldErrors({});
    setRetryVersion((version) => version + 1);
  }

  const currentStatus = headerStatus(status, result, error);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#workspace" aria-label="Genrify workspace">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span>
            <strong>Genrify</strong>
            <small>BDBI Fall 2026</small>
          </span>
        </a>
        <div className="header-context">
          <span>Genre classifier</span>
          <span className={`header-status status-${status}`}>
            <i aria-hidden="true" />{currentStatus}
          </span>
        </div>
      </header>

      <main id="workspace">
        <div className="intro-row">
          <h1>Shape a track.<br />Find its genre.</h1>
          <p className="intro-copy">
            Move through the sound of a track, then watch the classifier place its signal across
            five workshop genres.
          </p>
        </div>

        <div className="workspace-grid">
          <FeatureControls draft={draft} errors={fieldErrors} onChange={handleDraftChange} />
          <div className="output-stack">
            <PredictionReadout
              status={status}
              result={result}
              error={error}
              onRetry={retryPrediction}
            />
            <GenreRadar genre={result?.genre ?? null} inputs={radarInputs} />
          </div>
        </div>
      </main>

      <footer className="workshop-path" aria-label="Workshop learning path">
        <span>Controlled inputs</span>
        <i aria-hidden="true" />
        <span>API contract</span>
        <i aria-hidden="true" />
        <span>Genre signal</span>
      </footer>
    </div>
  );
}

export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
  const client = useMemo(() => createPredictionClient(apiUrl), [apiUrl]);
  return <GenrifyWorkspace client={client} />;
}
