// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Matrix4} from '@math.gl/core';
import type {Matrix4Like} from '@math.gl/core';
import {PROJECTION_MODE} from '../shaderlib/project/constants';
import {getUniformsFromViewport} from '../shaderlib/project/viewport-uniforms';

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

/** Returns the first overlapping pair after clipping viewport rectangles to the render target. */
export function findTemporalViewportOverlap(
  viewports: {id: string; x: number; y: number; width: number; height: number}[],
  pixelRatio: number,
  size: [number, number]
): [string, string] | null {
  const rectangles = viewports.map(viewport => {
    const [x, y, width, height] = getTemporalViewportRect(viewport, pixelRatio);
    return [
      Math.max(0, x),
      Math.max(0, y),
      Math.min(size[0], x + width),
      Math.min(size[1], y + height)
    ];
  });
  for (let i = 0; i < rectangles.length; i++) {
    for (let j = i + 1; j < rectangles.length; j++) {
      const a = rectangles[i];
      const b = rectangles[j];
      if (
        Math.max(a[0], b[0]) < Math.min(a[2], b[2]) &&
        Math.max(a[1], b[1]) < Math.min(a[3], b[3])
      ) {
        return [viewports[i].id, viewports[j].id];
      }
    }
  }
  return null;
}

/** Converts relative common coordinates to unjittered clip space, composing in float64. */
export function getClipFromCommon(
  viewProjection: Matrix4Like | number[],
  commonOrigin: readonly number[],
  layerDelta: Matrix4 = new Matrix4()
): Matrix4 {
  return new Matrix4(viewProjection).multiplyRight(layerDelta).translate(commonOrigin);
}

/** Snapshot of a layer's rigid transform, copied after drawing an object pass. */
export type LayerTransform = {
  coordinateSystem: import('../lib/constants').CoordinateSystem;
  coordinateOrigin: [number, number, number];
  modelMatrix: Matrix4;
};

/**
 * Affine rigid motion. METER_OFFSETS and CARTESIAN in Mercator use the local linear
 * distance scale; the second-order latitude term is ignored.
 */
export function getLayerMotionDelta(
  viewport: import('../viewports/viewport').default,
  current: LayerTransform,
  previous?: LayerTransform
): Matrix4 {
  if (!previous || current.coordinateSystem !== previous.coordinateSystem) return new Matrix4();
  const system = current.coordinateSystem;
  if (
    system !== 'cartesian' &&
    system !== 'meter-offsets' &&
    !(system === 'default' && !viewport.isGeospatial)
  )
    return new Matrix4();
  const affine = (transform: LayerTransform): Matrix4 => {
    if (system === 'meter-offsets') {
      return new Matrix4()
        .translate(viewport.projectPosition(transform.coordinateOrigin))
        .scale(viewport.getDistanceScales(transform.coordinateOrigin).unitsPerMeter)
        .multiplyRight(transform.modelMatrix);
    }
    const uniforms = getUniformsFromViewport({viewport, ...transform});
    // Recover the affine translation from the shader's origin convention.
    const scale = uniforms.commonUnitsPerWorldUnit;
    const offset = uniforms.commonOrigin.map(
      (value, i) => value - uniforms.coordinateOrigin[i] * scale[i]
    );
    if (viewport.projectionMode === PROJECTION_MODE.WEB_MERCATOR) {
      for (let i = 0; i < 3; i++) offset[i] = uniforms.coordinateOrigin[i] * scale[i];
    }
    return new Matrix4().translate(offset).scale(scale).multiplyRight(transform.modelMatrix);
  };
  return affine(previous).multiplyRight(affine(current).invert());
}
