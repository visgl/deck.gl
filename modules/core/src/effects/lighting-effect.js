import {AmbientLight, PointLight, DirectionalLight} from '@luma.gl/core';
import Effect from '../lib/effect';
import {projectPosition} from '../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../lib';

const DefaultAmbientLightProps = {color: [255, 255, 255], intensity: 1.0};
const DefaultDirectionalLightProps = [
  {
    color: [255, 255, 255],
    intensity: 1.0,
    direction: [-1, -3, -1]
  },
  {
    color: [255, 255, 255],
    intensity: 0.9,
    direction: [1, 8, -2.5]
  }
];

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
    this.applyDefaultLights();
  }

  getParameters(layer) {
    const {ambientLight, directionalLights} = this;
    const pointLights = this.getProjectedPointLights(layer);
    return {
      lightSources: {ambientLight, directionalLights, pointLights}
    };
  }

  // Private
  applyDefaultLights() {
    const {ambientLight, pointLights, directionalLights} = this;
    if (!ambientLight && pointLights.length === 0 && directionalLights.length === 0) {
      this.ambientLight = new AmbientLight(DefaultAmbientLightProps);
      this.directionalLights.push(new DirectionalLight(DefaultDirectionalLightProps[0]));
      this.directionalLights.push(new DirectionalLight(DefaultDirectionalLightProps[1]));
    }
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
