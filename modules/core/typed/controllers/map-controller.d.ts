import Controller, {ControllerProps} from './controller';
import ViewState from './view-state';
import LinearInterpolator from '../transitions/linear-interpolator';
import type Viewport from '../viewports/viewport';
export declare type MapStateProps = {
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
declare type MapStateInternal = {
  /** Interaction states, required to calculate change during transform */
  startPanLngLat?: [number, number];
  startZoomLngLat?: [number, number];
  startRotatePos?: [number, number];
  /** Bearing when current perspective rotate operation started */
  startBearing?: number;
  /** Pitch when current perspective rotate operation started */
  startPitch?: number;
  /** Zoom when current zoom operation started */
  startZoom?: number;
};
export declare class MapState extends ViewState<MapState, MapStateProps, MapStateInternal> {
  makeViewport: (props: Record<string, any>) => Viewport;
  constructor(
    options: MapStateProps &
      MapStateInternal & {
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  );
  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}: {pos: [number, number]}): MapState;
  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   * @param {[Number, Number], optional} startPos - where the pointer grabbed at
   *   the start of the operation. Must be supplied of `panStart()` was not called
   */
  pan({pos, startPos}: {pos: [number, number]; startPos?: [number, number]}): MapState;
  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): MapState;
  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotateStart({pos}: {pos: [number, number]}): MapState;
  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotate({
    pos,
    deltaAngleX,
    deltaAngleY
  }: {
    pos?: [number, number];
    deltaAngleX?: number;
    deltaAngleY?: number;
  }): MapState;
  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd(): MapState;
  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  zoomStart({pos}: {pos: [number, number]}): MapState;
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
  }): MapState;
  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): MapState;
  zoomIn(speed?: number): MapState;
  zoomOut(speed?: number): MapState;
  moveLeft(speed?: number): MapState;
  moveRight(speed?: number): MapState;
  moveUp(speed?: number): MapState;
  moveDown(speed?: number): MapState;
  rotateLeft(speed?: number): MapState;
  rotateRight(speed?: number): MapState;
  rotateUp(speed?: number): MapState;
  rotateDown(speed?: number): MapState;
  shortestPathFrom(viewState: MapState): MapStateProps;
  applyConstraints(props: Required<MapStateProps>): Required<MapStateProps>;
  _zoomFromCenter(scale: any): MapState;
  _panFromCenter(offset: any): MapState;
  _getUpdatedState(newProps: any): MapState;
  _unproject(pos?: [number, number]): [number, number] | undefined;
  _getNewRotation(
    pos: [number, number],
    startPos: [number, number],
    startPitch: number,
    startBearing: number
  ): {
    pitch: number;
    bearing: number;
  };
}
export default class MapController extends Controller<MapState> {
  ControllerState: typeof MapState;
  transition: {
    transitionDuration: number;
    transitionInterpolator: LinearInterpolator;
  };
  dragMode: 'pan' | 'rotate';
  setProps(props: ControllerProps & MapStateProps): void;
}
export {};
// # sourceMappingURL=map-controller.d.ts.map
