import Controller from './controller';
import ViewState from './view-state';
import type Viewport from '../viewports/viewport';
import LinearInterpolator from '../transitions/linear-interpolator';
export declare type OrbitStateProps = {
  width: number;
  height: number;
  target?: number[];
  zoom?: number | number[];
  rotationX?: number;
  rotationOrbit?: number;
  /** Viewport constraints */
  maxZoom?: number;
  minZoom?: number;
  minRotationX?: number;
  maxRotationX?: number;
};
declare type OrbitStateInternal = {
  startPanPosition?: number[];
  startRotatePos?: number[];
  startRotationX?: number;
  startRotationOrbit?: number;
  startZoomPosition?: number[];
  startZoom?: number | number[];
};
export declare class OrbitState extends ViewState<OrbitState, OrbitStateProps, OrbitStateInternal> {
  makeViewport: (props: Record<string, any>) => Viewport;
  constructor(
    options: OrbitStateProps &
      OrbitStateInternal & {
        makeViewport: (props: Record<string, any>) => Viewport;
      }
  );
  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({pos}: {pos: [number, number]}): OrbitState;
  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({pos, startPosition}: {pos: [number, number]; startPosition?: number[]}): OrbitState;
  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd(): OrbitState;
  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({pos}: {pos: [number, number]}): OrbitState;
  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({
    pos,
    deltaAngleX,
    deltaAngleY
  }: {
    pos?: [number, number];
    deltaAngleX?: number;
    deltaAngleY?: number;
  }): OrbitState;
  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd(): OrbitState;
  shortestPathFrom(viewState: OrbitState): OrbitStateProps;
  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({pos}: {pos: [number, number]}): OrbitState;
  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current target is
   * @param {[Number, Number]} startPos - the target position at
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
  }): OrbitState;
  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd(): OrbitState;
  zoomIn(speed?: number): OrbitState;
  zoomOut(speed?: number): OrbitState;
  moveLeft(speed?: number): OrbitState;
  moveRight(speed?: number): OrbitState;
  moveUp(speed?: number): OrbitState;
  moveDown(speed?: number): OrbitState;
  rotateLeft(speed?: number): OrbitState;
  rotateRight(speed?: number): OrbitState;
  rotateUp(speed?: number): OrbitState;
  rotateDown(speed?: number): OrbitState;
  _unproject(pos?: number[]): number[] | undefined;
  _calculateNewZoom({
    scale,
    startZoom
  }: {
    scale: number;
    startZoom?: number | number[];
  }): number | number[];
  _panFromCenter(offset: any): OrbitState;
  _getUpdatedState(newProps: any): OrbitState;
  applyConstraints(props: Required<OrbitStateProps>): Required<OrbitStateProps>;
}
export default class OrbitController extends Controller<OrbitState> {
  ControllerState: typeof OrbitState;
  transition: {
    transitionDuration: number;
    transitionInterpolator: LinearInterpolator;
  };
}
export {};
// # sourceMappingURL=orbit-controller.d.ts.map
