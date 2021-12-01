import {PointLight} from './point-light';
import {getUniformsFromViewport} from '../../shaderlib/project/viewport-uniforms';

export default class CameraLight extends PointLight {
  getProjectedLight({layer}) {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin, modelMatrix} = layer.props;
    // @ts-expect-error
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
