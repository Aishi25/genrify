import type { GenrePrediction } from "../domain";
import type { PredictionServiceError } from "../services/prediction";
import { GenreConstellation } from "./GenreConstellation";

export type PredictionStatus = "invalid" | "loading" | "success" | "error";

interface PredictionReadoutProps {
  status: PredictionStatus;
  result: GenrePrediction | null;
  error: PredictionServiceError | null;
  onRetry: () => void;
}

function sourceLabel(result: GenrePrediction | null): string {
  return result?.source === "model" ? "Trained model" : "Demo classifier";
}

export function PredictionReadout({
  status,
  result,
  error,
  onRetry,
}: PredictionReadoutProps) {
  return (
    <section className="panel prediction-panel" aria-labelledby="prediction-heading">
      <div className="panel-heading prediction-heading">
        <div>
          <p className="section-kicker">Genre signal</p>
          <h2 id="prediction-heading">Classifier readout</h2>
        </div>
        {status === "success" && result ? (
          <span className={`source-badge source-${result.source}`}>
            <span className="source-light" aria-hidden="true" />
            {sourceLabel(result)}
          </span>
        ) : null}
      </div>

      <div className="prediction-live-region" aria-live="polite" aria-atomic="true">
        {status === "loading" ? (
          <div className="prediction-message">
            <span className="signal-loader" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>
              <strong>Reading the signal</strong>
              <small>Sending all 15 features to the classifier.</small>
            </span>
          </div>
        ) : null}

        {status === "invalid" ? (
          <div className="prediction-message prediction-invalid" role="status">
            <span className="message-mark" aria-hidden="true">!</span>
            <span>
              <strong>Check the inputs</strong>
              <small>Fix the highlighted field before the next classification.</small>
            </span>
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="prediction-error" role="alert">
            <span>
              <strong>{error.code === "timeout" ? "Request timed out" : "No classification returned"}</strong>
              <small>{error.message}</small>
            </span>
            <button type="button" onClick={onRetry}>Try again</button>
          </div>
        ) : null}

        {status === /* BLANK 07 */ "loading" && result ? <GenreConstellation prediction={result} /> : null}
      </div>

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
