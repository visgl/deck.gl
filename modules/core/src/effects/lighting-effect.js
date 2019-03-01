import Effect from '../lib/effect';
import {projectPosition} from '../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../lib';
import {PointLight as BasePointLight} from 'luma.gl';

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

  getParameters(layer) {
    const {ambientLight, directionalLights} = this;
    const pointLights = this.getProjectedPointLights(layer);
    return {
      lightSources: {ambientLight, directionalLights, pointLights}
    };
  }

  getProjectedPointLights(layer) {
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin} = layer.props;
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
