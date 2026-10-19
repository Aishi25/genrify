import { useId } from "react";
import {
  RADAR_FEATURE_DEFINITIONS,
  genreLabel,
  type FeatureValues,
  type Genre,
} from "../domain";
import { getGenreProfile } from "../data/genreProfiles";
import { radarAxisEnd, radarGridPoints, radarPoint, radarPolygonPoints } from "../lib/radar";

interface GenreRadarProps {
  genre: Genre | null;
  inputs: FeatureValues;
}

const GRID_LEVELS = [0.2, 0.4, 0.6, 0.8, 1];

function textAnchor(index: number): "start" | "middle" | "end" {
  if (index === 0) return "middle";
  return index === 1 || index === 2 ? "start" : "end";
}

function displayFeatureValue(key: keyof FeatureValues, value: number): string {
  return key === "tempo" ? `${value.toFixed(1)} BPM` : value.toFixed(2);
}

export function GenreRadar({ genre, inputs }: GenreRadarProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reference = genre ? getGenreProfile(genre) : null;
  const inputPoints = radarPolygonPoints(inputs);
  const referencePoints = reference ? radarPolygonPoints(reference) : null;

  return (
    <section className="panel radar-panel" aria-labelledby="radar-heading">
      <div className="panel-heading radar-heading-row">
        <div>
          <p className="section-kicker">Feature fingerprint</p>
          <h2 id="radar-heading">Track versus predicted profile</h2>
        </div>
        <div className="radar-legend" aria-label="Radar chart legend">
          <span><i className="legend-swatch legend-input" />Your track</span>
          <span>
            <i className="legend-swatch legend-reference" />
            {genre ? genreLabel(genre) : "Awaiting result"}
          </span>
        </div>
      </div>

      <div className="radar-frame">
        <div className="scope-frame">
          <span className="scope-corner scope-corner-nw" aria-hidden="true" />
          <span className="scope-corner scope-corner-ne" aria-hidden="true" />
          <span className="scope-corner scope-corner-sw" aria-hidden="true" />
          <span className="scope-corner scope-corner-se" aria-hidden="true" />

          <svg
            className="radar-chart"
            viewBox="0 0 320 320"
            role="img"
            aria-labelledby={`${titleId} ${descriptionId}`}
          >
            <title id={titleId}>
              {genre
                ? `Your audio features compared with the ${genreLabel(genre)} profile`
                : "Your current audio feature fingerprint"}
            </title>
            <desc id={descriptionId}>
              A five-axis radar for danceability, energy, acousticness, valence, and tempo.
              {genre ? ` The dashed outline is the ${genreLabel(genre)} dataset average.` : " A comparison profile appears after classification."}
            </desc>

            <g className="radar-grid" aria-hidden="true">
              {GRID_LEVELS.map((level) => (
                <polygon key={level} points={radarGridPoints(level)} />
              ))}
              {RADAR_FEATURE_DEFINITIONS.map((_, index) => {
                const end = radarAxisEnd(index);
                return <line key={index} x1="160" y1="160" x2={end.x} y2={end.y} />;
              })}
            </g>

            {referencePoints ? (
              <polygon
                className="radar-shape radar-reference-shape"
                points={referencePoints}
                data-testid="reference-polygon"
              />
            ) : null}
            <polygon
              className="radar-shape radar-input-shape"
              points={inputPoints}
              data-testid="input-polygon"
            />

            <g className="radar-dots" aria-hidden="true">
              {RADAR_FEATURE_DEFINITIONS.map((feature, index) => {
                const value = feature.key === "tempo" ? inputs.tempo / 250 : inputs[feature.key];
                const point = radarPoint(index, value);
                return <circle key={feature.key} cx={point.x} cy={point.y} r="3.5" />;
              })}
            </g>

            <g className="radar-labels" aria-hidden="true">
              {RADAR_FEATURE_DEFINITIONS.map((feature, index) => {
                const point = radarAxisEnd(index, 134);
                const yOffset = index === 0 ? -2 : index === 2 || index === 3 ? 8 : 3;
                return (
                  <text
                    key={feature.key}
                    x={point.x}
                    y={point.y + yOffset}
                    textAnchor={textAnchor(index)}
                  >
                    {feature.shortLabel}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="scope-readout" aria-hidden="true">
          <span>{genre ? `Profile: ${genreLabel(genre)}` : "Profile: pending"}</span>
          <span>Tempo normalized to 250 BPM</span>
        </div>
      </div>

      <div className="sr-only">
        <table>
          <caption>Exact feature values used in the radar comparison</caption>
          <thead>
            <tr><th>Feature</th><th>Your track</th><th>{genre ? `${genreLabel(genre)} average` : "Profile"}</th></tr>
          </thead>
          <tbody>
            {RADAR_FEATURE_DEFINITIONS.map((feature) => (
              <tr key={feature.key}>
                <th>{feature.label}</th>
                <td>{displayFeatureValue(feature.key, inputs[feature.key])}</td>
                <td>{reference ? displayFeatureValue(feature.key, reference[feature.key]) : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="radar-note">
        The dashed profile is a cleaned dataset average. It shows similarity, not why the model
        selected a genre.
      </p>
    </section>
  );
}
