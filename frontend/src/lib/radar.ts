import {
  RADAR_FEATURE_DEFINITIONS,
  type FeatureValues,
  type RadarFeatureKey,
} from "../domain";

// The SVG is 320 by 320 units, so its center is at (160, 160).
export const RADAR_CENTER = 160;
// The outer ring is 108 units from the center, leaving space for labels.
export const RADAR_RADIUS = 108;

// Keep each value between the requested minimum and maximum.
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

// Scale Tempo to the chart's 0-to-1 range while keeping the original BPM for the API.
export function normalizeFeature(key: RadarFeatureKey, value: number): number {
  return key === "tempo" ? clamp(value / 250) : clamp(value);
}

export function radarPoint(index: number, value: number, radius = RADAR_RADIUS) {
  // Give each feature an evenly spaced angle, starting with the first spoke at the top.
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / RADAR_FEATURE_DEFINITIONS.length;
  // Use the angle and scaled feature value to place the point on the screen.
  return {
    x: RADAR_CENTER + Math.cos(angle) * radius * value,
    y: RADAR_CENTER + Math.sin(angle) * radius * value,
  };
}

// SVG needs each coordinate pair as x,y; rounding keeps the point text short.
function formatPoint({ x, y }: { x: number; y: number }): string {
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

// Read each feature in order and join its coordinate pair into the polygon's point string.
export function radarPolygonPoints(values: FeatureValues): string {
  return RADAR_FEATURE_DEFINITIONS.map((feature, index) =>
    formatPoint(radarPoint(index, normalizeFeature(feature.key, values[feature.key]))),
  ).join(" ");
}

// Equal values on all five axes create one background ring at the requested size.
export function radarGridPoints(level: number): string {
  return RADAR_FEATURE_DEFINITIONS.map((_, index) =>
    formatPoint(radarPoint(index, clamp(level))),
  ).join(" ");
}

// A full-size point marks the end of a spoke; a larger radius places its label farther out.
export function radarAxisEnd(index: number, radius = RADAR_RADIUS) {
  return radarPoint(index, 1, radius);
}
