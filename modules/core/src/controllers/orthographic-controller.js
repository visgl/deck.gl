import Controller from './controller';
import ViewState from './view-state';

import {Vector2, clamp} from 'math.gl';

const MOVEMENT_SPEED = 10; // per keyboard click
// TODO - make default unlimited in the next major version
const DEFAULT_MIN_ZOOM = 0.1;
const DEFAULT_MAX_ZOOM = 10;

class OrthographicState extends ViewState {
  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport
    offset, // Offset to the origin
    zoom, // Zoom level of the view
    minZoom = DEFAULT_MIN_ZOOM,
    maxZoom = DEFAULT_MAX_ZOOM,

    /** Interaction states */
    startPanPosition,
    startPanOffset,
    startRotatePosition,
    startRotateOffset
  }) {
    super({
      width,
      height,
      offset,
      zoom,
      minZoom,
      maxZoom
    });
    this._interactiveState = {
      startPanPosition,
      startPanOffset,
      startRotatePosition,
      startRotateOffset
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
    const {offset} = this._viewportProps;
    return this._getUpdatedState({
      startPanPosition: pos,
      startPanOffset: offset
    });
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos}) {
    const {startPanPosition, startPanOffset} = this._interactiveState;
    const delta = new Vector2(pos).subtract(startPanPosition);
    return this._getUpdatedState({
      offset: new Vector2(startPanOffset).subtract(delta)
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
    return this;
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({deltaScaleX, deltaScaleY}) {
    return this;
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this;
  }

  /**
   * Zoom
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   * @param {[number, number]} pos - current mouse cursor screen position
   */
  zoom({pos, scale}) {
    const {zoom, width, height, offset, minZoom, maxZoom} = this._viewportProps;
    const newZoom = clamp(zoom * scale, minZoom, maxZoom);
    const centerX = width / 2 - offset[0];
    const centerY = height / 2 - offset[1];
    const dX = (pos[0] - centerX) * (zoom / newZoom - 1);
    const dY = (pos[1] - centerY) * (zoom / newZoom - 1);
    return this._getUpdatedState({
      zoom: newZoom,
      offset: [offset[0] + dX, offset[1] + dY]
    });
  }

  moveLeft() {
    const {offset} = this._viewportProps;
    const delta = [MOVEMENT_SPEED, 0];
    return this._getUpdatedState({
      offset: new Vector2(offset).add(delta)
    });
  }

  moveRight() {
    const {offset} = this._viewportProps;
    const delta = [-MOVEMENT_SPEED, 0];
    return this._getUpdatedState({
      offset: new Vector2(offset).add(delta)
    });
  }

  moveUp() {
    const {offset} = this._viewportProps;
    const delta = [0, MOVEMENT_SPEED];
    return this._getUpdatedState({
      offset: new Vector2(offset).add(delta)
    });
  }

  moveDown() {
    const {offset} = this._viewportProps;
    const delta = [0, -MOVEMENT_SPEED];
    return this._getUpdatedState({
      offset: new Vector2(offset).add(delta)
    });
  }

  /* Private methods */

  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new OrthographicState(
      Object.assign({}, this._viewportProps, this._interactiveState, newProps)
    );
  }
}

export default class OrthographicController extends Controller {
  constructor(props) {
    super(OrthographicState, props);
    this.invertPan = true;
  }
}
