import TransitionManager, {TransitionProps} from './transition-manager';
import {IViewState} from './view-state';
import {ConstructorOf} from '../types/types';
import type Viewport from '../viewports/viewport';
import type {
  EventManager,
  MjolnirEvent,
  MjolnirGestureEvent,
  MjolnirWheelEvent,
  MjolnirKeyEvent
} from 'mjolnir.js';
import type {Timeline} from '@luma.gl/engine';
/** Configuration of how user input is handled */
export declare type ControllerOptions = {
  /** Enable zooming with mouse wheel. Default `true`. */
  scrollZoom?:
    | boolean
    | {
        /** Scaler that translates wheel delta to the change of viewport scale. Default `0.01`. */
        speed?: number;
        /** Smoothly transition to the new zoom. If enabled, will provide a slightly lagged but smoother experience. Default `false`. */
        smooth?: boolean;
      };
  /** Enable panning with pointer drag. Default `true` */
  dragPan?: boolean;
  /** Enable rotating with pointer drag. Default `true` */
  dragRotate?: boolean;
  /** Enable zooming with double click. Default `true` */
  doubleClickZoom?: boolean;
  /** Enable zooming with multi-touch. Default `true` */
  touchZoom?: boolean;
  /** Enable rotating with multi-touch. Use two-finger rotating gesture for horizontal and three-finger swiping gesture for vertical rotation. Default `false` */
  touchRotate?: boolean;
  /** Enable interaction with keyboard. Default `true`. */
  keyboard?:
    | boolean
    | {
        /** Speed of zoom using +/- keys. Default `2` */
        zoomSpeed?: number;
        /** Speed of movement using arrow keys, in pixels. */
        moveSpeed?: number;
        /** Speed of rotation using shift + left/right arrow keys, in degrees. Default 15. */
        rotateSpeedX?: number;
        /** Speed of rotation using shift + up/down arrow keys, in degrees. Default 10. */
        rotateSpeedY?: number;
      };
  /** Drag behavior without pressing function keys, one of `pan` and `rotate`. */
  dragMode?: 'pan' | 'rotate';
  /** Enable inertia after panning/pinching. If a number is provided, indicates the duration of time over which the velocity reduces to zero, in milliseconds. Default `false`. */
  inertia?: boolean | number;
};
export declare type ControllerProps = {
  /** Identifier of the controller */
  id: string;
  /** Viewport x position */
  x: number;
  /** Viewport y position */
  y: number;
  /** Viewport width */
  width: number;
  /** Viewport height */
  height: number;
} & ControllerOptions &
  TransitionProps;
/** The state of a controller */
export declare type InteractionState = {
  /** If the view state is in transition */
  inTransition?: boolean;
  /** If the user is dragging */
  isDragging?: boolean;
  /** If the view is being panned, either from user input or transition */
  isPanning?: boolean;
  /** If the view is being rotated, either from user input or transition */
  isRotating?: boolean;
  /** If the view is being zoomed, either from user input or transition */
  isZooming?: boolean;
};
/** Parameters passed to the onViewStateChange callback */
export declare type ViewStateChangeParameters = {
  /** The next view state, either from user input or transition */
  viewState: Record<string, any>;
  /** Object describing the nature of the view state change */
  interactionState: InteractionState;
  /** The current view state */
  oldViewState?: Record<string, any>;
};
export default abstract class Controller<ControllerState extends IViewState<ControllerState>> {
  abstract get ControllerState(): ConstructorOf<ControllerState>;
  abstract get transition(): TransitionProps;
  protected props: ControllerProps;
  protected state: Record<string, any>;
  protected transitionManager: TransitionManager<ControllerState>;
  protected eventManager: EventManager;
  protected onViewStateChange: (params: ViewStateChangeParameters) => void;
  protected onStateChange: (state: InteractionState) => void;
  protected makeViewport: (opts: Record<string, any>) => Viewport;
  private _controllerState?;
  private _events;
  private _interactionState;
  private _customEvents;
  private _eventStartBlocked;
  private _panMove;
  protected invertPan: boolean;
  protected dragMode: 'pan' | 'rotate';
  protected inertia: number;
  protected scrollZoom:
    | boolean
    | {
        speed?: number;
        smooth?: boolean;
      };
  protected dragPan: boolean;
  protected dragRotate: boolean;
  protected doubleClickZoom: boolean;
  protected touchZoom: boolean;
  protected touchRotate: boolean;
  protected keyboard:
    | boolean
    | {
        zoomSpeed?: number;
        moveSpeed?: number;
        rotateSpeedX?: number;
        rotateSpeedY?: number;
      };
  constructor(opts: {
    timeline: Timeline;
    eventManager: EventManager;
    makeViewport: (opts: Record<string, any>) => Viewport;
    onViewStateChange: (params: ViewStateChangeParameters) => void;
    onStateChange: (state: InteractionState) => void;
  });
  set events(customEvents: any);
  finalize(): void;
  /**
   * Callback for events
   */
  handleEvent(event: MjolnirEvent): boolean;
  get controllerState(): ControllerState;
  getCenter(event: MjolnirGestureEvent | MjolnirWheelEvent): [number, number];
  isPointInBounds(pos: [number, number], event: MjolnirEvent): boolean;
  isFunctionKeyPressed(event: MjolnirEvent): boolean;
  isDragging(): boolean;
  blockEvents(timeout: number): void;
  /**
   * Extract interactivity options
   */
  setProps(props: ControllerProps): void;
  updateTransition(): void;
  toggleEvents(eventNames: any, enabled: any): void;
  protected updateViewport(
    newControllerState: ControllerState,
    extraProps?: Record<string, any> | null,
    interactionState?: InteractionState
  ): void;
  private _onTransition;
  private _setInteractionState;
  protected _onPanStart(event: MjolnirGestureEvent): boolean;
  protected _onPan(event: MjolnirGestureEvent): boolean;
  protected _onPanEnd(event: MjolnirGestureEvent): boolean;
  protected _onPanMove(event: MjolnirGestureEvent): boolean;
  protected _onPanMoveEnd(event: MjolnirGestureEvent): boolean;
  protected _onPanRotate(event: MjolnirGestureEvent): boolean;
  protected _onPanRotateEnd(event: any): boolean;
  protected _onWheel(event: MjolnirWheelEvent): boolean;
  protected _onTriplePanStart(event: MjolnirGestureEvent): boolean;
  protected _onTriplePan(event: MjolnirGestureEvent): boolean;
  protected _onTriplePanEnd(event: MjolnirGestureEvent): boolean;
  protected _onPinchStart(event: MjolnirGestureEvent): boolean;
  protected _onPinch(event: MjolnirGestureEvent): boolean;
  protected _onPinchEnd(event: MjolnirGestureEvent): boolean;
  protected _onDoubleTap(event: MjolnirGestureEvent): boolean;
  protected _onKeyDown(event: MjolnirKeyEvent): boolean;
  protected _getTransitionProps(opts?: any): TransitionProps;
}
// # sourceMappingURL=controller.d.ts.map
