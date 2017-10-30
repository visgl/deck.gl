import ViewState from './view-state';
import PerspectiveMercatorViewport from '../viewports/web-mercator-viewport';
import assert from 'assert';

// MAPBOX LIMITS
export const MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60
};

const defaultState = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

/* Utils */
function mod(value, divisor) {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

export default class MapState extends ViewState {

  constructor({
    /** Mapbox viewport properties */
    /** The width of the viewport */
    width,
    /** The height of the viewport */
    height,
    /** The latitude at the center of the viewport */
    latitude,
    /** The longitude at the center of the viewport */
    longitude,
    /** The tile zoom level of the map. */
    zoom,
    /** The bearing of the viewport in degrees */
    bearing,
    /** The pitch of the viewport in degrees */
    pitch,
    /**
    * Specify the altitude of the viewport camera
    * Unit: map heights, default 1.5
    * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
    */
    altitude,

    /** Viewport constraints */
    maxZoom,
    minZoom,
    maxPitch,
    minPitch,

    /** Interaction states, required to calculate change during transform */
    /* The point on map being grabbed when the operation first started */
    startPanLngLat,
    /* Center of the zoom when the operation first started */
    startZoomLngLat,
    /** Bearing when current perspective rotate operation started */
    startBearing,
    /** Pitch when current perspective rotate operation started */
    startPitch,
    /** Zoom when current zoom operation started */
    startZoom
  } = {}) {
    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');

    super({
      width,
      height,
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,

      altitude: ensureFinite(altitude, defaultState.altitude),
      maxZoom: ensureFinite(maxZoom, MAPBOX_LIMITS.maxZoom),
      minZoom: ensureFinite(minZoom, MAPBOX_LIMITS.minZoom),
      maxPitch: ensureFinite(maxPitch, MAPBOX_LIMITS.maxPitch),
      minPitch: ensureFinite(minPitch, MAPBOX_LIMITS.minPitch)
    });

    this._interactiveState = {
      startPanLngLat,
      startZoomLngLat,
      startBearing,
      startPitch,
      startZoom
    };
  }

  /* Public API */

  getInteractiveState() {
    return this._interactiveState;
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}) {
    return this._getUpdatedState({
      startPanLngLat: this._unproject(pos)
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   * @param {[Number, Number], optional} startPos - where the pointer grabbed at
   *   the start of the operation. Must be supplied of `panStart()` was not called
   */
  pan({pos, startPos}) {
    const startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos);

    // take the start lnglat and put it where the mouse is down.
    assert(startPanLngLat, '`startPanLngLat` prop is required ' +
      'for mouse pan behavior to calculate where to position the map.');

    const [longitude, latitude] = this._calculateNewLngLat({startPanLngLat, pos});

    return this._getUpdatedState({
      longitude,
      latitude
    });
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanLngLat: null
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotateStart({pos}) {
    return this._getUpdatedState({
      startBearing: this._viewportProps.bearing,
      startPitch: this._viewportProps.pitch
    });
  }

  /**
   * Rotate
   * @param {Number} deltaScaleX - a number between [-1, 1] specifying the
   *   change to bearing.
   * @param {Number} deltaScaleY - a number between [-1, 1] specifying the
   *   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
   */
  rotate({deltaScaleX, deltaScaleY}) {
    assert(deltaScaleX >= -1 && deltaScaleX <= 1,
      '`deltaScaleX` must be a number between [-1, 1]');
    assert(deltaScaleY >= -1 && deltaScaleY <= 1,
      '`deltaScaleY` must be a number between [-1, 1]');

    let {startBearing, startPitch} = this._interactiveState;

    if (!Number.isFinite(startBearing)) {
      startBearing = this._viewportProps.bearing;
    }
    if (!Number.isFinite(startPitch)) {
      startPitch = this._viewportProps.pitch;
    }

    const {pitch, bearing} = this._calculateNewPitchAndBearing({
      deltaScaleX,
      deltaScaleY,
      startBearing,
      startPitch
    });

    return this._getUpdatedState({
      bearing,
      pitch
    });
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startBearing: null,
      startPitch: null
    });
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  zoomStart({pos}) {
    return this._getUpdatedState({
      startZoomLngLat: this._unproject(pos),
      startZoom: this._viewportProps.zoom
    });
  }

  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current center is
   * @param {[Number, Number]} startPos - the center position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({pos, startPos, scale}) {
    assert(scale > 0, '`scale` must be a positive number');

    // Make sure we zoom around the current mouse position rather than map center
    const startZoomLngLat = this._interactiveState.startZoomLngLat ||
      this._unproject(startPos) || this._unproject(pos);
    let {startZoom} = this._interactiveState;

    if (!Number.isFinite(startZoom)) {
      startZoom = this._viewportProps.zoom;
    }

    // take the start lnglat and put it where the mouse is down.
    assert(startZoomLngLat, '`startZoomLngLat` prop is required ' +
      'for zoom behavior to calculate where to position the map.');

    const zoom = this._calculateNewZoom({scale, startZoom});

    const zoomedViewport = new PerspectiveMercatorViewport(
      Object.assign({}, this._viewportProps, {zoom})
    );
    const [longitude, latitude] = zoomedViewport.getLocationAtPoint({lngLat: startZoomLngLat, pos});

    return this._getUpdatedState({
      zoom,
      longitude,
      latitude
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomLngLat: null,
      startZoom: null
    });
  }

  moveLeft() {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing - 3
    });
  }

  moveRight() {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing + 3
    });
  }

  moveForward() {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch + 3
    });
  }

  moveBackward() {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch - 3
    });
  }

  zoomIn() {
    return this._getUpdatedState({
      zoom: this._viewportProps.zoom + 0.2
    });
  }

  zoomOut() {
    return this._getUpdatedState({
      zoom: this._viewportProps.zoom - 0.2
    });
  }

  /* Private methods */

  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new MapState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Normalize degrees
    props.longitude = mod(props.longitude + 180, 360) - 180;
    props.bearing = mod(props.bearing + 180, 360) - 180;

    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = zoom > maxZoom ? maxZoom : zoom;
    props.zoom = props.zoom < minZoom ? minZoom : props.zoom;

    // Ensure pitch is within specified range
    const {maxPitch, minPitch, pitch} = props;

    props.pitch = pitch > maxPitch ? maxPitch : pitch;
    props.pitch = props.pitch < minPitch ? minPitch : props.pitch;

    return props;
  }

  _unproject(pos) {
    const viewport = new PerspectiveMercatorViewport(this._viewportProps);
    return pos && viewport.unproject(pos, {topLeft: false});
  }

  // Calculate a new lnglat based on pixel dragging position
  _calculateNewLngLat({startPanLngLat, pos}) {
    const viewport = new PerspectiveMercatorViewport(this._viewportProps);
    return viewport.getLocationAtPoint({lngLat: startPanLngLat, pos});
  }

  // Calculates new zoom
  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this._viewportProps;
    let zoom = startZoom + Math.log2(scale);
    zoom = zoom > maxZoom ? maxZoom : zoom;
    zoom = zoom < minZoom ? minZoom : zoom;
    return zoom;
  }

  // Calculates a new pitch and bearing from a position (coming from an event)
  _calculateNewPitchAndBearing({deltaScaleX, deltaScaleY, startBearing, startPitch}) {
    const {minPitch, maxPitch} = this._viewportProps;

    const bearing = startBearing + 180 * deltaScaleX;
    let pitch = startPitch;
    if (deltaScaleY > 0) {
      // Gradually increase pitch
      pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
    } else if (deltaScaleY < 0) {
      // Gradually decrease pitch
      pitch = startPitch - deltaScaleY * (minPitch - startPitch);
    }

    return {
      pitch,
      bearing
    };
  }
}
