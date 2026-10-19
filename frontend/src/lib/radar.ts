import {
  RADAR_FEATURE_DEFINITIONS,
  type FeatureValues,
  type RadarFeatureKey,
} from "../domain";

export const RADAR_CENTER = 160;
export const RADAR_RADIUS = 108;

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeFeature(key: RadarFeatureKey, value: number): number {
  return key === "tempo" ? clamp(value / 250) : clamp(value);
}

export function radarPoint(index: number, value: number, radius = RADAR_RADIUS) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / RADAR_FEATURE_DEFINITIONS.length;
  return {
    x: RADAR_CENTER + Math.cos(angle) * radius * value,
    y: RADAR_CENTER + Math.sin(angle) * radius * value,
  };
}

function formatPoint({ x, y }: { x: number; y: number }): string {
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

export function radarPolygonPoints(values: FeatureValues): string {
  return RADAR_FEATURE_DEFINITIONS.map((feature, index) =>
    formatPoint(radarPoint(index, normalizeFeature(feature.key, values[feature.key]))),
  ).join(" ");
}

export function radarGridPoints(level: number): string {
  return RADAR_FEATURE_DEFINITIONS.map((_, index) =>
    formatPoint(radarPoint(index, clamp(level))),
  ).join(" ");
}

export function radarAxisEnd(index: number, radius = RADAR_RADIUS) {
  return radarPoint(index, 1, radius);
}
