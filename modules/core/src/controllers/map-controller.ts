import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';
import ViewState from './view-state';
import {normalizeViewportProps} from '@math.gl/web-mercator';
import assert from '../utils/assert';

import LinearInterpolator from '../transitions/linear-interpolator';
import type Viewport from '../viewports/viewport';

const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;

export type MapStateProps = {
  /** Mapbox viewport properties */
  /** The width of the viewport */
  width: number;
  /** The height of the viewport */
  height: number;
  /** The latitude at the center of the viewport */
  latitude: number;
  /** The longitude at the center of the viewport */
  longitude: number;
  /** The tile zoom level of the map. */
  zoom: number;
  /** The bearing of the viewport in degrees */
  bearing?: number;
  /** The pitch of the viewport in degrees */
  pitch?: number;
  /**
   * Specify the altitude of the viewport camera
   * Unit: map heights, default 1.5
   * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
   */
  altitude?: number;
  /** Viewport position */
  position?: [number, number, number];

  /** Viewport constraints */
  maxZoom?: number;
  minZoom?: number;
  maxPitch?: number;
  minPitch?: number;

  /** Normalize viewport props to fit map height into viewport. Default `true` */
  normalize?: boolean;
};

type MapStateInternal = {
  /** Interaction states, required to calculate change during transform */
  /* The point on map being grabbed when the operation first started */
  startPanLngLat?: [number, number];
  /* Center of the zoom when the operation first started */
  startZoomLngLat?: [number, number];
  /* Pointer position when rotation started */
  startRotatePos?: [number, number];
  /** Bearing when current perspective rotate operation started */
  startBearing?: number;
  /** Pitch when current perspective rotate operation started */
  startPitch?: number;
  /** Zoom when current zoom operation started */
  startZoom?: number;
};

/* Utils */

export class MapState extends ViewState<MapState, MapStateProps, MapStateInternal> {
  makeViewport: (props: Record<string, any>) => Viewport;

  constructor(
    options: MapStateProps &
      MapStateInternal & {
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  ) {
    const {
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
      bearing = 0,
      /** The pitch of the viewport in degrees */
      pitch = 0,
      /**
       * Specify the altitude of the viewport camera
       * Unit: map heights, default 1.5
       * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
       */
      altitude = 1.5,
      /** Viewport position */
      position = [0, 0, 0],

      /** Viewport constraints */
      maxZoom = 20,
      minZoom = 0,
      maxPitch = 60,
      minPitch = 0,

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

      /** Normalize viewport props to fit map height into viewport */
      normalize = true
    } = options;

    assert(Number.isFinite(longitude)); // `longitude` must be supplied
    assert(Number.isFinite(latitude)); // `latitude` must be supplied
    assert(Number.isFinite(zoom)); // `zoom` must be supplied

    super(
      {
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
        normalize,
        position
      },
      {
        startPanLngLat,
        startZoomLngLat,
        startRotatePos,
        startBearing,
        startPitch,
        startZoom
      }
    );

    this.makeViewport = options.makeViewport;
  }

  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}: {pos: [number, number]}): MapState {
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
  pan({pos, startPos}: {pos: [number, number]; startPos?: [number, number]}): MapState {
    const startPanLngLat = this.getState().startPanLngLat || this._unproject(startPos);

    if (!startPanLngLat) {
      return this;
    }

    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = viewport.panByPosition(startPanLngLat, pos);

    return this._getUpdatedState(newProps);
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): MapState {
    return this._getUpdatedState({
      startPanLngLat: null
    });
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotateStart({pos}: {pos: [number, number]}): MapState {
    return this._getUpdatedState({
      startRotatePos: pos,
      startBearing: this.getViewportProps().bearing,
      startPitch: this.getViewportProps().pitch
    });
  }

  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotate({
    pos,
    deltaAngleX = 0,
    deltaAngleY = 0
  }: {
    pos?: [number, number];
    deltaAngleX?: number;
    deltaAngleY?: number;
  }): MapState {
    const {startRotatePos, startBearing, startPitch} = this.getState();

    if (!startRotatePos || startBearing === undefined || startPitch === undefined) {
      return this;
    }
    let newRotation;
    if (pos) {
      newRotation = this._getNewRotation(pos, startRotatePos, startPitch, startBearing);
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
  rotateEnd(): MapState {
    return this._getUpdatedState({
      startBearing: null,
      startPitch: null
    });
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  zoomStart({pos}: {pos: [number, number]}): MapState {
    return this._getUpdatedState({
      startZoomLngLat: this._unproject(pos),
      startZoom: this.getViewportProps().zoom
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
  zoom({
    pos,
    startPos,
    scale
  }: {
    pos: [number, number];
    startPos?: [number, number];
    scale: number;
  }): MapState {
    // Make sure we zoom around the current mouse position rather than map center
    let {startZoom, startZoomLngLat} = this.getState();

    if (!startZoomLngLat) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      startZoom = this.getViewportProps().zoom;
      startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
    }
    if (!startZoomLngLat) {
      return this;
    }

    const {maxZoom, minZoom} = this.getViewportProps();
    let zoom = (startZoom as number) + Math.log2(scale);
    zoom = clamp(zoom, minZoom, maxZoom);

    const zoomedViewport = this.makeViewport({...this.getViewportProps(), zoom});

    return this._getUpdatedState({
      zoom,
      ...zoomedViewport.panByPosition(startZoomLngLat, pos)
    });
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): MapState {
    return this._getUpdatedState({
      startZoomLngLat: null,
      startZoom: null
    });
  }

  zoomIn(speed: number = 2): MapState {
    return this._zoomFromCenter(speed);
  }

  zoomOut(speed: number = 2): MapState {
    return this._zoomFromCenter(1 / speed);
  }

  moveLeft(speed: number = 100): MapState {
    return this._panFromCenter([speed, 0]);
  }

  moveRight(speed: number = 100): MapState {
    return this._panFromCenter([-speed, 0]);
  }

  moveUp(speed: number = 100): MapState {
    return this._panFromCenter([0, speed]);
  }

  moveDown(speed: number = 100): MapState {
    return this._panFromCenter([0, -speed]);
  }

  rotateLeft(speed: number = 15): MapState {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing - speed
    });
  }

  rotateRight(speed: number = 15): MapState {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing + speed
    });
  }

  rotateUp(speed: number = 10): MapState {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch + speed
    });
  }

  rotateDown(speed: number = 10): MapState {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch - speed
    });
  }

  shortestPathFrom(viewState: MapState): MapStateProps {
    // const endViewStateProps = new this.ControllerState(endProps).shortestPathFrom(startViewstate);
    const fromProps = viewState.getViewportProps();
    const props = {...this.getViewportProps()};
    const {bearing, longitude} = props;

    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }
    if (Math.abs(longitude - fromProps.longitude) > 180) {
      props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
    }
    return props;
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props: Required<MapStateProps>): Required<MapStateProps> {
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

  /* Private methods */

  _zoomFromCenter(scale) {
    const {width, height} = this.getViewportProps();
    return this.zoom({
      pos: [width / 2, height / 2],
      scale
    });
  }

  _panFromCenter(offset) {
    const {width, height} = this.getViewportProps();
    return this.pan({
      startPos: [width / 2, height / 2],
      pos: [width / 2 + offset[0], height / 2 + offset[1]]
    });
  }

  _getUpdatedState(newProps): MapState {
    // @ts-ignore
    return new this.constructor({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }

  _unproject(pos?: [number, number]): [number, number] | undefined {
    const viewport = this.makeViewport(this.getViewportProps());
    // @ts-ignore
    return pos && viewport.unproject(pos);
  }

  _getNewRotation(
    pos: [number, number],
    startPos: [number, number],
    startPitch: number,
    startBearing: number
  ): {
    pitch: number;
    bearing: number;
  } {
    const deltaX = pos[0] - startPos[0];
    const deltaY = pos[1] - startPos[1];
    const centerY = pos[1];
    const startY = startPos[1];
    const {width, height} = this.getViewportProps();

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
    // clamp deltaScaleY to [-1, 1] so that rotation is constrained between minPitch and maxPitch.
    // deltaScaleX does not need to be clamped as bearing does not have constraints.
    deltaScaleY = clamp(deltaScaleY, -1, 1);

    const {minPitch, maxPitch} = this.getViewportProps();

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

export default class MapController extends Controller<MapState> {
  ControllerState = MapState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator({
      transitionProps: {
        compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'],
        required: ['longitude', 'latitude', 'zoom']
      }
    })
  };

  dragMode: 'pan' | 'rotate' = 'pan';

  setProps(props: ControllerProps & MapStateProps) {
    props.position = props.position || [0, 0, 0];
    const oldProps = this.props;

    super.setProps(props);

    const dimensionChanged = !oldProps || oldProps.height !== props.height;
    if (dimensionChanged) {
      // Dimensions changed, normalize the props
      this.updateViewport(
        new this.ControllerState({
          makeViewport: this.makeViewport,
          ...props,
          ...this.state
        })
      );
    }
  }
}
