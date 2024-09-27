// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable camelcase */
import type {NumberArray16} from '@math.gl/types';
import {PointLight} from './point-light';
import {getUniformsFromViewport} from '../../shaderlib/project/viewport-uniforms';
import type Layer from '../../lib/layer';

export default class CameraLight extends PointLight {
  getProjectedLight({layer}: {layer: Layer}): PointLight {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin, modelMatrix} = layer.props;
    const {cameraPosition} = getUniformsFromViewport({
      viewport,
      modelMatrix: modelMatrix as NumberArray16,
      coordinateSystem,
      coordinateOrigin
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = cameraPosition;
    return projectedLight;
  }
}
