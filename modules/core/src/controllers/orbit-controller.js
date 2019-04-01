import {clamp, Vector2} from 'math.gl';
import Controller from './controller';
import ViewState from './view-state';
import LinearInterpolator from '../transitions/linear-interpolator';
import {TRANSITION_EVENTS} from './transition-manager';

const MOVEMENT_SPEED = 50; // per keyboard click

const DEFAULT_STATE = {
  rotationX: 0,
  rotationOrbit: 0,
  zoom: 0,
  pixelOffset: [0, 0],
  minZoom: -Infinity,
  maxZoom: Infinity
};

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: t => t,
  transitionInterpolator: new LinearInterpolator([
    'pixelOffset',
    'zoom',
    'rotationX',
    'rotationOrbit'
  ]),
  transitionInterruption: TRANSITION_EVENTS.BREAK
};

/* Helpers */

const zoom2Scale = zoom => Math.pow(2, zoom);

export class OrbitState extends ViewState {
  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport
    rotationX = DEFAULT_STATE.rotationX, // Rotation around x axis
    rotationOrbit = DEFAULT_STATE.rotationOrbit, // Rotation around orbit axis

    /* After projection */
    pixelOffset = DEFAULT_STATE.pixelOffset, // in pixels
    zoom = DEFAULT_STATE.zoom,

    /* Viewport constraints */
    minZoom = DEFAULT_STATE.minZoom,
    maxZoom = DEFAULT_STATE.maxZoom,

    /** Interaction states, required to calculate change during transform */
    // Model state when the pan operation first started
    startPanPosition,
    startPanOffset,
    // Model state when the rotate operation first started
    startRotationX,
    startRotationOrbit,
    // Model state when the zoom operation first started
    startZoomPosition,
    startZoom
  }) {
    super({
      width,
      height,
      rotationX,
      rotationOrbit,
      pixelOffset,
      zoom,
      minZoom,
      maxZoom
    });

    this._interactiveState = {
      startPanPosition,
      startPanOffset,
      startRotationX,
      startRotationOrbit,
      startZoomPosition,
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
    const {pixelOffset} = this._viewportProps;
    return this._getUpdatedState({
      startPanPosition: pos,
      startPanOffset: pixelOffset
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPos}) {
    const {startPanPosition, startPanOffset} = this._interactiveState;
    const delta = new Vector2(pos).subtract(startPanPosition);
    return this._getUpdatedState({
      pixelOffset: new Vector2(startPanOffset).subtract(delta)
    });
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanPosition: null,
      startPanOffset: null
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}) {
    return this._getUpdatedState({
      startRotationX: this._viewportProps.rotationX,
      startRotationOrbit: this._viewportProps.rotationOrbit
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({deltaScaleX, deltaScaleY}) {
    const {startRotationX, startRotationOrbit} = this._interactiveState;

    if (!Number.isFinite(startRotationX) || !Number.isFinite(startRotationOrbit)) {
      return this;
    }

    const newRotationX = clamp(startRotationX + deltaScaleY * 180, -89.999, 89.999);
    const newRotationOrbit = (startRotationOrbit + deltaScaleX * 180) % 360;

    return this._getUpdatedState({
      rotationX: newRotationX,
      rotationOrbit: newRotationOrbit,
      isRotating: true
    });
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startRotationX: null,
      startRotationOrbit: null
    });
  }

  // default implementation of shortest path between two view states
  shortestPathFrom(viewState) {
    const props = Object.assign({}, this._viewportProps);
    return props;
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}) {
    return this._getUpdatedState({
      startZoomPosition: pos,
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
    const {zoom, width, height, pixelOffset} = this._viewportProps;
    let {startZoom, startZoomPosition} = this._interactiveState;
    if (!Number.isFinite(startZoom)) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      startZoom = zoom;
      startZoomPosition = startPos || pos;
    }

    const newZoom = this._calculateNewZoom({scale, startZoom});
    const startScale = zoom2Scale(startZoom);
    const newScale = zoom2Scale(newZoom);

    const centerX = width / 2 - pixelOffset[0];
    const centerY = height / 2 - pixelOffset[1];
    const dX = (startZoomPosition[0] - centerX) * (newScale / startScale - 1);
    const dY = (startZoomPosition[1] - centerY) * (newScale / startScale - 1);

    return this._getUpdatedState({
      zoom: newZoom,
      pixelOffset: [pixelOffset[0] + dX, pixelOffset[1] + dY]
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomPosition: null,
      startZoom: null
    });
  }

  zoomIn() {
    return this._zoomFromCenter(2);
  }

  zoomOut() {
    return this._zoomFromCenter(0.5);
  }

  moveLeft() {
    const {pixelOffset} = this._viewportProps;
    const delta = [-MOVEMENT_SPEED, 0];
    return this._getUpdatedState({
      pixelOffset: new Vector2(pixelOffset).add(delta)
    });
  }

  moveRight() {
    const {pixelOffset} = this._viewportProps;
    const delta = [MOVEMENT_SPEED, 0];
    return this._getUpdatedState({
      pixelOffset: new Vector2(pixelOffset).add(delta)
    });
  }

  moveUp() {
    const {pixelOffset} = this._viewportProps;
    const delta = [0, -MOVEMENT_SPEED];
    return this._getUpdatedState({
      pixelOffset: new Vector2(pixelOffset).add(delta)
    });
  }

  moveDown() {
    const {pixelOffset} = this._viewportProps;
    const delta = [0, MOVEMENT_SPEED];
    return this._getUpdatedState({
      pixelOffset: new Vector2(pixelOffset).add(delta)
    });
  }

  rotateLeft() {
    return this._getUpdatedState({
      rotationOrbit: this._viewportProps.rotationOrbit - 15
    });
  }

  rotateRight() {
    return this._getUpdatedState({
      rotationOrbit: this._viewportProps.rotationOrbit + 15
    });
  }

  rotateUp() {
    return this._getUpdatedState({
      rotationX: this._viewportProps.rotationX - 10
    });
  }

  rotateDown() {
    return this._getUpdatedState({
      rotationX: this._viewportProps.rotationX + 10
    });
  }

  /* Private methods */

  _zoomFromCenter(scale) {
    const {width, height, pixelOffset} = this._viewportProps;
    return this.zoom({
      pos: [width / 2 - pixelOffset[0], height / 2 - pixelOffset[1]],
      scale
    });
  }

  // Calculates new zoom
  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this._viewportProps;
    const zoom = startZoom + Math.log2(scale);
    return clamp(zoom, minZoom, maxZoom);
  }

  _getUpdatedState(newProps) {
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
}

export default class OrbitController extends Controller {
  constructor(props) {
    super(OrbitState, props);
  }

  _getTransitionProps() {
    // Enables Transitions on double-tap and key-down events.
    return LINEAR_TRANSITION_PROPS;
  }
}
