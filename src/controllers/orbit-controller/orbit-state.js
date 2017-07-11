import OrbitViewport from './orbit-viewport';
import vec3_add from 'gl-vec3/add';
import vec3_scale from 'gl-vec3/scale';
import vec3_lerp from 'gl-vec3/lerp';
import assert from 'assert';

const defaultState = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  fov: 50,
  near: 1,
  far: 100,
  translationX: 0,
  translationY: 0,
  zoom: 1
};

const defaultConstraints = {
  minZoom: 0,
  maxZoom: Infinity
};

/* Helpers */

// Whether number is between bounds
function inRange(x, min, max) {
  return x >= min && x <= max;
}
// Constrain number between bounds
function clamp(x, min, max) {
  return x < min ? min : (x > max ? max : x);
}
// Get ratio of x on domain
function interpolate(x, domain0, domain1) {
  if (domain0 === domain1) {
    return x === domain0 ? 0 : Infinity;
  }
  return (x - domain0) / (domain1 - domain0);
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

export default class OrbitState {

  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport
    distance, // From eye to target
    rotationX, // Rotation around x axis
    rotationY, // Rotation around y axis

    // Bounding box of the model, in the shape of {minX, maxX, minY, maxY, minZ, maxZ}
    bounds,

    /* View matrix arguments */
    lookAt, // Which point is camera looking at, default origin

    /* Projection matrix arguments */
    fov, // Field of view covered by camera
    near, // Distance of near clipping plane
    far, // Distance of far clipping plane

    /* After projection */
    translationX, // in pixels
    translationY, // in pixels
    zoom,

    /* Viewport constraints */
    minZoom,
    maxZoom,

    /** Interaction states, required to calculate change during transform */
    // Model state when the pan operation first started
    startPanPos,
    startPanTranslation,
    // Model state when the rotate operation first started
    startRotateCenter,
    startRotateViewport,
    // Model state when the zoom operation first started
    startZoomPos,
    startZoom
  }) {
    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(distance), '`distance` must be supplied');

    this._viewportProps = this._applyConstraints({
      width,
      height,
      distance,
      rotationX: ensureFinite(rotationX, defaultState.rotationX),
      rotationY: ensureFinite(rotationY, defaultState.rotationY),

      bounds,
      lookAt: lookAt || defaultState.lookAt,

      fov: ensureFinite(fov, defaultState.fov),
      near: ensureFinite(near, defaultState.near),
      far: ensureFinite(far, defaultState.far),
      translationX: ensureFinite(translationX, defaultState.translationX),
      translationY: ensureFinite(translationY, defaultState.translationY),
      zoom: ensureFinite(zoom, defaultState.zoom),

      minZoom: ensureFinite(minZoom, defaultConstraints.minZoom),
      maxZoom: ensureFinite(maxZoom, defaultConstraints.maxZoom)
    });

    this._interactiveState = {
      startPanPos,
      startPanTranslation,
      startRotateCenter,
      startRotateViewport,
      startZoomPos,
      startZoom
    };
  }

  /* Public API */

  getViewportProps() {
    return this._viewportProps;
  }

  getInteractiveState() {
    return this._interactiveState;
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}) {
    const {translationX, translationY} = this._viewportProps;

    return this._getUpdatedOrbitState({
      startPanTranslation: [translationX, translationY],
      startPanPos: pos
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPos}) {
    const startPanPos = this._interactiveState.startPanPos || startPos;
    assert(startPanPos, '`startPanPos` props is required');

    let [translationX, translationY] = this._interactiveState.startPanTranslation || [];
    translationX = ensureFinite(translationX, this._viewportProps.translationX);
    translationY = ensureFinite(translationY, this._viewportProps.translationY);

    const deltaX = pos[0] - startPanPos[0];
    const deltaY = pos[1] - startPanPos[1];

    return this._getUpdatedOrbitState({
      translationX: translationX + deltaX,
      translationY: translationY - deltaY
    });
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedOrbitState({
      startPanTranslation: null,
      startPanPos: null
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}) {
    // Rotation center should be the worldspace position at the center of the
    // the screen. If not found, use the last one.
    const startRotateCenter = this._getLocationAtCenter() ||
      this._interactiveState.startRotateCenter;

    return this._getUpdatedOrbitState({
      startRotateCenter,
      startRotateViewport: this._viewportProps
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({deltaScaleX, deltaScaleY}) {
    const {startRotateCenter, startRotateViewport} = this._interactiveState;

    let {rotationX, rotationY, translationX, translationY} = startRotateViewport || {};
    rotationX = ensureFinite(rotationX, this._viewportProps.rotationX);
    rotationY = ensureFinite(rotationY, this._viewportProps.rotationY);
    translationX = ensureFinite(translationX, this._viewportProps.translationX);
    translationY = ensureFinite(translationY, this._viewportProps.translationY);

    const newRotationX = clamp(rotationX - deltaScaleY * 180, -89.999, 89.999);
    const newRotationY = (rotationY - deltaScaleX * 180) % 360;

    let newTranslationX = translationX;
    let newTranslationY = translationY;

    if (startRotateCenter) {
      // Keep rotation center at the center of the screen
      const oldViewport = new OrbitViewport(startRotateViewport);
      const oldCenterPos = oldViewport.project(startRotateCenter);

      const newViewport = new OrbitViewport(Object.assign({}, startRotateViewport, {
        rotationX: newRotationX,
        rotationY: newRotationY
      }));
      const newCenterPos = newViewport.project(startRotateCenter);

      newTranslationX += oldCenterPos[0] - newCenterPos[0];
      newTranslationY -= oldCenterPos[1] - newCenterPos[1];
    }

    return this._getUpdatedOrbitState({
      rotationX: newRotationX,
      rotationY: newRotationY,
      translationX: newTranslationX,
      translationY: newTranslationY
    });
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedOrbitState({
      startRotateCenter: null,
      startRotateViewport: null
    });
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}) {
    return this._getUpdatedOrbitState({
      startZoomPos: pos,
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
    const {zoom, minZoom, maxZoom, width, height, translationX, translationY} = this._viewportProps;

    const startZoomPos = this._interactiveState.startZoomPos || startPos || pos;

    const newZoom = clamp(zoom * scale, minZoom, maxZoom);
    const deltaX = pos[0] - startZoomPos[0];
    const deltaY = pos[1] - startZoomPos[1];

    // Zoom around the center position
    const cx = startZoomPos[0] - width / 2;
    const cy = height / 2 - startZoomPos[1];
    const newTranslationX = cx - (cx - translationX) * newZoom / zoom + deltaX;
    const newTranslationY = cy - (cy - translationY) * newZoom / zoom - deltaY;

    return this._getUpdatedOrbitState({
      zoom: newZoom,
      translationX: newTranslationX,
      translationY: newTranslationY
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedOrbitState({
      startZoomPos: null,
      startZoom: null
    });
  }

  /* Private methods */

  _getUpdatedOrbitState(newProps) {
    // Update _viewportProps
    return new OrbitState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = zoom > maxZoom ? maxZoom : zoom;
    props.zoom = zoom < minZoom ? minZoom : zoom;

    return props;
  }

  /* Cast a ray into the screen center and take the average of all
   * intersections with the bounding box:
   *
   *                         (x=w/2)
   *                          .
   *                          .
   *   (bounding box)         .
   *           _-------------_.
   *          | "-_           :-_
   *         |     "-_        .  "-_
   *        |         "-------+-----:
   *       |.........|........C....|............. (y=h/2)
   *      |         |         .   |
   *     |         |          .  |
   *    |         |           . |
   *   |         |            .|
   *  |         |             |                      Y
   *   "-_     |             |.             Z       |
   *      "-_ |             | .              "-_   |
   *         "-------------"                    "-|_____ X
   */
  _getLocationAtCenter() {
    const {width, height, bounds} = this._viewportProps;

    if (!bounds) {
      return null;
    }

    const viewport = new OrbitViewport(this._viewportProps);

    const C0 = viewport.unproject([width / 2, height / 2, 0]);
    const C1 = viewport.unproject([width / 2, height / 2, 1]);
    const sum = [0, 0, 0];
    let count = 0;

    [
      // depth at intersection with X = minX
      interpolate(bounds.minX, C0[0], C1[0]),
      // depth at intersection with X = maxX
      interpolate(bounds.maxX, C0[0], C1[0]),
      // depth at intersection with Y = minY
      interpolate(bounds.minY, C0[1], C1[1]),
      // depth at intersection with Y = maxY
      interpolate(bounds.maxY, C0[1], C1[1]),
      // depth at intersection with Z = minZ
      interpolate(bounds.minZ, C0[2], C1[2]),
      // depth at intersection with Z = maxZ
      interpolate(bounds.maxZ, C0[2], C1[2])
    ].forEach(d => {
      // worldspace position of the intersection
      const C = vec3_lerp([], C0, C1, d);
      // check if position is on the bounding box
      if (inRange(C[0], bounds.minX, bounds.maxX) &&
          inRange(C[1], bounds.minY, bounds.maxY) &&
          inRange(C[2], bounds.minZ, bounds.maxZ)) {
        count++;
        vec3_add(sum, sum, C);
      }
    });

    return count > 0 ? vec3_scale([], sum, 1 / count) : null;
  }
}
