import { useEffect, useMemo, useRef, useState } from "react";

// Import the three main UI components for our application.
import { FeatureControls } from "./components/FeatureControls";
import { GenreRadar } from "./components/GenreRadar";
import { PredictionReadout, type PredictionStatus } from "./components/PredictionReadout";

// Import track data, feature keys, and TypeScript types.
import {
  RADAR_FEATURE_KEYS,
  STARTER_TRACK,
  type FeatureValues,
  type FieldErrors,
  type GenrePrediction,
  type PredictionClient,
  type TrackFeatureDraft,
} from "./domain";

// Import functions for validating inputs and communicating with the backend.
import {
  createTrackFeatureDraft,
  parseTrackFeatureDraft,
} from "./lib/trackFeatures";
import {
  createPredictionClient,
  isAbortError,
  PredictionServiceError,
} from "./services/prediction";

// Props define what information our workspace component receives.
// The prediction client handles API calls, and debounceMs controls the delay.
interface GenrifyWorkspaceProps {
  client: PredictionClient;
  debounceMs?: number;
}

// Convert user input strings into numbers for the radar chart.
// If an input isn't a valid number, use the starter track's default value.
function radarValuesFromDraft(draft: TrackFeatureDraft): FeatureValues {
  return Object.fromEntries(
    RADAR_FEATURE_KEYS.map((key) => {
      const value = Number(draft[key]);
      return [key, Number.isFinite(value) ? value : STARTER_TRACK[key]];
    }),
  ) as FeatureValues;
}

// Determine the message displayed in the header.
// The message changes depending on loading, errors, or prediction results.
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

// This is our main React component.
// It connects user inputs, backend predictions, and visualizations.
export function GenrifyWorkspace({ client, debounceMs = 300 }: GenrifyWorkspaceProps) {

  // useState stores data that can change while the app is running.
  // When state changes, React re-renders the component.

  // Store the current audio feature inputs, starting with default values.
  const [draft, setDraft] = useState(() => createTrackFeatureDraft(STARTER_TRACK));

  // Track whether the prediction is loading, successful, invalid, or failed.
  const [status, setStatus] = useState<PredictionStatus>("loading");

  // Store the prediction returned by the backend.
  const [result, setResult] = useState<GenrePrediction | null>(null);

  // Store errors that occur during prediction.
  const [error, setError] = useState<PredictionServiceError | null>(null);

  // Store input validation errors returned by the backend.
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});

  // Increment this value whenever we want to retry a prediction.
  const [retryVersion, setRetryVersion] = useState(0);

  // useRef remembers a value without triggering a re-render.
  // We use it to identify the latest API request and ignore outdated results.
  const requestVersion = useRef(0);

  // useMemo remembers calculated values until their dependencies change.
  // This prevents unnecessary recalculations on every render.

  // Validate the user's inputs whenever the draft changes.
  const parsed = useMemo(() => parseTrackFeatureDraft(draft), [draft]);

  // Convert the draft into numerical values for our radar chart.
  const radarInputs = useMemo(() => radarValuesFromDraft(draft), [draft]);

  // Combine frontend and backend validation errors.
  const fieldErrors = { ...parsed.errors, ...serverFieldErrors };

  // useEffect runs side effects, such as making API requests.
  // Here, it requests a new prediction whenever valid inputs change.
  useEffect(() => {
    const features = parsed.features;

    // Don't send a request if the inputs are invalid.
    if (!features) return;

    // Give this request a version number so we can identify outdated requests.
    const version = ++requestVersion.current;

    // AbortController lets us cancel an API request when inputs change.
    const controller = new AbortController();

    // Debouncing: wait 300ms before sending the prediction request.
    // This prevents excessive API calls when users move sliders quickly.
    const timer = window.setTimeout(async () => {
      try {

        // Send validated audio features to the backend for genre prediction.
        const nextResult = await client.predict(features, controller.signal);

        // Ignore the response if a newer request exists or this one was canceled.
        if (version !== requestVersion.current || controller.signal.aborted) return;

        // Save the prediction and update the UI to show success.
        setResult(nextResult);
        setStatus("success");

      } catch (requestError) {

        // Ignore canceled or outdated requests instead of showing an error.
        if (
          version !== requestVersion.current ||
          controller.signal.aborted ||
          isAbortError(requestError)
        ) {
          return;
        }

        // Convert unexpected errors into a consistent error format.
        // This makes it easier to display useful messages to users.
        const failure = requestError instanceof PredictionServiceError
          ? requestError
          : new PredictionServiceError(
              "response",
              "The classifier failed unexpectedly. Try again.",
              {},
              { cause: requestError },
            );

        // Save the error information and update the UI.
        setError(failure);
        setServerFieldErrors(failure.fieldErrors);
        setStatus("error");
      }
    }, debounceMs);

    // Cleanup runs when dependencies change or the component unmounts.
    // Cancel the timer and request to avoid unnecessary work.
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };

  // Re-run this effect when the client, delay, features, or retry value changes.
  }, [client, debounceMs, parsed.features, retryVersion]);

  // This function runs whenever a user changes an input or moves a slider.
  // It validates the new values and clears any previous prediction.
  function handleDraftChange(nextDraft: TrackFeatureDraft) {
    const nextParsed = parseTrackFeatureDraft(nextDraft);

    // Update the track feature draft.
    setDraft(nextDraft);

    // Clear previous results and errors because the inputs have changed.
    setResult(null);
    setError(null);
    setServerFieldErrors({});

    // Show loading for valid inputs or invalid for incorrect inputs.
    setStatus(nextParsed.features ? "loading" : "invalid");
  }

  // Allow users to manually retry a failed prediction.
  // This triggers another API request without changing the track features.
  function retryPrediction() {

    // Prevent retrying if the current inputs are invalid.
    if (!parsed.features) {
      setStatus("invalid");
      return;
    }

    // Reset the UI before attempting another prediction.
    setStatus("loading");
    setResult(null);
    setError(null);
    setServerFieldErrors({});

    // Incrementing retryVersion causes useEffect to run again.
    setRetryVersion((version) => version + 1);
  }

  // Calculate the current header message from our application state.
  const currentStatus = headerStatus(status, result, error);

  // JSX describes the structure and appearance of our React interface.
  // When state changes, React automatically updates the affected UI.
  return (
    <div className="app-shell">

      {/* Header displays the Genrify branding and current prediction status. */}
      <header className="site-header">
        <a className="brand" href="#workspace" aria-label="Genrify workspace">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span>
            <strong>Genrify</strong>
            <small>BDBI Fall 2026</small>
          </span>
        </a>

        {/* Display a dynamic status message based on the prediction state. */}
        <div className="header-context">
          <span>Genre classifier</span>
          <span className={`header-status status-${status}`}>
            <i aria-hidden="true" />{currentStatus}
          </span>
        </div>
      </header>

      {/* Main workspace contains our introduction and interactive components. */}
      <main id="workspace">
        <div className="intro-row">
          <h1>Shape a track.<br />Find its genre.</h1>
          <p className="intro-copy">
            Move through the sound of a track, then watch the classifier place its signal across
            five workshop genres.
          </p>
        </div>

        <div className="workspace-grid">

          {/* Controlled component: receives input values and an onChange function. */}
          {/* When users change features, the parent component updates its state. */}
          <FeatureControls draft={draft} errors={fieldErrors} onChange={handleDraftChange} />

          <div className="output-stack">

            {/* Display prediction results, loading states, and error messages. */}
            {/* The onRetry prop lets this child trigger the parent's retry function. */}
            <PredictionReadout
              status={status}
              result={result}
              error={error}
              onRetry={retryPrediction}
            />

            {/* Visualize the current track features using an interactive radar chart. */}
            {/* Props pass the predicted genre and numerical inputs to this component. */}
            <GenreRadar genre={result?.genre ?? null} inputs={radarInputs} />
          </div>
        </div>
      </main>

      {/* Footer summarizes the three main concepts in our workshop. */}
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

// App is the root component and entry point for our application.
// It configures the backend connection and renders our workspace.
export default function App() {

  // Read the backend URL from environment variables.
  // Default to localhost:8000 when running the application locally.
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  // Create the prediction API client and reuse it unless the URL changes.
  const client = useMemo(() => createPredictionClient(apiUrl), [apiUrl]);

  // Render our workspace and pass the prediction client as a prop.
  return <GenrifyWorkspace client={client} />;
}
