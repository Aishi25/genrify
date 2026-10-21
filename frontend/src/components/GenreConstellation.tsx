
import { useId } from "react";

// Import our five genres, genre labels, and prediction data type.
import { GENRES, genreLabel, type GenrePrediction } from "../domain";

// Import the mathematical functions used to draw our constellation.
// These calculate coordinates, rings, axes, and genre probabilities.
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

// Define the props this component receives from its parent.
// We need the prediction to display genre probabilities.
interface GenreConstellationProps {
  prediction: GenrePrediction;
}

// Convert a decimal probability into a readable percentage.
// For example, 0.85 should display as 85.0%.
function percentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// Determine how genre labels should align around the chart.
// This prevents labels from extending awkwardly beyond the chart.
function labelAnchor(index: number): "start" | "middle" | "end" {
  if (index === 0) return "middle";
  return index === 1 || index === 2 ? "start" : "end";
}

// This component visualizes the classifier's predictions.
// It displays a five-axis constellation and a ranked probability list.
export function GenreConstellation({ prediction }: GenreConstellationProps) {

  // useId generates unique IDs for accessibility elements.
  // This connects our SVG chart to its title and description.
  const titleId = useId();
  const descriptionId = useId();

  // Sort the genre probabilities from highest to lowest.
  // This determines the order of the probability ranking.
  const ranked = rankProbabilities(prediction.probabilities);

  // JSX defines the chart and probability ranking layout.
  return (
    <div className="genre-scope-layout">

      {/* Left column contains our SVG constellation visualization. */}
      <div className="constellation-column">
        <div className="constellation-frame">

          {/* Decorative corners create the visual frame around our chart. */}
          <span className="scope-corner scope-corner-nw" aria-hidden="true" />
          <span className="scope-corner scope-corner-ne" aria-hidden="true" />
          <span className="scope-corner scope-corner-sw" aria-hidden="true" />
          <span className="scope-corner scope-corner-se" aria-hidden="true" />

          {/* SVG lets us draw shapes using coordinates instead of images. */}
          {/* viewBox creates a 320x320 coordinate system for our chart. */}
          <svg
            className="constellation-chart"
            viewBox="0 0 320 320"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
            data-testid="genre-constellation"
          >

            {/* Provide an accessible title describing the predicted genre. */}
            <title id={titleId}>{genreLabel(prediction.genre)} is the predicted genre</title>

            {/* Describe the chart and its confidence for screen reader users. */}
            <desc id={descriptionId}>
              Five axes show the classifier probabilities, ringed at 25, 50, 75 and 100 percent.
              {genreLabel(prediction.genre)} is highest at {percentage(prediction.confidence)}.
            </desc>

            {/* Draw the background grid using concentric rings and five axes. */}
            {/* Each ring represents a probability level from 25% to 100%. */}
            <g className="constellation-grid" aria-hidden="true">

              {/* map() creates one polygon for every probability ring. */}
              {CONSTELLATION_RINGS.map((fraction) => (
                <polygon key={fraction} points={constellationRingPoints(fraction)} />
              ))}

              {/* Draw one axis for each genre using calculated coordinates. */}
              {/* Each line starts near the center and extends outward. */}
              {GENRES.map((genre, index) => {
                const start = constellationRay(index, CONSTELLATION_INNER_RADIUS);
                const end = constellationRay(index, CONSTELLATION_OUTER_RADIUS);
                return <line key={genre} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
              })}
            </g>

            {/* Connect all five probability points into a single polygon. */}
            {/* The resulting shape visualizes the model's probability distribution. */}
            <polygon
              className="constellation-contour"
              points={constellationContour(prediction.probabilities)}
              data-testid="constellation-contour"
            />

            {/* Each axis doubles as a bar: the run from the hub edge out to the
                dot is how far that genre reached. */}

            {/* Draw a line and dot for each genre's predicted probability. */}
            {/* Higher probabilities place their dots farther from the center. */}
            <g className="constellation-signals" aria-hidden="true">
              {GENRES.map((genre, index) => {

                // Calculate where the line begins and where its probability ends.
                const base = constellationRay(index, CONSTELLATION_INNER_RADIUS);
                const point = constellationPoint(index, prediction.probabilities[genre]);

                // Check whether this genre is the model's predicted winner.
                const active = genre === prediction.genre;

                return (
                  <g key={genre} className={active ? "signal-active" : undefined}>

                    {/* Draw a line representing the genre's probability. */}
                    <line x1={base.x} y1={base.y} x2={point.x} y2={point.y} />

                    {/* Place a dot at the probability value. */}
                    {/* Make the predicted genre's dot slightly larger. */}
                    <circle cx={point.x} cy={point.y} r={active ? 5.5 : 4} />
                  </g>
                );
              })}
            </g>

            {/* Display the genre names around the outside of the chart. */}
            {/* Each label is positioned using its axis coordinates. */}
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

            {/* Display the winning genre and confidence in the center. */}
            {/* The center circle acts as the main prediction readout. */}
            <g className="constellation-center" aria-hidden="true">
              <circle cx={CONSTELLATION_CENTER} cy={CONSTELLATION_CENTER} r="40" />
              <text className="center-genre" x="160" y="157">{genreLabel(prediction.genre)}</text>
              <text className="center-confidence" x="160" y="177">
                {percentage(prediction.confidence)}
              </text>
            </g>
          </svg>
        </div>

        {/* Explain what the probability rings represent. */}
        {/* The five genre probabilities should add up to 100%. */}
        <div className="scope-readout" aria-hidden="true">
          <span>Rings: {CONSTELLATION_RINGS.map((ring) => `${ring * 100}%`).join(" · ")}</span>
          <span>5 genres, summing to 100%</span>
        </div>
      </div>

      {/* Right column lists every genre from highest to lowest probability. */}
      <div className="probability-ranking" aria-label="Genre probabilities">
        <p className="ranking-title">All genre probabilities</p>

        {/* Use an ordered list to display the ranked genres. */}
        <ol>

          {/* map() generates one list item for each genre probability. */}
          {ranked.map(([genre, probability]) => (
            <li key={genre}>

              {/* Display the genre name and its predicted percentage. */}
              <div className="probability-label">
                <span>{genreLabel(genre)}</span>
                <strong>{percentage(probability)}</strong>
              </div>

              {/* Create a horizontal meter showing the probability visually. */}
              {/* Accessibility attributes describe the meter's numerical value. */}
              <div
                className="probability-meter"
                role="meter"
                aria-label={`${genreLabel(genre)} probability`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number((probability * 100).toFixed(1))}
              >

                {/* Set the bar width based on the genre's probability. */}
                {/* A higher probability should produce a longer bar. */}
                <span style={{ width: `${probability * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
