import {PointLight as BasePointLight} from 'luma.gl';
import Effect from './effect';
import {projectPosition} from '../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../lib';

// Class to manage ambient, point and directional light sources in deck
export default class LightingEffect extends Effect {
  constructor(props) {
    super(props);
    this.ambientLight = null;
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

  prepare() {
    const {ambientLight, directionalLights, pointLights} = this;
    return {
      lightSourcs: {ambientLight, directionalLights, pointLights}
    };
  }

  // Pre-project point light positions
  getProjectedPointLights(viewport, coordinateSystem, coordinateOrigin) {
    const projectedPointLights = [];
    for (let i = 0; i < this.pointLights.length; i++) {
      const pointLight = this.pointLights[i];
      const position = projectPosition(pointLight.position, {
        viewport,
        coordinateSystem,
        coordinateOrigin,
        fromCoordinateSystem: viewport.isGeospatial
          ? COORDINATE_SYSTEM.LNGLAT
          : COORDINATE_SYSTEM.IDENTITY,
        fromCoordinateOrigin: [0, 0, 0]
      });
      projectedPointLights.push(
        new BasePointLight({
          color: pointLight.color,
          intensity: pointLight.intensity,
          position
        })
      );
    }

    return projectedPointLights;
  }
}
