import {Vector3, experimental} from 'math.gl';
const {SphericalCoordinates} = experimental;

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

export default class ViewState {
  constructor(opts) {
    const {
      // Position and orientation
      position = defaultState.position // typically in meters from anchor point
    } = opts;

    this._viewportProps = this._applyConstraints(
      Object.assign({}, opts, {
        position: new Vector3(position)
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

  shortestPathFrom(viewState) {
    return this._viewportProps;
  }

  // Redefined by subclass
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    return props;
  }
}
