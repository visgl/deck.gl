import Effect from '../lib/effect';

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
      lightSources: {ambientLight, directionalLights, pointLights}
    };
  }
}
