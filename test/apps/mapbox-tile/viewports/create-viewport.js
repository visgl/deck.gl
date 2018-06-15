import {WebMercatorViewport} from 'deck.gl';

// CONSTANTS
const PI = Math.PI;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;

export default projectionRaw => {
  class CustomViewport extends WebMercatorViewport {
    // Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
    _projectFlat([lng, lat], scale) {
      scale = (scale || this.scale) * TILE_SIZE / 2 / PI;
      const lambda = lng * DEGREES_TO_RADIANS;
      const phi = lat * DEGREES_TO_RADIANS;
      const p = projectionRaw(lambda, phi);

      const x = scale * (p[0] + PI);
      const y = scale * (PI - p[1]);
      return [x, y];
    }

    // Unproject world point [x,y] on map onto {lat, lon} on sphere
    _unprojectFlat([x, y], scale) {
      scale = (scale || this.scale) * TILE_SIZE / 2 / PI;
      const lambda2 = x / scale - PI;
      const phi2 = PI - y / scale;

      const [lambda, phi] = projectionRaw.invert(lambda2, phi2);

      return [lambda * RADIANS_TO_DEGREES, phi * RADIANS_TO_DEGREES];
    }
  }

  return CustomViewport;
};
