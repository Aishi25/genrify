import { useId } from "react";
import { GENRES, genreLabel, type GenrePrediction } from "../domain";
import {
  CONSTELLATION_CENTER,
  CONSTELLATION_INNER_RADIUS,
  CONSTELLATION_LABEL_RADIUS,
  CONSTELLATION_OUTER_RADIUS,
  CONSTELLATION_RINGS,
  constellationContour,
  constellationPoint,
  constellationRay,
  constellationRingPoints,
  rankProbabilities,
} from "../lib/constellation";

interface GenreConstellationProps {
  prediction: GenrePrediction;
}

function percentage(value: number): string {
  return `${(value * /* BLANK 09 */ 1).toFixed(1)}%`;
}

function labelAnchor(index: number): "start" | "middle" | "end" {
  if (index === 0) return "middle";
  return index === 1 || index === 2 ? "start" : "end";
}

export function GenreConstellation({ prediction }: GenreConstellationProps) {
  const titleId = useId();
  const descriptionId = useId();
  const ranked = rankProbabilities(/* BLANK 08 */ { ...prediction.probabilities, [prediction.genre]: 0 });

  return (
    <div className="genre-scope-layout">
      <div className="constellation-column">
        <div className="constellation-frame">
          <span className="scope-corner scope-corner-nw" aria-hidden="true" />
          <span className="scope-corner scope-corner-ne" aria-hidden="true" />
          <span className="scope-corner scope-corner-sw" aria-hidden="true" />
          <span className="scope-corner scope-corner-se" aria-hidden="true" />
          <svg
            className="constellation-chart"
            viewBox="0 0 320 320"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
            data-testid="genre-constellation"
          >
            <title id={titleId}>{genreLabel(prediction.genre)} is the predicted genre</title>
            <desc id={descriptionId}>
              Five axes show the classifier probabilities, ringed at 25, 50, 75 and 100 percent.
              {genreLabel(prediction.genre)} is highest at {percentage(prediction.confidence)}.
            </desc>

            <g className="constellation-grid" aria-hidden="true">
              {CONSTELLATION_RINGS.map((fraction) => (
                <polygon key={fraction} points={constellationRingPoints(fraction)} />
              ))}
              {GENRES.map((genre, index) => {
                const start = constellationRay(index, CONSTELLATION_INNER_RADIUS);
                const end = constellationRay(index, CONSTELLATION_OUTER_RADIUS);
                return <line key={genre} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
              })}
            </g>

            <polygon
              className="constellation-contour"
              points={constellationContour(prediction.probabilities)}
              data-testid="constellation-contour"
            />

            {/* Each axis doubles as a bar: the run from the hub edge out to the
                dot is how far that genre reached. */}
            <g className="constellation-signals" aria-hidden="true">
              {GENRES.map((genre, index) => {
                const base = constellationRay(index, CONSTELLATION_INNER_RADIUS);
                const point = constellationPoint(index, prediction.probabilities[genre]);
                const active = genre === prediction.genre;
                return (
                  <g key={genre} className={active ? "signal-active" : undefined}>
                    <line x1={base.x} y1={base.y} x2={point.x} y2={point.y} />
                    <circle cx={point.x} cy={point.y} r={active ? 5.5 : 4} />
                  </g>
                );
              })}
            </g>

            <g className="constellation-labels" aria-hidden="true">
              {GENRES.map((genre, index) => {
                const point = constellationRay(index, CONSTELLATION_LABEL_RADIUS);
                return (
                  <text
                    key={genre}
                    x={point.x}
                    y={point.y + (index === 0 ? -4 : index === 2 || index === 3 ? 8 : 3)}
                    textAnchor={labelAnchor(index)}
                    className={genre === prediction.genre ? "label-active" : undefined}
                  >
                    {genreLabel(genre)}
                  </text>
                );
              })}
            </g>

            <g className="constellation-center" aria-hidden="true">
              <circle cx={CONSTELLATION_CENTER} cy={CONSTELLATION_CENTER} r="40" />
              <text className="center-genre" x="160" y="157">{genreLabel(prediction.genre)}</text>
              <text className="center-confidence" x="160" y="177">
                {percentage(prediction.confidence)}
              </text>
            </g>
          </svg>
        </div>

        <div className="scope-readout" aria-hidden="true">
          <span>Rings: {CONSTELLATION_RINGS.map((ring) => `${ring * 100}%`).join(" · ")}</span>
          <span>5 genres, summing to 100%</span>
        </div>
      </div>

      <div className="probability-ranking" aria-label="Genre probabilities">
        <p className="ranking-title">All genre probabilities</p>
        <ol>
          {ranked.map(([genre, probability]) => (
            <li key={genre}>
              <div className="probability-label">
                <span>{genreLabel(genre)}</span>
                <strong>{percentage(probability)}</strong>
              </div>
              <div
                className="probability-meter"
                role="meter"
                aria-label={`${genreLabel(genre)} probability`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number((probability * 100).toFixed(1))}
              >
                <span style={{ width: `${probability * /* BLANK 10 */ 0}%` }} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
