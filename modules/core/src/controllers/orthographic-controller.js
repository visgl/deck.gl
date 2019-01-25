import Controller from './controller';
import ViewState from './view-state';

import {Vector2, clamp} from 'math.gl';

const MOVEMENT_SPEED = 10; // per keyboard click

const DEFAULT_STATE = {
  zoom: 0,
  offset: [0, 0],
  minZoom: -10,
  maxZoom: 10
};

const zoom2Scale = zoom => Math.pow(2, zoom);

class OrthographicState extends ViewState {
  constructor({
    /* Viewport arguments */
    width, // Width of viewport
    height, // Height of viewport
    offset = DEFAULT_STATE.offset, // Offset to the origin
    zoom = DEFAULT_STATE.zoom, // Zoom level of the view
    minZoom = DEFAULT_STATE.minZoom,
    maxZoom = DEFAULT_STATE.maxZoom,

    /** Interaction states */
    /* The point on the view being grabbed when the operation first started */
    startPanPosition,
    /* The offset on the view being grabbed when the operation first started */
    startPanOffset,
    /* The point on the view being zoomed when the operation first started */
    startZoomPosition,
    /** The zoom level when the first zoom operation started */
    startZoom
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
      startZoomPosition,
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

  // Calculates new zoom
  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this._viewportProps;
    const zoom = startZoom + Math.log2(scale);
    return clamp(zoom, minZoom, maxZoom);
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  zoomStart({pos}) {
    return this._getUpdatedState({
      startZoomPosition: pos,
      startZoom: this._viewportProps.zoom
    });
  }

  /**
   * Zoom
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   * @param {[number, number]} pos - current mouse cursor screen position
   */
  zoom({pos, startPos, scale}) {
    const {zoom, width, height, offset} = this._viewportProps;
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

    const centerX = width / 2 - offset[0];
    const centerY = height / 2 - offset[1];
    const dX = (startZoomPosition[0] - centerX) * (newScale / startScale - 1);
    const dY = (startZoomPosition[1] - centerY) * (newScale / startScale - 1);

    return this._getUpdatedState({
      zoom: newZoom,
      offset: [offset[0] + dX, offset[1] + dY]
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

  _zoomFromCenter(scale) {
    const {width, height, offset} = this._viewportProps;
    return this.zoom({
      pos: [width / 2 - offset[0], height / 2 - offset[1]],
      scale
    });
  }

  zoomIn() {
    return this._zoomFromCenter(2);
  }

  zoomOut() {
    return this._zoomFromCenter(0.5);
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
