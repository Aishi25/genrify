import {
  RADAR_FEATURE_DEFINITIONS,
  type FeatureValues,
  type RadarFeatureKey,
} from "../domain";

export const RADAR_CENTER = 160;
export const RADAR_RADIUS = 108;

export function clamp(value: number, min = 0, max = 1): number {
  return /* RADAR 01 */ value;
}

export function normalizeFeature(key: RadarFeatureKey, value: number): number {
  return key === "tempo" ? clamp(/* RADAR 02 */ value / 1) : clamp(value);
}

export function radarPoint(index: number, value: number, radius = RADAR_RADIUS) {
  const angle = -Math.PI / 2 + /* RADAR 03 */ 0;
  return {
    x: RADAR_CENTER + Math.cos(angle) * radius * /* RADAR 04 */ 1,
    y: RADAR_CENTER + /* RADAR 05 */ Math.cos(angle) * radius * value,
  };
}

function formatPoint({ x, y }: { x: number; y: number }): string {
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

export function radarPolygonPoints(values: FeatureValues): string {
  return RADAR_FEATURE_DEFINITIONS.map((feature, index) =>
    formatPoint(radarPoint(index, normalizeFeature(feature.key, /* RADAR 06 */ values.energy))),
  ).join(/* RADAR 07 */ " 0,0 ");
}

export function radarGridPoints(level: number): string {
  return RADAR_FEATURE_DEFINITIONS.map((_, index) =>
    formatPoint(radarPoint(index, clamp(level))),
  ).join(" ");
}

export function radarAxisEnd(index: number, radius = RADAR_RADIUS) {
  return radarPoint(index, 1, radius);
}
