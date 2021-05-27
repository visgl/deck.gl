import {clamp} from 'math.gl';
import Controller from './controller';
import ViewState from './view-state';
import {normalizeViewportProps} from '@math.gl/web-mercator';
import assert from '../utils/assert';

const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;

const DEFAULT_STATE = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5,
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60
};

/* Utils */

export class MapState extends ViewState {
  constructor({
    makeViewport,

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
    bearing = DEFAULT_STATE.bearing,
    /** The pitch of the viewport in degrees */
    pitch = DEFAULT_STATE.pitch,
    /**
     * Specify the altitude of the viewport camera
     * Unit: map heights, default 1.5
     * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
     */
    altitude = DEFAULT_STATE.altitude,

    /** Viewport constraints */
    maxZoom = DEFAULT_STATE.maxZoom,
    minZoom = DEFAULT_STATE.minZoom,
    maxPitch = DEFAULT_STATE.maxPitch,
    minPitch = DEFAULT_STATE.minPitch,

    /** Interaction states, required to calculate change during transform */
    /* The point on map being grabbed when the operation first started */
    startPanLngLat,
    /* Center of the zoom when the operation first started */
    startZoomLngLat,
    /* Pointer position when rotation started */
    startRotatePos,
    /** Bearing when current perspective rotate operation started */
    startBearing,
    /** Pitch when current perspective rotate operation started */
    startPitch,
    /** Zoom when current zoom operation started */
    startZoom,

    /** Normalize viewport props to fit map height into viewport. Default `true` */
    normalize
  } = {}) {
    assert(Number.isFinite(longitude)); // `longitude` must be supplied
    assert(Number.isFinite(latitude)); // `latitude` must be supplied
    assert(Number.isFinite(zoom)); // `zoom` must be supplied

    super({
      width,
      height,
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
      altitude,
      maxZoom,
      minZoom,
      maxPitch,
      minPitch,
      normalize
    });

    this._state = {
      startPanLngLat,
      startZoomLngLat,
      startRotatePos,
      startBearing,
      startPitch,
      startZoom
    };

    this.makeViewport = makeViewport;
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
    const startPanLngLat = this._state.startPanLngLat || this._unproject(startPos);

    if (!startPanLngLat) {
      return this;
    }

    const viewport = this.makeViewport(this._viewportProps);
    const newProps = viewport.panByPosition(startPanLngLat, pos);

    return this._getUpdatedState(newProps);
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
      startRotatePos: pos,
      startBearing: this._viewportProps.bearing,
      startPitch: this._viewportProps.pitch
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotate({pos, deltaAngleX = 0, deltaAngleY = 0}) {
    const {startRotatePos, startBearing, startPitch} = this._state;

    if (!startRotatePos || !Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
      return this;
    }
    let newRotation;
    if (pos) {
      newRotation = this._calculateNewPitchAndBearing({
        ...this._getRotationParams(pos, startRotatePos),
        startBearing,
        startPitch
      });
    } else {
      newRotation = {
        bearing: startBearing + deltaAngleX,
        pitch: startPitch + deltaAngleY
      };
    }
    return this._getUpdatedState(newRotation);
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
    // Make sure we zoom around the current mouse position rather than map center
    let {startZoom, startZoomLngLat} = this._state;

    if (!Number.isFinite(startZoom)) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      startZoom = this._viewportProps.zoom;
      startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
    }

    const zoom = this._calculateNewZoom({scale, startZoom});

    const zoomedViewport = this.makeViewport({...this._viewportProps, zoom});

    return this._getUpdatedState({
      zoom,
      ...zoomedViewport.panByPosition(startZoomLngLat, pos)
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

  zoomIn(speed = 2) {
    return this._zoomFromCenter(speed);
  }

  zoomOut(speed = 2) {
    return this._zoomFromCenter(1 / speed);
  }

  moveLeft(speed = 100) {
    return this._panFromCenter([speed, 0]);
  }

  moveRight(speed = 100) {
    return this._panFromCenter([-speed, 0]);
  }

  moveUp(speed = 100) {
    return this._panFromCenter([0, speed]);
  }

  moveDown(speed = 100) {
    return this._panFromCenter([0, -speed]);
  }

  rotateLeft(speed = 15) {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing - speed
    });
  }

  rotateRight(speed = 15) {
    return this._getUpdatedState({
      bearing: this._viewportProps.bearing + speed
    });
  }

  rotateUp(speed = 10) {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch + speed
    });
  }

  rotateDown(speed = 10) {
    return this._getUpdatedState({
      pitch: this._viewportProps.pitch - speed
    });
  }

  shortestPathFrom(viewState) {
    // const endViewStateProps = new this.ControllerState(endProps).shortestPathFrom(startViewstate);
    const fromProps = viewState.getViewportProps();
    const props = {...this._viewportProps};
    const {bearing, longitude} = props;

    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }
    if (Math.abs(longitude - fromProps.longitude) > 180) {
      props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
    }
    return props;
  }

  /* Private methods */

  _zoomFromCenter(scale) {
    const {width, height} = this._viewportProps;
    return this.zoom({
      pos: [width / 2, height / 2],
      scale
    });
  }

  _panFromCenter(offset) {
    const {width, height} = this._viewportProps;
    return this.pan({
      startPos: [width / 2, height / 2],
      pos: [width / 2 + offset[0], height / 2 + offset[1]]
    });
  }

  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new this.constructor({
      makeViewport: this.makeViewport,
      ...this._viewportProps,
      ...this._state,
      ...newProps
    });
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = clamp(zoom, minZoom, maxZoom);

    // Ensure pitch is within specified range
    const {maxPitch, minPitch, pitch} = props;
    props.pitch = clamp(pitch, minPitch, maxPitch);

    // Normalize viewport props to fit map height into viewport
    const {normalize = true} = props;
    if (normalize) {
      Object.assign(props, normalizeViewportProps(props));
    }

    return props;
  }

  _unproject(pos) {
    const viewport = this.makeViewport(this._viewportProps);
    return pos && viewport.unproject(pos);
  }

  // Calculates new zoom
  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this._viewportProps;
    const zoom = startZoom + Math.log2(scale);
    return clamp(zoom, minZoom, maxZoom);
  }

  // Calculates a new pitch and bearing from a position (coming from an event)
  _calculateNewPitchAndBearing({deltaScaleX, deltaScaleY, startBearing, startPitch}) {
    // clamp deltaScaleY to [-1, 1] so that rotation is constrained between minPitch and maxPitch.
    // deltaScaleX does not need to be clamped as bearing does not have constraints.
    deltaScaleY = clamp(deltaScaleY, -1, 1);

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

  _getRotationParams(pos, startPos) {
    const deltaX = pos[0] - startPos[0];
    const deltaY = pos[1] - startPos[1];
    const centerY = pos[1];
    const startY = startPos[1];
    const {width, height} = this._viewportProps;

    const deltaScaleX = deltaX / width;
    let deltaScaleY = 0;

    if (deltaY > 0) {
      if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to -1 as we drag upwards
        deltaScaleY = (deltaY / (startY - height)) * PITCH_ACCEL;
      }
    } else if (deltaY < 0) {
      if (startY > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        deltaScaleY = 1 - centerY / startY;
      }
    }
    deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));
    return {deltaScaleX, deltaScaleY};
  }
}

export default class MapController extends Controller {
  constructor(props) {
    props.dragMode = props.dragMode || 'pan';
    super(MapState, props);
  }

  setProps(props) {
    const oldProps = this.controllerStateProps;

    super.setProps(props);

    const dimensionChanged = !oldProps || oldProps.height !== props.height;
    if (dimensionChanged) {
      // Dimensions changed, normalize the props
      this.updateViewport(
        new this.ControllerState({
          makeViewport: this.makeViewport,
          ...this.controllerStateProps,
          ...this._state
        })
      );
    }
  }

  get linearTransitionProps() {
    return ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
  }
}
