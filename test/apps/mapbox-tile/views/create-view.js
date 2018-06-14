import {View, Viewport} from 'deck.gl';
import {Vector3, Matrix4} from 'math.gl';

import {getViewMatrix, getProjectionParameters} from 'viewport-mercator-project';

// CONSTANTS
const PI = Math.PI;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;
// Average circumference (40075 km equatorial, 40007 km meridional)
const EARTH_CIRCUMFERENCE = 40.03e6;

export default (projectionRaw) => {

  class CustomViewport extends BaseGeoViewport {

    _projectRaw(lambda, phi) {
      return projectionRaw(lambda, phi);
    }

    _unprojectRaw(x, y) {
      return projectionRaw.invert(x, y);
    }
  }

  class CustomView extends View {
    constructor(props) {
      super(
        Object.assign({}, props, {
          type: CustomViewport
        })
      );
    }
  }

  return CustomView;
}

class BaseGeoViewport extends Viewport {
  constructor(opts = {}) {
    const {
      latitude = 0,
      longitude = 0,
      zoom = 11,
      pitch = 0,
      bearing = 0,
      farZMultiplier = 10
    } = opts;

    let {width, height, altitude = 1.5} = opts;

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    const {fov, aspect, focalDistance, near, far} = getProjectionParameters({
      width,
      height,
      pitch,
      altitude,
      farZMultiplier
    });

    // The uncentered matrix allows us two move the center addition to the
    // shader (cheap) which gives a coordinate system that has its center in
    // the layer's center position. This makes rotations and other modelMatrx
    // transforms much more useful.
    const viewMatrixUncentered = getViewMatrix({
      height,
      pitch,
      bearing,
      altitude
    });

    // TODO / hack - prevent vertical offsets if not FirstPersonViewport
    const position = opts.position && [opts.position[0], opts.position[1], 0];

    const viewportOpts = Object.assign({}, opts, {
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,
      position,

      // projection matrix parameters
      fovyRadians: fov,
      aspect,
      near,
      far
    });

    super(viewportOpts);

    // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;

    // Determine camera center
    const center2d = this.projectFlat([longitude, latitude]);
    this.center = new Vector3(center2d[0], center2d[1], 0);

    // Make a centered version of the matrix for projection modes without an offset
    this.viewMatrix = new Matrix4()
      // Apply the uncentered view matrix
      .multiplyRight(this.viewMatrixUncentered)
      // The Mercator world coordinate system is upper left,
      // but GL expects lower left, so we flip it around the center after all transforms are done
      .scale([1, -1, 1])
      // And center it
      .translate(new Vector3(this.center || ZERO_VECTOR).negate());

    this._initPixelMatrices();

  }

  _projectRaw() {}

  _unprojectRaw() {}

  // Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
  _projectFlat([lng, lat], scale = this.scale) {
    scale *= TILE_SIZE / 2 / PI;
    const lambda = lng * DEGREES_TO_RADIANS;
    const phi = lat * DEGREES_TO_RADIANS;
    const p = this._projectRaw(lambda, phi);

    const x = scale * (p[0] + PI);
    const y = scale * (PI - p[1]);
    return [x, y];
  }

  // Unproject world point [x,y] on map onto {lat, lon} on sphere
  _unprojectFlat([x, y], scale = this.scale) {
    scale *= TILE_SIZE / 2 / PI;
    const lambda2 = x / scale - PI;
    const phi2 = PI - y / scale;

    const [lambda, phi] = this._unprojectRaw(lambda2, phi2);

    return [lambda * RADIANS_TO_DEGREES, phi * RADIANS_TO_DEGREES];
  }

}
