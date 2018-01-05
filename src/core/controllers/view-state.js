import {Vector3, experimental} from 'math.gl';
const {SphericalCoordinates} = experimental;
import assert from 'assert';

const defaultState = {
  position: [0, 0, 0],
  lookAt: [0, 0, 0],
  up: [0, 0, 1],

  rotationX: 0,
  rotationY: 0,

  fov: 50,
  near: 1,
  far: 100
};

/* Helpers */

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

const DEFAULT_POSITION = [0, 0, 0];

export default class ViewState {
  constructor(opts) {
    const {
      /* Viewport arguments */
      width, // Width of viewport
      height, // Height of viewport

      // Position and orientation
      position = DEFAULT_POSITION, // typically in meters from anchor point

      bearing, // Rotation around y axis
      pitch, // Rotation around x axis

      // Geospatial anchor
      longitude,
      latitude,
      zoom
    } = opts;

    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');

    this._viewportProps = this._applyConstraints(
      Object.assign({}, opts, {
        width,
        height,
        position: new Vector3(
          ensureFinite(position && position[0], defaultState.position[0]),
          ensureFinite(position && position[1], defaultState.position[1]),
          ensureFinite(position && position[2], defaultState.position[2])
        ),
        bearing: ensureFinite(bearing, defaultState.bearing),
        pitch: ensureFinite(pitch, defaultState.pitch),
        longitude,
        latitude,
        zoom
      })
    );
  }

  getViewportProps() {
    return this._viewportProps;
  }

  getDirection() {
    const spherical = new SphericalCoordinates({
      bearing: this._viewportProps.bearing,
      pitch: this._viewportProps.pitch
    });
    const direction = spherical.toVector3().normalize();
    return direction;
  }

  getDirectionFromBearing(bearing) {
    const spherical = new SphericalCoordinates({
      bearing,
      pitch: 90
    });
    const direction = spherical.toVector3().normalize();
    return direction;
  }

  // Redefined by subclass
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    return props;
  }
}
