// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {WGS84_CRS} from '../../utils/crs';
import {getWorldPosition} from '../../shaderlib/project/project-functions';
import {getOffsetOrigin} from '../../shaderlib/project/viewport-uniforms';
import * as vec3 from '@math.gl/core/vec3';

import type Layer from '../../lib/layer';

const DEFAULT_LIGHT_COLOR = [255, 255, 255] as [number, number, number];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_ATTENUATION = [1, 0, 0] as [number, number, number];
const DEFAULT_LIGHT_POSITION = [0.0, 0.0, 1.0] as [number, number, number];

let idCount = 0;

export type PointLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: [number, number, number];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
  /** Light position [x, y, z] in the common space
   * @default [0.0, 0.0, 1.0]
   */
  position?: [number, number, number];
  /** Light attenuation
   * @default [1.0, 0.0, 0.0]
   */
  attenuation?: [number, number, number];
};

export class PointLight {
  id: string;
  color: [number, number, number];
  intensity: number;
  type = 'point' as const;
  position: [number, number, number];
  attenuation: [number, number, number];

  protected projectedLight: PointLight;

  constructor(props: PointLightOptions = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;
    const {position = DEFAULT_LIGHT_POSITION} = props;

    this.id = props.id || `point-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = 'point';
    this.position = position;
    this.attenuation = getAttenuation(props);
    this.projectedLight = {...this};
  }

  getProjectedLight({layer}: {layer: Layer}): PointLight {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin} = layer.props;
    const {offsetMode, commonOrigin, geospatialOrigin, shaderCoordinateOrigin} = getOffsetOrigin(
      viewport,
      coordinateSystem,
      coordinateOrigin,
      layer.internalState!.sourceCrs
    );
    // Lights have their own coordinates but share the receiving shader's altitude
    // convention and common origin. Layer transforms apply only to the geometry.
    const position = getWorldPosition(this.position, {
      viewport,
      sourceCrs: viewport.isGeospatial ? WGS84_CRS : null,
      coordinateSystem: viewport.isGeospatial ? 'lnglat' : 'cartesian',
      coordinateOrigin: [0, 0, 0],
      modelMatrix: null,
      offsetMode
    });
    if (offsetMode) {
      const origin =
        commonOrigin || viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
      vec3.sub(position, position, origin);
    }
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = position;
    return projectedLight;
  }
}

function getAttenuation(props: PointLightOptions): [number, number, number] {
  if (props.attenuation) {
    return props.attenuation;
  }
  return DEFAULT_ATTENUATION;
}
