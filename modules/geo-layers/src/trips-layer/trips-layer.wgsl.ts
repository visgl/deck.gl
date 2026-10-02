// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {NumericArray} from '@math.gl/core';

/** Pack timestamps in the same padded instance order used by PathTesselator. */
export function packTripTimestamps(
  timestamps: NumericArray,
  instanceCount: number = timestamps.length,
  isLoop: boolean = false
): Float32Array {
  const packedTimestamps = new Float32Array(instanceCount * 2);

  if (timestamps.length === 0) {
    return packedTimestamps;
  }

  const isClosed = instanceCount > timestamps.length;
  const cycleLength = isLoop ? timestamps.length : Math.max(timestamps.length - 1, 1);

  for (let index = 0; index < instanceCount; index++) {
    const timestampIndex = isClosed ? index % cycleLength : Math.min(index, timestamps.length - 1);
    const nextTimestampIndex = isClosed
      ? (timestampIndex + 1) % cycleLength
      : Math.min(timestampIndex + 1, timestamps.length - 1);

    packedTimestamps[index * 2] = timestamps[timestampIndex];
    packedTimestamps[index * 2 + 1] = timestamps[nextTimestampIndex];
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

  let tripsPathProgress =
#ifdef DASH_ENABLED
    // Camera clipping shortens the visible geometry, but trip time still follows the original segment.
    varyings.vDashSegment.x / varyings.vDashSegment.y;
#else
    varyings.vPathPosition.y / varyings.vPathLength;
#endif

  varyings.vTime = mix(
    attributes.instanceTimestamps.x,
    attributes.instanceTimestamps.y,
    tripsPathProgress
  );

  if (trips.fadeTrail > 0.5) {
    varyings.vColor.a *=
      1.0 - (trips.currentTime - varyings.vTime) / trips.trailLength;
  }`,

  '  // DECKGL_FILTER_COLOR': /* wgsl */ `
  if (
    varyings.vTime > trips.currentTime ||
    (trips.fadeTrail > 0.5 && varyings.vTime < trips.currentTime - trips.trailLength)
  ) {
    discard;
  }`
} as const;
