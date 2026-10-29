// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import WebMercatorViewport from '../../viewports/web-mercator-viewport';
import {PROJECTION_MODE} from './constants';
import {getOffsetOrigin} from './viewport-uniforms';
import * as vec3 from '@math.gl/core/vec3';
import * as vec4 from '@math.gl/core/vec4';
import {addMetersToLngLat} from '@math.gl/web-mercator';
import type {CRSDescriptor} from '@math.gl/projection/core';
import type {CoordinateSystem} from '../../lib/constants';
import type Viewport from '../../viewports/viewport';
import type {NumericArray} from '../../types/types';

/** Explicit inputs for conversion into a rendering reference frame. */
export type ProjectPositionParameters = {
  sourceCrs: CRSDescriptor | null;
  viewport: Viewport;
  modelMatrix: NumericArray | null;
  coordinateOrigin: [number, number, number];
  /** Explicit cartesian and meter-offsets modes take precedence over sourceCrs. */
  coordinateSystem: CoordinateSystem;
  /** Return absolute common space instead of the shader's offset reference. */
  autoOffset?: boolean;
};

// In project.glsl, offset modes calculate z differently from LNG_LAT mode.
// offset modes apply the y adjustment (unitsPerMeter2) when projecting z
// LNG_LAT mode only use the linear scale.
function lngLatZToWorldPosition(
  lngLatZ: [number, number, number],
  viewport: Viewport,
  offsetMode: boolean = false
): [number, number, number] {
  const p = viewport.projectPosition(lngLatZ);

  // TODO - avoid using instanceof
  if (offsetMode && viewport instanceof WebMercatorViewport) {
    const [longitude, latitude, z = 0] = lngLatZ;
    const distanceScales = viewport.getDistanceScales([longitude, latitude]);
    p[2] = z * distanceScales.unitsPerMeter[2];
  }
  return p;
}

/** Convert resolved input coordinates to absolute common space. */
export function getWorldPosition(
  position: number[],
  {
    sourceCrs,
    viewport,
    modelMatrix,
    coordinateOrigin,
    coordinateSystem,
    offsetMode = false
  }: ProjectPositionParameters & {offsetMode?: boolean}
): [number, number, number] {
  let [x, y, z = 0] = position;
  if (modelMatrix) {
    [x, y, z] = vec4.transformMat4([], [x, y, z, 1], modelMatrix);
  }
  switch (coordinateSystem) {
    case 'meter-offsets': {
      if (viewport.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL) {
        const origin = viewport.projectPosition(coordinateOrigin);
        const targetOrigin = viewport.crs!.converter.WGS84.from(coordinateOrigin);
        const {unitsPerMeter} = viewport.getDistanceScales(targetOrigin);
        return [
          origin[0] + x * unitsPerMeter[0],
          origin[1] + y * unitsPerMeter[1],
          origin[2] + z * unitsPerMeter[2]
        ];
      }
      return lngLatZToWorldPosition(
        addMetersToLngLat(coordinateOrigin, [x, y, z]) as [number, number, number],
        viewport,
        offsetMode
      );
    }
    case 'cartesian':
      break;
    default: {
      if (sourceCrs) {
        const input: [number, number, number] = [
          x + coordinateOrigin[0],
          y + coordinateOrigin[1],
          z + (coordinateOrigin[2] || 0)
        ];
        const {preproject} = viewport.getPreprojection(sourceCrs);
        const packed = preproject ? preproject(input) : input;
        if (viewport.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL) {
          return packed.map(
            (value, axis) => value * viewport.distanceScales.unitsPerWorldUnit[axis]
          ) as [number, number, number];
        }
        return lngLatZToWorldPosition(packed, viewport, offsetMode);
      }
    }
  }
  if (viewport.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL) {
    const scale = viewport.distanceScales.unitsPerWorldUnit;
    return [
      (x + coordinateOrigin[0]) * scale[0],
      (y + coordinateOrigin[1]) * scale[1],
      (z + coordinateOrigin[2]) * scale[2]
    ];
  }
  return viewport.isGeospatial
    ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]]
    : viewport.projectPosition([x, y, z]);
}

/** CPU counterpart of project_position, sharing the shader's offset calculation. */
export function projectPosition(
  position: number[],
  params: ProjectPositionParameters
): [number, number, number] {
  const {viewport, sourceCrs, coordinateSystem, coordinateOrigin} = params;
  const offset =
    params.autoOffset === false
      ? null
      : getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin, sourceCrs);
  const commonPosition = getWorldPosition(position, {
    ...params,
    offsetMode: Boolean(offset?.offsetMode)
  });
  if (offset?.offsetMode) {
    const commonOrigin =
      offset.commonOrigin ||
      viewport.projectPosition(offset.geospatialOrigin || offset.shaderCoordinateOrigin);
    vec3.sub(commonPosition, commonPosition, commonOrigin);
  }
  return commonPosition;
}
