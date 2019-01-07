import {PointLight} from 'luma.gl';
import Effect from '../experimental/lib/effect';
import {projectPosition} from '../shaderlib/project/project-functions';

export default class LightingEffect extends Effect {
  constructor(props) {
    super();
    this.ambientLight = undefined;
    this.directionalLights = [];
    this.pointLights = [];

    for (const key in props) {
      const lightSource = props[key];

      switch (lightSource.constructor.name) {
        case 'AmbientLight':
          this.ambientLight = lightSource;
          break;

        case 'DirectionalLight':
          this.directionalLights.push(lightSource);
          break;

        case 'PointLight':
          this.pointLights.push(lightSource);
          break;
        default:
      }
    }
  }

  // Pre-project point light positions
  getProjectedPointLights({
    viewport,
    modelMatrix,
    coordinateSystem,
    coordinateOrigin,
    fromCoordinateSystem,
    fromCoordinateOrigin
  }) {
    const projectionParameters = {
      viewport,
      modelMatrix,
      coordinateSystem,
      coordinateOrigin,
      fromCoordinateSystem,
      fromCoordinateOrigin
    };

    const projectedPointLights = [];
    for (let i = 0; i < this.pointLights.length; i++) {
      const pointLight = this.pointLights[i];
      const position = projectPosition(pointLight.position, projectionParameters);
      projectedPointLights.push(
        new PointLight({
          color: pointLight.color,
          intensity: pointLight.intensity,
          position
        })
      );
    }

    return projectedPointLights;
  }
}
