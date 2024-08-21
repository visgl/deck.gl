/**
 * Adapted from d3-hexbin
 * Copyright Mike Bostock, 2012-2016
   All rights reserved.
 * https://github.com/d3/d3-hexbin/blob/master/src/hexbin.js
 */
const THIRD_PI = Math.PI / 3;
const DIST_X = 2 * Math.sin(THIRD_PI);
const DIST_Y = 1.5;

type HexBin = [i: number, j: number];
type Point = [x: number, y: number];

export const HexbinVertices = Array.from({length: 6}, (_, i) => {
  const angle = i * THIRD_PI;
  return [Math.sin(angle), -Math.cos(angle)];
});

/** Returns the hexbin that a point (x,y) falls into */
export function pointToHexbin([px, py]: Point, radius: number): HexBin {
  let pj = Math.round((py = py / radius / DIST_Y));
  let pi = Math.round((px = px / radius / DIST_X - (pj & 1) / 2));
  const py1 = py - pj;

  if (Math.abs(py1) * 3 > 1) {
    const px1 = px - pi;
    const pi2 = pi + (px < pi ? -1 : 1) / 2;
    const pj2 = pj + (py < pj ? -1 : 1);
    const px2 = px - pi2;
    const py2 = py - pj2;
    if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) {
      pi = pi2 + (pj & 1 ? 1 : -1) / 2;
      pj = pj2;
    }
  }
  return [pi, pj];
}

export function getHexbinCentroid([i, j]: HexBin, radius: number): Point {
  return [(i + (j & 1) / 2) * radius * DIST_X, j * radius * DIST_Y];
}
