import {DirectionalLight} from './directional-light';
import {getSunlightDirection} from './suncalc';

export default class SunLight extends DirectionalLight {
  constructor({timestamp, ...others}) {
    super(others);

    this.timestamp = timestamp;
  }

  getProjectedLight({layer}) {
    const {viewport} = layer.context;
    const isGlobe = viewport.resolution > 0;

    if (isGlobe) {
      // Rotate vector to align with the direction of the globe projection (up at lon:0,lat:0 is [0, -1, 0])
      const [x, y, z] = getSunlightDirection(this.timestamp, 0, 0);
      this.direction = [x, -z, y];
    } else {
      const {latitude, longitude} = viewport;
      this.direction = getSunlightDirection(this.timestamp, latitude, longitude);
    }

    return this;
  }
}
