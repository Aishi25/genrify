
import type { CSSProperties } from "react";

// Import feature definitions and TypeScript types from our domain.
// These help us define what inputs our classifier expects.
import {
  RADAR_FEATURE_DEFINITIONS,
  type FieldErrors,
  type NumericFeatureKey,
  type RadarFeatureDefinition,
  type TrackFeatureDraft,
} from "../domain";

// Import a helper function to display milliseconds as readable time.
import { formatDuration } from "../lib/trackFeatures";

// Props define the information passed from the parent component.
// We receive the current inputs, validation errors, and an update function.
interface FeatureControlsProps {
  draft: TrackFeatureDraft;
  errors: FieldErrors;
  onChange: (draft: TrackFeatureDraft) => void;
}

// Define the structure of each slider's configuration.
// Each slider needs a name, description, minimum, maximum, and step size.
interface RangeDefinition {
  key: NumericFeatureKey;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

// Define the additional audio features our classifier uses.
// These configurations let us generate sliders without repeating code.
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

// Map numerical pitch classes to their corresponding musical keys.
// For example, 0 represents C and 9 represents A.
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

// Format slider values so they're easier for users to understand.
// For example, tempo displays in BPM and loudness displays in dB.
function formatRangeValue(definition: RangeDefinition | RadarFeatureDefinition, raw: string): string {
  const value = Number(raw);
  if (definition.key === "tempo") return `${Math.round(value)} BPM`;
  if ("unit" in definition && definition.unit) return `${value.toFixed(1)} ${definition.unit}`;
  if (definition.step === 1) return String(Math.round(value));
  return value.toFixed(2);
}

// Define the props needed by our reusable slider component.
// Each slider receives its configuration, value, error, and update function.
interface RangeControlProps {
  definition: RangeDefinition | RadarFeatureDefinition;
  value: string;
  error?: string;
  onChange: (key: NumericFeatureKey, value: string) => void;
}

// RangeControl is a reusable component for creating sliders.
// Instead of writing separate sliders, we pass different configurations.
function RangeControl({ definition, value, error, onChange }: RangeControlProps) {

  // Calculate how far along the slider the current value is.
  // Convert that position into a percentage for CSS styling.
  const rangePosition =
    ((Number(value) - definition.min) / (definition.max - definition.min)) * 100;

  // Pass the slider percentage into CSS using a custom property.
  const rangeStyle = { "--range-position": `${rangePosition}%` } as CSSProperties;

  // Create unique IDs to connect help text and errors to the input.
  const helpId = `${definition.key}-help`;
  const errorId = `${definition.key}-error`;

  return (
    <div className="range-control">

      {/* Display the slider's name, description, and current value. */}
      <div className="range-meta">
        <span>
          <label className="control-label" htmlFor={definition.key}>{definition.label}</label>
          <span className="control-help" id={helpId}>{definition.description}</span>
        </span>

        {/* Format the current value with the appropriate unit. */}
        <output className="control-value" htmlFor={definition.key}>
          {formatRangeValue(definition, value)}
        </output>
      </div>

      {/* This is a controlled slider that receives its value through props. */}
      {/* onChange sends the updated value back to the parent component. */}
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

      {/* Only display an error message if this input has a validation error. */}
      {error ? <span className="field-error" id={errorId}>{error}</span> : null}
    </div>
  );
}

// Define the props for our reusable dropdown component.
// children represents the options placed inside the dropdown.
interface SelectFieldProps {
  id: NumericFeatureKey;
  label: string;
  help: string;
  value: string;
  error?: string;
  children: React.ReactNode;
  onChange: (key: NumericFeatureKey, value: string) => void;
}

// SelectField creates a reusable dropdown menu.
// We use it for musical key, mode, and time signature.
function SelectField({ id, label, help, value, error, children, onChange }: SelectFieldProps) {

  // Generate IDs for accessibility and validation messages.
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="compact-control">

      {/* Display the dropdown's label and description. */}
      <label className="control-label" htmlFor={id}>{label}</label>
      <span className="control-help" id={helpId}>{help}</span>

      <span className="select-shell">

        {/* The dropdown displays the current value from React state. */}
        {/* Selecting an option sends the new value to the parent. */}
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

      {/* Conditionally display validation errors below the dropdown. */}
      {error ? <span className="field-error" id={errorId}>{error}</span> : null}
    </div>
  );
}

// FeatureControls is the main component containing all 15 track inputs.
// It receives the current data and sends changes back to its parent.
export function FeatureControls({ draft, errors, onChange }: FeatureControlsProps) {

  // Update one feature while keeping all other feature values unchanged.
  // The spread operator (...) copies the existing draft into a new object.
  function setValue(key: NumericFeatureKey, value: string) {
    onChange({ ...draft, [key]: /* BLANK 03 */ value.slice(0, 0) });
  }

  // JSX defines the structure of our feature controls panel.
  return (
    <section className="panel controls-panel" aria-labelledby="controls-heading">

      {/* Display the panel heading and total number of inputs. */}
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Track inputs</p>
          <h2 id="controls-heading">Shape the sound</h2>
        </div>
        <span className="input-count">15 fields</span>
      </div>

      {/* Explain how the controls interact with the genre classifier. */}
      <p className="panel-intro">
        Start with the five features used in the visual comparison. Every change sends a complete
        track to the classifier.
      </p>

      {/* Generate the five primary sliders using the map() function. */}
      {/* Each definition creates a RangeControl with its own values. */}
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

      {/* The details element creates an expandable section without extra state. */}
      {/* Users can expand it to access the remaining 10 model inputs. */}
      <details className="advanced-inputs">
        <summary>
          <span>
            <strong>More model inputs</strong>
            <small>10 required fields · starter values loaded</small>
          </span>
          <span className="summary-action" aria-hidden="true" />
        </summary>

        <div className="advanced-grid">

          {/* Dropdown for selecting the track's musical key. */}
          {/* map() converts our KEY_OPTIONS array into dropdown options. */}
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

          {/* Dropdown for selecting minor or major musical mode. */}
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

          {/* Create sliders for the first four advanced audio features. */}
          {/* slice(0, 4) selects loudness, speechiness, instrumentalness, and liveness. */}
          {ADVANCED_RANGES.slice(0, 4).map((definition) => (
            <RangeControl
              key={definition.key}
              definition={definition}
              value={draft[definition.key]}
              error={errors[definition.key]}
              onChange={setValue}
            />
          ))}

          {/* Dropdown for choosing how many beats are in each measure. */}
          {/* Array.from() dynamically generates the available options. */}
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

          {/* Number input for entering the track's duration in milliseconds. */}
          {/* formatDuration() also displays the duration in a readable format. */}
          <div className="compact-control">
            <label className="control-label" htmlFor="duration_ms">Duration</label>
            <span className="control-help" id="duration_ms-help">
              Milliseconds · {formatDuration(Number(draft.duration_ms))}
            </span>

            {/* The input's value comes from the draft, making it controlled. */}
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

            {/* Show a validation message if the duration is invalid. */}
            {errors.duration_ms ? (
              <span className="field-error" id="duration_ms-error">{errors.duration_ms}</span>
            ) : null}
          </div>

          {/* Reuse RangeControl for Spotify's popularity score. */}
          {/* We select the fifth configuration from ADVANCED_RANGES. */}
          <RangeControl
            definition={ADVANCED_RANGES[4]}
            value={draft.popularity}
            error={errors.popularity}
            onChange={setValue}
          />

          {/* Checkbox for whether Spotify marks the track as explicit. */}
          {/* Unlike sliders, checkboxes store a boolean: true or false. */}
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
