/* eslint-disable camelcase */
import {PointLight} from './point-light';
import {getUniformsFromViewport} from '../../shaderlib/project/viewport-uniforms';
import type Layer from '../../lib/layer';

export default class CameraLight extends PointLight {
  getProjectedLight({layer}: {layer: Layer}): PointLight {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin, modelMatrix} = layer.props;
    const {project_uCameraPosition} = getUniformsFromViewport({
      viewport,
      modelMatrix,
      coordinateSystem,
      coordinateOrigin
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = project_uCameraPosition;
    return projectedLight;
  }
}
