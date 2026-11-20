// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Matrix4} from '@math.gl/core';
import type {Matrix4Like} from '@math.gl/core';

/** Radical inverse used by the temporal jitter sequence. */
export function halton(index: number, base: number): number {
  let result = 0;
  let fraction = 1;
  while (index > 0) {
    fraction /= base;
    result += fraction * (index % base);
    index = Math.floor(index / base);
  }
  return result;
}

/** FSR 2 jitter phase count, based on the actual rounded render width. */
export function getJitterPhaseCount(outputWidth: number, renderWidth: number): number {
  return Math.max(1, Math.ceil(8 * (outputWidth / renderWidth) ** 2));
}

/** Top-left-origin jitter in render pixels. */
export function getTemporalJitter(frameIndex: number, phaseCount: number): [number, number] {
  const index = (frameIndex % phaseCount) + 1;
  return [halton(index, 2) - 0.5, halton(index, 3) - 0.5];
}

/** Maps unjittered current GL clip coordinates to previous GL clip coordinates in float64. */
export function getReprojectionMatrix(
  current: Matrix4Like | number[],
  previous: Matrix4Like | number[]
): Matrix4 {
  // Exact identity avoids numerical noise for stationary cameras, even at large world offsets.
  if (Array.from(current).every((value, index) => value === previous[index])) {
    return new Matrix4();
  }
  return new Matrix4(previous).multiplyRight(new Matrix4(current).invert());
}

/**
 * The rectangle of a CSS viewport in a scene target, in target pixels with a top-left origin.
 * The values can be fractions. The rectangle is not clipped to the target: clipping changes the
 * projection of a viewport that is partly outside the canvas.
 */
export function getTemporalViewportRect(
  viewport: {x: number; y: number; width: number; height: number},
  pixelRatio: number
): [number, number, number, number] {
  return [
    viewport.x * pixelRatio,
    viewport.y * pixelRatio,
    viewport.width * pixelRatio,
    viewport.height * pixelRatio
  ];
}
