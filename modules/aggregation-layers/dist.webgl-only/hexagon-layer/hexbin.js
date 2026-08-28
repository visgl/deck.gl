// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const THIRD_PI = Math.PI / 3;
const DIST_X = 2 * Math.sin(THIRD_PI);
const DIST_Y = 1.5;
export const HexbinVertices = Array.from({ length: 6 }, (_, i) => {
    const angle = i * THIRD_PI;
    return [Math.sin(angle), -Math.cos(angle)];
});
/**
 * Adapted from d3-hexbin
 * Copyright Mike Bostock, 2012-2016
   All rights reserved.
 * https://github.com/d3/d3-hexbin/blob/master/src/hexbin.js
 *
 * Returns the hexbin that a point (x,y) falls into
 */
export function pointToHexbin([px, py], radius) {
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
export const pointToHexbinGLSL = /* glsl */ `
const vec2 DIST = vec2(${DIST_X}, ${DIST_Y});

ivec2 pointToHexbin(vec2 p, float radius) {
  p /= radius * DIST;
  float pj = round(p.y);
  float pjm2 = mod(pj, 2.0);
  p.x -= pjm2 * 0.5;
  float pi = round(p.x);
  vec2 d1 = p - vec2(pi, pj);

  if (abs(d1.y) * 3. > 1.) {
    vec2 v2 = step(0.0, d1) - 0.5;
    v2.y *= 2.0;
    vec2 d2 = d1 - v2;
    if (dot(d1, d1) > dot(d2, d2)) {
      pi += v2.x + pjm2 - 0.5;
      pj += v2.y;
    }
  }
  return ivec2(pi, pj);
}
`;
export function getHexbinCentroid([i, j], radius) {
    return [(i + (j & 1) / 2) * radius * DIST_X, j * radius * DIST_Y];
}
export const getHexbinCentroidGLSL = `
const vec2 DIST = vec2(${DIST_X}, ${DIST_Y});

vec2 hexbinCentroid(vec2 binId, float radius) {
  binId.x += fract(binId.y * 0.5);
  return binId * DIST * radius;
}
`;
//# sourceMappingURL=hexbin.js.map