// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import lightingShader from './lighting.glsl';
import project from '../project/project';
import {COORDINATE_SYSTEM} from '../../lib/constants';
import vec4_transformMat4 from 'gl-vec4/transformMat4';
import vec3_sub from 'gl-vec3/subtract';

export default {
  name: 'lighting',
  dependencies: [project],
  vs: lightingShader,
  getUniforms
};

const INITIAL_MODULE_OPTIONS = {};

const DEFAULT_LIGHTS_POSITION = [-122.45, 37.75, 8000];
const DEFAULT_LIGHTS_STRENGTH = [2.0, 0.0];
const DEFAULT_AMBIENT_RATIO = 0.05;
const DEFAULT_DIFFUSE_RATIO = 0.6;
const DEFAULT_SPECULAR_RATIO = 0.8;

function getUniforms(opts = INITIAL_MODULE_OPTIONS) {
  if (!opts.lightSettings) {
    return {};
  }

  const {
    numberOfLights = 1,

    lightsPosition = DEFAULT_LIGHTS_POSITION,
    lightsStrength = DEFAULT_LIGHTS_STRENGTH,
    coordinateSystem = COORDINATE_SYSTEM.LNGLAT,
    coordinateOrigin = [0, 0, 0],
    modelMatrix = null,

    ambientRatio = DEFAULT_AMBIENT_RATIO,
    diffuseRatio = DEFAULT_DIFFUSE_RATIO,
    specularRatio = DEFAULT_SPECULAR_RATIO
  } = opts.lightSettings;

  const projectionParameters = {
    viewport: opts.viewport,
    coordinateSystem,
    coordinateOrigin,
    layerCoordinateSystem: opts.coordinateSystem,
    layerCoordinateOrigin: opts.coordinateOrigin,
    modelMatrix
  };

  const lightsPositionWorld = [];
  for (let i = 0; i < numberOfLights; i++) {
    const position = preProject(lightsPosition.slice(i * 3, i * 3 + 3), projectionParameters);

    lightsPositionWorld[i * 3] = position[0];
    lightsPositionWorld[i * 3 + 1] = position[1];
    lightsPositionWorld[i * 3 + 2] = position[2];
  }

  return {
    lighting_lightPositions: lightsPositionWorld,
    lighting_lightStrengths: lightsStrength,
    lighting_ambientRatio: ambientRatio,
    lighting_diffuseRatio: diffuseRatio,
    lighting_specularRatio: specularRatio,
    lighting_numberOfLights: numberOfLights
  };
}

/* Projection utils */

function lngLatZToWorldPosition(lngLatZ, viewport) {
  const [X, Y] = viewport.projectFlat(lngLatZ);
  const Z = (lngLatZ[2] || 0) * viewport.scale;
  return [X, Y, Z];
}

function preProject(
  position,
  {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    modelMatrix,
    layerCoordinateSystem,
    layerCoordinateOrigin
  }
) {
  let [x, y, z] = position;
  let worldPosition;

  if (modelMatrix) {
    [x, y, z] = vec4_transformMat4([], [x, y, z, 1.0], modelMatrix);
  }

  // pre-project light coordinates
  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT:
      worldPosition = lngLatZToWorldPosition([x, y, z], viewport);
      break;

    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      worldPosition = lngLatZToWorldPosition(
        [x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)],
        viewport
      );
      break;

    case COORDINATE_SYSTEM.METER_OFFSETS:
      worldPosition = lngLatZToWorldPosition(
        viewport.addMetersToLngLat(coordinateOrigin, [x, y, z]),
        viewport
      );
      break;

    default:
      worldPosition = [x, y, z];
  }

  switch (layerCoordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
    case COORDINATE_SYSTEM.METER_OFFSETS:
      const originWorld = lngLatZToWorldPosition(layerCoordinateOrigin, viewport);
      vec3_sub(worldPosition, worldPosition, originWorld);
      break;

    default:
  }

  return worldPosition;
}
