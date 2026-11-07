// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';

/** The metre-sized view coordinates and WebGPU clip depth used by luma screen-space passes. */
export function getSceneBufferCamera(
  viewport: Viewport,
  coordinateOrigin: readonly number[] = [0, 0, 0]
) {
  const unitsPerMeter = viewport.distanceScales.unitsPerMeter;
  const viewUnitsPerMeter =
    unitsPerMeter[2] *
    Math.hypot(viewport.viewMatrix[8], viewport.viewMatrix[9], viewport.viewMatrix[10]);
  const clipConversion = new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 1]);
  const projectionMatrix = new Matrix4(clipConversion)
    .multiplyRight(viewport.projectionMatrix)
    .scale(viewUnitsPerMeter);
  const origin = viewport.projectPosition([...coordinateOrigin]);
  const viewMatrix = new Matrix4()
    .scale(1 / viewUnitsPerMeter)
    .multiplyRight(viewport.viewMatrix)
    .translate(origin)
    .scale(unitsPerMeter);
  const viewProjectionMatrix = new Matrix4(clipConversion).multiplyRight(
    viewport.viewProjectionMatrix
  );
  return {
    projectionMatrix,
    inverseProjectionMatrix: new Matrix4(projectionMatrix).invert(),
    viewMatrix,
    inverseViewMatrix: new Matrix4(viewMatrix).invert(),
    viewProjectionMatrix,
    inverseViewProjectionMatrix: new Matrix4(viewProjectionMatrix).invert(),
    nearPlane:
      viewport.projectionMatrix[14] / viewUnitsPerMeter / (viewport.projectionMatrix[10] - 1),
    farPlane:
      viewport.projectionMatrix[14] / viewUnitsPerMeter / (viewport.projectionMatrix[10] + 1)
  };
}
export type SceneBufferCamera = ReturnType<typeof getSceneBufferCamera>;
