// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderPlugin} from '@luma.gl/shaders';
import {tripsUniforms} from './trips-layer-uniforms';

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

/** Extend PathLayer through native WGSL plugin inputs, varyings, and named injection targets. */
export const tripsShaderPluginWGSL: ShaderPlugin = {
  name: 'trips',
  module: tripsUniforms,
  vertexInputs: {instanceTimestamps: 'vec2<f32>'},
  interStageVariables: {vTime: {type: 'f32'}},
  injections: {
    'wgsl:vs:DECKGL_FILTER_PATH_COLOR_VERTEX': /* wgsl */ `
  vTime = mix(instanceTimestamps.x, instanceTimestamps.y, pathPosition.y / pathLength);
  if (trips.fadeTrail > 0.5) {
    (*color).a *= 1.0 - (trips.currentTime - vTime) / trips.trailLength;
  }`,
    'wgsl:fs:DECKGL_FILTER_PATH_COLOR': /* wgsl */ `
  if (vTime > trips.currentTime ||
      (trips.fadeTrail > 0.5 && vTime < trips.currentTime - trips.trailLength)) {
    discard;
  }`
  }
};
