// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Color} from '@deck.gl/core';
import {getCode, getLines, getPolygons} from './marching-squares';

export type Contour = {
  /**
   * Isolines: `threshold` value must be a single `Number`, Isolines are generated based on this threshold value.
   *
   * Isobands: `threshold` value must be an Array of two `Number`s. Isobands are generated using `[threshold[0], threshold[1])` as threshold range, i.e area that has values `>= threshold[0]` and `< threshold[1]` are rendered with corresponding color. NOTE: `threshold[0]` is inclusive and `threshold[1]` is not inclusive.
   */
  threshold: number | number[];

  /**
   * RGBA color array to be used to render the contour.
   * @default [255, 255, 255, 255]
   */
  color?: Color;

  /**
   * Applicable for `Isoline`s only, width of the Isoline in pixels.
   * @default 1
   */
  strokeWidth?: number;

  /** Defines z order of the contour. */
  zIndex?: number;
};

export type ContourLine = {
  vertices: number[][];
  contour: Contour;
};

export type ContourPolygon = {
  vertices: number[][];
  contour: Contour;
};

// Given all the cell weights, generates contours for each threshold.
/* eslint-disable max-depth */
export function generateContours({
  contours,
  getValue,
  xRange,
  yRange
}: {
  contours: Contour[];
  getValue: (x: number, y: number) => number;
  xRange: [number, number];
  yRange: [number, number];
}) {
  const contourLines: ContourLine[] = [];
  const contourPolygons: ContourPolygon[] = [];
  let segmentIndex = 0;
  let polygonIndex = 0;

  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];
    const z = contour.zIndex ?? i;
    const {threshold} = contour;
    for (let x = xRange[0] - 1; x < xRange[1]; x++) {
      for (let y = yRange[0] - 1; y < yRange[1]; y++) {
        // Get the MarchingSquares code based on neighbor cell weights.
        const {code, meanCode} = getCode({
          getValue,
          threshold,
          x,
          y,
          xRange,
          yRange
        });
        const opts = {
          x,
          y,
          z,
          code,
          meanCode
        };
        if (Array.isArray(threshold)) {
          // ISO bands
          const polygons = getPolygons(opts);
          for (const polygon of polygons) {
            contourPolygons[polygonIndex++] = {
              vertices: polygon,
              contour
            };
          }
        } else {
          // ISO lines
          const path = getLines(opts);
          if (path.length > 0) {
            contourLines[segmentIndex++] = {
              vertices: path,
              contour
            };
          }
        }
      }
    }
  }
  return {lines: contourLines, polygons: contourPolygons};
}
/* eslint-enable max-depth */
