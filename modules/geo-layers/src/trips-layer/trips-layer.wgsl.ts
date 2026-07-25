// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {NumericArray} from '@math.gl/core';

/** Pack each path timestamp with the following timestamp for WebGPU instance stepping. */
export function packTripTimestamps(timestamps: NumericArray): Float32Array {
  const packedTimestamps = new Float32Array(timestamps.length * 2);

  for (let index = 0; index < timestamps.length; index++) {
    packedTimestamps[index * 2] = timestamps[index];
    packedTimestamps[index * 2 + 1] = timestamps[index + 1] ?? timestamps[index];
  }

  return packedTimestamps;
}

/** Extend PathLayer's WGSL without duplicating its path geometry or changing its GLSL hooks. */
export const tripsShaderInjectionsWGSL = {
  '  @location(12) rowIndexes: u32,': /* wgsl */ `
  @location(13) instanceTimestamps: vec2<f32>,`,

  '  @location(5) vJointType: f32,': /* wgsl */ `
  @location(6) vTime: f32,`,

  '    attributes.instanceColors.a * layer.opacity\n  );': /* wgsl */ `

  varyings.vTime = mix(
    attributes.instanceTimestamps.x,
    attributes.instanceTimestamps.y,
    varyings.vPathPosition.y / varyings.vPathLength
  );

  if (trips.fadeTrail > 0.5) {
    varyings.vColor.a *=
      1.0 - (trips.currentTime - varyings.vTime) / trips.trailLength;
  }`,

  '  geometry.uv = varyings.vPathPosition;': /* wgsl */ `

  if (
    varyings.vTime > trips.currentTime ||
    (trips.fadeTrail > 0.5 && varyings.vTime < trips.currentTime - trips.trailLength)
  ) {
    discard;
  }`
} as const;
