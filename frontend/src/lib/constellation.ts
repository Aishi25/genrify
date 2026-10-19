import { GENRES, type Genre, type GenreProbabilities } from "../domain";

export const CONSTELLATION_CENTER = 160;

/**
 * Probabilities are plotted in a band that starts outside the hub rather than
 * at the centre. Five genres share a total of 1, so a losing genre routinely
 * sits near 0.05 - mapped straight from the centre it collapsed into a few
 * pixels underneath the result label. Starting the band at the hub edge keeps
 * the whole distribution readable while the radius still grows with the value.
 */
export const CONSTELLATION_INNER_RADIUS = 46;
export const CONSTELLATION_OUTER_RADIUS = 124;
export const CONSTELLATION_LABEL_RADIUS = 136;

/** Gridlines at quarters of the band. The scale is fixed: the outer ring is
 *  always 100%, so a shape that grows always means a genre that gained. */
export const CONSTELLATION_RINGS = [0.25, 0.5, 0.75, 1] as const;

function axisAngle(index: number): number {
  return -Math.PI / 2 + (index * Math.PI * 2) / GENRES.length;
}

/** A point `radius` units along the axis for `index`, independent of any value. */
export function constellationRay(index: number, radius: number) {
  const angle = axisAngle(index);
  return {
    x: CONSTELLATION_CENTER + Math.cos(angle) * radius,
    y: CONSTELLATION_CENTER + Math.sin(angle) * radius,
  };
}

/** Maps a 0-1 probability onto the plotted band. */
export function constellationRadius(probability: number): number {
  const value = Math.min(Math.max(probability, 0), 1);
  const band = CONSTELLATION_OUTER_RADIUS - CONSTELLATION_INNER_RADIUS;
  return CONSTELLATION_INNER_RADIUS + value * band;
}

export function constellationPoint(index: number, probability: number) {
  return constellationRay(index, constellationRadius(probability));
}

function formatPoint(point: { x: number; y: number }): string {
  return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
}

export function constellationContour(probabilities: GenreProbabilities): string {
  return GENRES.map((genre, index) =>
    formatPoint(constellationPoint(index, probabilities[genre])),
  ).join(" ");
}

/** The gridline polygon for one ring, given as a fraction of the band. */
export function constellationRingPoints(fraction: number): string {
  const radius = constellationRadius(fraction);
  return GENRES.map((_, index) => formatPoint(constellationRay(index, radius))).join(" ");
}

export function rankProbabilities(probabilities: GenreProbabilities): Array<[Genre, number]> {
  return GENRES.map((genre) => [genre, probabilities[genre]] as [Genre, number]).sort(
    (left, right) => right[1] - left[1],
  );
}
