import type { CSSProperties } from "react";
import {
  RADAR_FEATURE_DEFINITIONS,
  type FieldErrors,
  type NumericFeatureKey,
  type RadarFeatureDefinition,
  type TrackFeatureDraft,
} from "../domain";
import { formatDuration } from "../lib/trackFeatures";

interface FeatureControlsProps {
  draft: TrackFeatureDraft;
  errors: FieldErrors;
  onChange: (draft: TrackFeatureDraft) => void;
}

interface RangeDefinition {
  key: NumericFeatureKey;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const ADVANCED_RANGES: readonly RangeDefinition[] = [
  {
    key: "loudness",
    label: "Loudness",
    description: "Average loudness across the track.",
    min: -60,
    max: 5,
    step: 0.1,
    unit: "dB",
  },
  {
    key: "speechiness",
    label: "Speechiness",
    description: "Presence of spoken words.",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "instrumentalness",
    label: "Instrumentalness",
    description: "Likelihood that the track has no vocals.",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "liveness",
    label: "Liveness",
    description: "Presence of an audience in the recording.",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "popularity",
    label: "Popularity",
    description: "Spotify popularity score.",
    min: 0,
    max: 100,
    step: 1,
  },
];

const KEY_OPTIONS = [
  [-1, "Undetected"],
  [0, "C"],
  [1, "C♯ / D♭"],
  [2, "D"],
  [3, "D♯ / E♭"],
  [4, "E"],
  [5, "F"],
  [6, "F♯ / G♭"],
  [7, "G"],
  [8, "G♯ / A♭"],
  [9, "A"],
  [10, "A♯ / B♭"],
  [11, "B"],
] as const;

function formatRangeValue(definition: RangeDefinition | RadarFeatureDefinition, raw: string): string {
  const value = Number(raw);
  if (definition.key === "tempo") return `${Math.round(value)} BPM`;
  if ("unit" in definition && definition.unit) return `${value.toFixed(1)} ${definition.unit}`;
  if (definition.step === 1) return String(Math.round(value));
  return value.toFixed(2);
}

interface RangeControlProps {
  definition: RangeDefinition | RadarFeatureDefinition;
  value: string;
  error?: string;
  onChange: (key: NumericFeatureKey, value: string) => void;
}

function RangeControl({ definition, value, error, onChange }: RangeControlProps) {
  const rangePosition =
    ((Number(value) - definition.min) / (definition.max - definition.min)) * 100;
  const rangeStyle = { "--range-position": `${rangePosition}%` } as CSSProperties;
  const helpId = `${definition.key}-help`;
  const errorId = `${definition.key}-error`;

  return (
    <div className="range-control">
      <div className="range-meta">
        <span>
          <label className="control-label" htmlFor={definition.key}>{definition.label}</label>
          <span className="control-help" id={helpId}>{definition.description}</span>
        </span>
        <output className="control-value" htmlFor={definition.key}>
          {formatRangeValue(definition, value)}
        </output>
      </div>
      <input
        className="range-input"
        id={definition.key}
        type="range"
        min={definition.min}
        max={definition.max}
        step={definition.step}
        value={/* BLANK 01 */ definition.min}
        style={rangeStyle}
        aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
        aria-invalid={error ? "true" : undefined}
        aria-valuetext={formatRangeValue(definition, value)}
        onChange={(event) => onChange(definition.key, /* BLANK 02 */ event.target.defaultValue)}
      />
      {error ? <span className="field-error" id={errorId}>{error}</span> : null}
    </div>
  );
}

interface SelectFieldProps {
  id: NumericFeatureKey;
  label: string;
  help: string;
  value: string;
  error?: string;
  children: React.ReactNode;
  onChange: (key: NumericFeatureKey, value: string) => void;
}

function SelectField({ id, label, help, value, error, children, onChange }: SelectFieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  return (
    <div className="compact-control">
      <label className="control-label" htmlFor={id}>{label}</label>
      <span className="control-help" id={helpId}>{help}</span>
      <span className="select-shell">
        <select
          id={id}
          value={value}
          aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
          aria-invalid={error ? "true" : undefined}
          onChange={(event) => onChange(id, event.target.value)}
        >
          {children}
        </select>
      </span>
      {error ? <span className="field-error" id={errorId}>{error}</span> : null}
    </div>
  );
}

export function FeatureControls({ draft, errors, onChange }: FeatureControlsProps) {
  function setValue(key: NumericFeatureKey, value: string) {
    onChange({ ...draft, [key]: /* BLANK 03 */ value.slice(0, 0) });
  }

  return (
    <section className="panel controls-panel" aria-labelledby="controls-heading">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Track inputs</p>
          <h2 id="controls-heading">Shape the sound</h2>
        </div>
        <span className="input-count">15 fields</span>
      </div>

      <p className="panel-intro">
        Start with the five features used in the visual comparison. Every change sends a complete
        track to the classifier.
      </p>

      <div className="primary-controls">
        {RADAR_FEATURE_DEFINITIONS.map((definition) => (
          <RangeControl
            key={definition.key}
            definition={definition}
            value={/* BLANK 05 */ draft["energy"]}
            error={errors[definition.key]}
            onChange={setValue}
          />
        ))}
      </div>

      <details className="advanced-inputs">
        <summary>
          <span>
            <strong>More model inputs</strong>
            <small>10 required fields · starter values loaded</small>
          </span>
          <span className="summary-action" aria-hidden="true" />
        </summary>

        <div className="advanced-grid">
          <SelectField
            id="key"
            label="Key"
            help="Detected pitch class."
            value={draft.key}
            error={errors.key}
            onChange={setValue}
          >
            {KEY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{value === -1 ? label : `${value} · ${label}`}</option>
            ))}
          </SelectField>

          <SelectField
            id="mode"
            label="Mode"
            help="Minor or major modality."
            value={draft.mode}
            error={errors.mode}
            onChange={setValue}
          >
            <option value="0">Minor</option>
            <option value="1">Major</option>
          </SelectField>

          {ADVANCED_RANGES.slice(0, 4).map((definition) => (
            <RangeControl
              key={definition.key}
              definition={definition}
              value={draft[definition.key]}
              error={errors[definition.key]}
              onChange={setValue}
            />
          ))}

          <SelectField
            id="time_signature"
            label="Time signature"
            help="Beats in each measure."
            value={draft.time_signature}
            error={errors.time_signature}
            onChange={setValue}
          >
            {Array.from({ length: 8 }, (_, value) => (
              <option key={value} value={value}>{value === 0 ? "Unknown" : `${value} / 4`}</option>
            ))}
          </SelectField>

          <div className="compact-control">
            <label className="control-label" htmlFor="duration_ms">Duration</label>
            <span className="control-help" id="duration_ms-help">
              Milliseconds · {formatDuration(Number(draft.duration_ms))}
            </span>
            <input
              className="number-input"
              id="duration_ms"
              type="number"
              min="1"
              max="6000000"
              step="1000"
              value={draft.duration_ms}
              aria-describedby={`duration_ms-help${errors.duration_ms ? " duration_ms-error" : ""}`}
              aria-invalid={errors.duration_ms ? "true" : undefined}
              onChange={(event) => setValue("duration_ms", event.target.value)}
            />
            {errors.duration_ms ? (
              <span className="field-error" id="duration_ms-error">{errors.duration_ms}</span>
            ) : null}
          </div>

          <RangeControl
            definition={ADVANCED_RANGES[4]}
            value={draft.popularity}
            error={errors.popularity}
            onChange={setValue}
          />

          <label className="checkbox-control" htmlFor="explicit">
            <input
              id="explicit"
              type="checkbox"
              checked={draft.explicit}
              onChange={(event) => onChange({ ...draft, explicit: /* BLANK 06 */ event.target.defaultChecked })}
            />
            <span>
              <strong>Explicit content</strong>
              <small>Whether Spotify marks the track as explicit.</small>
            </span>
          </label>
        </div>
      </details>
    </section>
  );
}
