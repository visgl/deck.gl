/* eslint-disable camelcase */
import {PointLight} from './point-light';
import {getUniformsFromViewport} from '../../shaderlib/project/viewport-uniforms';
import type Layer from '../../lib/layer';
import {NumArray16} from '../../shaderlib/misc/uniform-types';

export default class CameraLight extends PointLight {
  getProjectedLight({layer}: {layer: Layer}): PointLight {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin, modelMatrix} = layer.props;
    const {cameraPosition} = getUniformsFromViewport({
      viewport,
      modelMatrix: modelMatrix as NumArray16,
      coordinateSystem,
      coordinateOrigin
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = cameraPosition;
    return projectedLight;
  }
}
