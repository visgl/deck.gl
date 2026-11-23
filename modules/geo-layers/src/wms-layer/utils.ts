// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import {lngLatToWorld, pixelsToWorld} from '@math.gl/geospatial/web-mercator';

// https://epsg.io/3857
// +proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs
const HALF_EARTH_CIRCUMFERENCE = 6378137 * Math.PI;

/** Projects EPSG:4326 to EPSG:3857
 * This is a lightweight replacement of proj4. Use tests to ensure conformance.
 */
export function WGS84ToPseudoMercator(coord: [number, number]): [number, number] {
  const mercator = lngLatToWorld(coord);
  mercator[0] = (mercator[0] / 256 - 1) * HALF_EARTH_CIRCUMFERENCE;
  mercator[1] = (mercator[1] / 256 - 1) * HALF_EARTH_CIRCUMFERENCE;
  return mercator;
}

/** Number of subdivisions per edge when sampling the viewport in projected coordinates. */
const EDGE_SEGMENTS = 8;

/** Get the visible ground bounds directly in the viewport's CRS units. */
export function getProjectedViewportBounds(
  viewport: CustomProjectionViewport
): [number, number, number, number] | null {
  const {width, height, pixelUnprojectionMatrix} = viewport;
  let top = 0;
  let bottom = height;
  // At high pitch the visible ground ends at the far plane, below the horizon.
  // CustomProjectionViewport's clip planes change ground height along screen Y only.
  for (const depth of [-1, 1]) {
    const topZ = -depth * pixelsToWorld([0, 0, depth], pixelUnprojectionMatrix)[2];
    const bottomZ = -depth * pixelsToWorld([0, height, depth], pixelUnprojectionMatrix)[2];
    if (topZ < 0 && bottomZ < 0) return null;
    if (topZ < 0) top = Math.max(top, (height * topZ) / (topZ - bottomZ));
    if (bottomZ < 0) bottom = Math.min(bottom, (height * topZ) / (topZ - bottomZ));
  }
  if (top >= bottom) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < EDGE_SEGMENTS; i++) {
    const x = (i / EDGE_SEGMENTS) * width;
    const y = (i / EDGE_SEGMENTS) * (bottom - top);
    for (const pixel of [
      [x, top],
      [width, top + y],
      [width - x, bottom],
      [0, bottom - y]
    ]) {
      const [crsX, crsY] = viewport.unprojectFlat(pixelsToWorld(pixel, pixelUnprojectionMatrix, 0));
      if (Number.isFinite(crsX) && Number.isFinite(crsY)) {
        minX = Math.min(minX, crsX);
        minY = Math.min(minY, crsY);
        maxX = Math.max(maxX, crsX);
        maxY = Math.max(maxY, crsY);
      }
    }
  }

  const [[left, bottomBound], [right, topBound]] = viewport.crs.renderingBounds;
  if (Number.isFinite(left)) minX = Math.max(minX, left);
  if (Number.isFinite(bottomBound)) minY = Math.max(minY, bottomBound);
  if (Number.isFinite(right)) maxX = Math.min(maxX, right);
  if (Number.isFinite(topBound)) maxY = Math.min(maxY, topBound);
  return minX < maxX && minY < maxY ? [minX, minY, maxX, maxY] : null;
}
