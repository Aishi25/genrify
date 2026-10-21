
import type { GenrePrediction } from "../domain";
import type { PredictionServiceError } from "../services/prediction";

// Import the visualization component that displays our genre prediction.
import { GenreConstellation } from "./GenreConstellation";

// Define the four possible states of our prediction.
// TypeScript ensures status can only be one of these values.
export type PredictionStatus = "invalid" | "loading" | "success" | "error";

// Props define what information this component receives from its parent.
// These include the prediction status, result, error, and retry function.
interface PredictionReadoutProps {
  status: PredictionStatus;
  result: GenrePrediction | null;
  error: PredictionServiceError | null;
  onRetry: () => void;
}

// Determine whether the prediction came from a trained ML model or a demo.
// Optional chaining (?.) safely handles cases where no result exists.
function sourceLabel(result: GenrePrediction | null): string {
  return result?.source === "model" ? "Trained model" : "Demo classifier";
}

// PredictionReadout displays the current state of our genre classifier.
// It uses props to decide which message or visualization to display.
export function PredictionReadout({
  status,
  result,
  error,
  onRetry,
}: PredictionReadoutProps) {

  // JSX describes the interface that React renders on the screen.
  return (
    <section className="panel prediction-panel" aria-labelledby="prediction-heading">

      {/* Display the heading and prediction source when a result is available. */}
      <div className="panel-heading prediction-heading">
        <div>
          <p className="section-kicker">Genre signal</p>
          <h2 id="prediction-heading">Classifier readout</h2>
        </div>

        {/* Conditional rendering: only show the source badge after success. */}
        {/* The badge tells users whether a real model or demo generated the result. */}
        {status === "success" && result ? (
          <span className={`source-badge source-${result.source}`}>
            <span className="source-light" aria-hidden="true" />
            {sourceLabel(result)}
          </span>
        ) : null}
      </div>

      {/* aria-live announces prediction updates to screen reader users. */}
      {/* This makes changing results more accessible without requiring interaction. */}
      <div className="prediction-live-region" aria-live="polite" aria-atomic="true">

        {/* LOADING STATE: Display a loading animation while waiting for the API. */}
        {/* React only renders this section when status equals "loading". */}
        {status === "loading" ? (
          <div className="prediction-message">
            <span className="signal-loader" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>
              <strong>Reading the signal</strong>
              <small>Sending all 15 features to the classifier.</small>
            </span>
          </div>
        ) : null}

        {/* INVALID STATE: Tell users to correct their input values. */}
        {/* The classifier cannot process inputs that fail validation. */}
        {status === "invalid" ? (
          <div className="prediction-message prediction-invalid" role="status">
            <span className="message-mark" aria-hidden="true">!</span>
            <span>
              <strong>Check the inputs</strong>
              <small>Fix the highlighted field before the next classification.</small>
            </span>
          </div>
        ) : null}

        {/* ERROR STATE: Display an error if the backend request fails. */}
        {/* Users can click "Try again" to request another prediction. */}
        {status === "error" && error ? (
          <div className="prediction-error" role="alert">
            <span>

              {/* Show a specific message for timeouts and a general message otherwise. */}
              <strong>{error.code === "timeout" ? "Request timed out" : "No classification returned"}</strong>

              {/* Display the detailed error message returned by our service. */}
              <small>{error.message}</small>
            </span>

            {/* Call the parent's retry function when the button is clicked. */}
            {/* This demonstrates passing functions as props between components. */}
            <button type="button" onClick={onRetry}>Try again</button>
          </div>
        ) : null}

        {/* Display the genre visualization when the required condition is met. */}
        {/* Pass the prediction data into GenreConstellation using props. */}
        {status === "success" && result ? <GenreConstellation prediction={result} /> : null}
      </div>

      {/* Explain where the classification result came from. */}
      {/* Nested ternary operators choose between model, demo, or default text. */}
      <p className="prediction-disclaimer">
        {result
          ? result.source === "model"
            ? "This result came from the trained classifier loaded by FastAPI."
            : "Demo classifier means FastAPI is using its deterministic stand-in, not a trained model."
          : "FastAPI labels every result so you can tell a demo response from a trained model."}
      </p>
    </section>
  );
}
