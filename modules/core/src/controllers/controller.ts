// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-statements, complexity */
import TransitionManager, {TransitionProps} from './transition-manager';
import LinearInterpolator from '../transitions/linear-interpolator';
import {IViewState} from './view-state';
import {ConstructorOf} from '../types/types';

import type Viewport from '../viewports/viewport';

import type {EventManager, MjolnirEvent, MjolnirGestureEvent, MjolnirWheelEvent, MjolnirKeyEvent} from 'mjolnir.js';
import type {Timeline} from '@luma.gl/engine';

const NO_TRANSITION_PROPS = {
  transitionDuration: 0
} as const;

const DEFAULT_INERTIA = 300;
const INERTIA_EASING = t => 1 - (1 - t) * (1 - t);

const EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  MULTI_PAN: ['multipanstart', 'multipanmove', 'multipanend'],
  DOUBLE_CLICK: ['dblclick'],
  KEYBOARD: ['keydown']
} as const;

/** Configuration of how user input is handled */
export type ControllerOptions = {
  /** Enable zooming with mouse wheel. Default `true`. */
  scrollZoom?: boolean | {
    /** Scaler that translates wheel delta to the change of viewport scale. Default `0.01`. */
    speed?: number;
    /** Smoothly transition to the new zoom. If enabled, will provide a slightly lagged but smoother experience. Default `false`. */
    smooth?: boolean
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

export type ControllerProps = {
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
} & ControllerOptions & TransitionProps;

/** The state of a controller */
export type InteractionState = {
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
}

/** Parameters passed to the onViewStateChange callback */
export type ViewStateChangeParameters<ViewStateT = any> = {
  viewId: string;
  /** The next view state, either from user input or transition */
  viewState: ViewStateT;
  /** Object describing the nature of the view state change */
  interactionState: InteractionState;
  /** The current view state */
  oldViewState?: ViewStateT;
}

const pinchEventWorkaround: any = {};

export default abstract class Controller<ControllerState extends IViewState<ControllerState>> {
  abstract get ControllerState(): ConstructorOf<ControllerState>;
  abstract get transition(): TransitionProps;

  // @ts-expect-error (2564) - not assigned in the constructor
  protected props: ControllerProps;
  protected state: Record<string, any> = {};

  protected transitionManager: TransitionManager<ControllerState>;
  protected eventManager: EventManager;
  protected onViewStateChange: (params: ViewStateChangeParameters) => void;
  protected onStateChange: (state: InteractionState) => void;
  protected makeViewport: (opts: Record<string, any>) => Viewport

  private _controllerState?: ControllerState;
  private _events: Record<string, boolean> = {};
  private _interactionState: InteractionState = {
    isDragging: false
  };
  private _customEvents: string[] = [];
  private _eventStartBlocked: any = null;
  private _panMove: boolean = false;

  protected invertPan: boolean = false;
  protected dragMode: 'pan' | 'rotate' = 'rotate';
  protected inertia: number = 0;
  protected scrollZoom: boolean | {speed?: number; smooth?: boolean} = true;
  protected dragPan: boolean = true;
  protected dragRotate: boolean = true;
  protected doubleClickZoom: boolean = true;
  protected touchZoom: boolean = true;
  protected touchRotate: boolean = false;
  protected keyboard:
    | boolean
    | {
        zoomSpeed?: number; //  speed of zoom using +/- keys. Default 2.
        moveSpeed?: number; //  speed of movement using arrow keys, in pixels.
        rotateSpeedX?: number; //  speed of rotation using shift + left/right arrow keys, in degrees. Default 15.
        rotateSpeedY?: number; //  speed of rotation using shift + up/down arrow keys, in degrees. Default 10.
      } = true;

  constructor(opts: {
    timeline: Timeline,
    eventManager: EventManager;
    makeViewport: (opts: Record<string, any>) => Viewport;
    onViewStateChange: (params: ViewStateChangeParameters) => void;
    onStateChange: (state: InteractionState) => void;
  }) {
    this.transitionManager = new TransitionManager<ControllerState>({
      ...opts,
      getControllerState: props => new this.ControllerState(props),
      onViewStateChange: this._onTransition.bind(this),
      onStateChange: this._setInteractionState.bind(this)
    });

    this.handleEvent = this.handleEvent.bind(this);

    this.eventManager = opts.eventManager;
    this.onViewStateChange = opts.onViewStateChange || (() => {});
    this.onStateChange = opts.onStateChange || (() => {});
    this.makeViewport = opts.makeViewport;
  }

  set events(customEvents) {
    this.toggleEvents(this._customEvents, false);
    this.toggleEvents(customEvents, true);
    this._customEvents = customEvents;
    // Make sure default events are not overwritten
    if (this.props) {
      this.setProps(this.props);
    }
  }

  finalize() {
    for (const eventName in this._events) {
      if (this._events[eventName]) {
        // @ts-ignore (2345) event type string cannot be assifned to enum
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.eventManager?.off(eventName, this.handleEvent);
      }
    }
    this.transitionManager.finalize();
  }

  /**
   * Callback for events
   */
  handleEvent(event: MjolnirEvent) {
    // Force recalculate controller state
    this._controllerState = undefined;
    const eventStartBlocked = this._eventStartBlocked;

    switch (event.type) {
      case 'panstart':
        return eventStartBlocked ? false : this._onPanStart(event);
      case 'panmove':
        return this._onPan(event);
      case 'panend':
        return this._onPanEnd(event);
      case 'pinchstart':
        return eventStartBlocked ? false : this._onPinchStart(event);
      case 'pinchmove':
        return this._onPinch(event);
      case 'pinchend':
        return this._onPinchEnd(event);
      case 'multipanstart':
        return eventStartBlocked ? false : this._onMultiPanStart(event);
      case 'multipanmove':
        return this._onMultiPan(event);
      case 'multipanend':
        return this._onMultiPanEnd(event);
      case 'dblclick':
        return this._onDoubleClick(event);
      case 'wheel':
        return this._onWheel(event as MjolnirWheelEvent);
      case 'keydown':
        return this._onKeyDown(event as MjolnirKeyEvent);
      default:
        return false;
    }
  }

  /* Event utils */
  // Event object: http://hammerjs.github.io/api/#event-object
  get controllerState(): ControllerState {
    this._controllerState = this._controllerState || new this.ControllerState({
      makeViewport: this.makeViewport,
      ...this.props,
      ...this.state
    });
    return this._controllerState ;
  }

  getCenter(event: MjolnirGestureEvent | MjolnirWheelEvent) : [number, number] {
    const {x, y} = this.props;
    const {offsetCenter} = event;
    return [offsetCenter.x - x, offsetCenter.y - y];
  }

  isPointInBounds(pos: [number, number], event: MjolnirEvent): boolean {
    const {width, height} = this.props;
    if (event && event.handled) {
      return false;
    }

    const inside = pos[0] >= 0 && pos[0] <= width && pos[1] >= 0 && pos[1] <= height;
    if (inside && event) {
      event.stopPropagation();
    }
    return inside;
  }

  isFunctionKeyPressed(event: MjolnirEvent): boolean {
    const {srcEvent} = event;
    return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
  }

  isDragging(): boolean {
    return this._interactionState.isDragging || false;
  }

  // When a multi-touch event ends, e.g. pinch, not all pointers are lifted at the same time.
  // This triggers a brief `pan` event.
  // Calling this method will temporarily disable *start events to avoid conflicting transitions.
  blockEvents(timeout: number): void {
    /* global setTimeout */
    const timer = setTimeout(() => {
      if (this._eventStartBlocked === timer) {
        this._eventStartBlocked = null;
      }
    }, timeout);
    this._eventStartBlocked = timer;
  }

  /**
   * Extract interactivity options
   */
  setProps(props: ControllerProps) {
    if (props.dragMode) {
      this.dragMode = props.dragMode;
    }
    this.props = props;

    if (!('transitionInterpolator' in props)) {
      // Add default transition interpolator
      props.transitionInterpolator = this._getTransitionProps().transitionInterpolator;
    }

    this.transitionManager.processViewStateChange(props);

    const {inertia} = props;
    this.inertia = Number.isFinite(inertia) ? (inertia as number) : (inertia === true ? DEFAULT_INERTIA : 0);

    // TODO - make sure these are not reset on every setProps
    const {
      scrollZoom = true,
      dragPan = true,
      dragRotate = true,
      doubleClickZoom = true,
      touchZoom = true,
      touchRotate = false,
      keyboard = true
    } = props;

    // Register/unregister events
    const isInteractive = Boolean(this.onViewStateChange);
    this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
    // We always need the pan events to set the correct isDragging state, even if dragPan & dragRotate are both false
    this.toggleEvents(EVENT_TYPES.PAN, isInteractive);
    this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && (touchZoom || touchRotate));
    this.toggleEvents(EVENT_TYPES.MULTI_PAN, isInteractive && touchRotate);
    this.toggleEvents(EVENT_TYPES.DOUBLE_CLICK, isInteractive && doubleClickZoom);
    this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

    // Interaction toggles
    this.scrollZoom = scrollZoom;
    this.dragPan = dragPan;
    this.dragRotate = dragRotate;
    this.doubleClickZoom = doubleClickZoom;
    this.touchZoom = touchZoom;
    this.touchRotate = touchRotate;
    this.keyboard = keyboard;
  }

  updateTransition() {
    this.transitionManager.updateTransition();
  }

  toggleEvents(eventNames, enabled) {
    if (this.eventManager) {
      eventNames.forEach(eventName => {
        if (this._events[eventName] !== enabled) {
          this._events[eventName] = enabled;
          if (enabled) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.eventManager.on(eventName, this.handleEvent);
          } else {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.eventManager.off(eventName, this.handleEvent);
          }
        }
      });
    }
  }

  // Private Methods

  /* Callback util */
  // formats map state and invokes callback function
  protected updateViewport(newControllerState: ControllerState, extraProps: Record<string, any> | null = null, interactionState: InteractionState = {}) {
    const viewState = {...newControllerState.getViewportProps(), ...extraProps};

    // TODO - to restore diffing, we need to include interactionState
    const changed = this.controllerState !== newControllerState;
    // const oldViewState = this.controllerState.getViewportProps();
    // const changed = Object.keys(viewState).some(key => oldViewState[key] !== viewState[key]);

    this.state = newControllerState.getState();
    this._setInteractionState(interactionState);

    if (changed) {
      const oldViewState = this.controllerState && this.controllerState.getViewportProps();
      if (this.onViewStateChange) {
        this.onViewStateChange({viewState, interactionState: this._interactionState, oldViewState, viewId: this.props.id});
      }
    }
  }

  private _onTransition(params: {viewState: Record<string, any>, oldViewState: Record<string, any>}) {
    this.onViewStateChange({...params, interactionState: this._interactionState, viewId: this.props.id});
  }

  private _setInteractionState(newStates: InteractionState) {
    Object.assign(this._interactionState, newStates);
    this.onStateChange(this._interactionState);
  }

  /* Event handlers */
  // Default handler for the `panstart` event.
  protected _onPanStart(event: MjolnirGestureEvent): boolean {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    let alternateMode = this.isFunctionKeyPressed(event) || event.rightButton || false;
    if (this.invertPan || this.dragMode === 'pan') {
      // invertPan is replaced by props.dragMode, keeping for backward compatibility
      alternateMode = !alternateMode;
    }
    const newControllerState = this.controllerState[alternateMode ? 'panStart' : 'rotateStart']({
      pos
    });
    this._panMove = alternateMode;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
    return true;
  }

  // Default handler for the `panmove` and `panend` event.
  protected _onPan(event: MjolnirGestureEvent): boolean {
    if (!this.isDragging()) {
      return false;
    }
    return this._panMove ? this._onPanMove(event) : this._onPanRotate(event);
  }

  protected _onPanEnd(event: MjolnirGestureEvent): boolean {
    if (!this.isDragging()) {
      return false;
    }
    return this._panMove ? this._onPanMoveEnd(event) : this._onPanRotateEnd(event);
  }

  // Default handler for panning to move.
  // Called by `_onPan` when panning without function key pressed.
  protected _onPanMove(event: MjolnirGestureEvent): boolean {
    if (!this.dragPan) {
      return false;
    }
    const pos = this.getCenter(event);
    const newControllerState = this.controllerState.pan({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: true
    });
    return true;
  }

  protected _onPanMoveEnd(event: MjolnirGestureEvent): boolean {
    const {inertia} = this;
    if (this.dragPan && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos: [number, number] = [
        pos[0] + (event.velocityX * inertia) / 2,
        pos[1] + (event.velocityY * inertia) / 2
      ];
      const newControllerState = this.controllerState.pan({pos: endPos}).panEnd();
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isPanning: true
        }
      );
    } else {
      const newControllerState = this.controllerState.panEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false
      });
    }
    return true;
  }

  // Default handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  protected _onPanRotate(event: MjolnirGestureEvent): boolean {
    if (!this.dragRotate) {
      return false;
    }

    const pos = this.getCenter(event);
    const newControllerState = this.controllerState.rotate({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
    return true;
  }

  protected _onPanRotateEnd(event): boolean {
    const {inertia} = this;
    if (this.dragRotate && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos: [number, number] = [
        pos[0] + (event.velocityX * inertia) / 2,
        pos[1] + (event.velocityY * inertia) / 2
      ];
      const newControllerState = this.controllerState.rotate({pos: endPos}).rotateEnd();
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isRotating: true
        }
      );
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
    }
    return true;
  }

  // Default handler for the `wheel` event.
  protected _onWheel(event: MjolnirWheelEvent): boolean {
    if (!this.scrollZoom) {
      return false;
    }

    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    event.srcEvent.preventDefault();

    const {speed = 0.01, smooth = false} = this.scrollZoom === true ? {} : this.scrollZoom;
    const {delta} = event;

    // Map wheel delta to relative scale
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }

    const newControllerState = this.controllerState.zoom({pos, scale});
    this.updateViewport(
      newControllerState,
      {...this._getTransitionProps({around: pos}), transitionDuration: smooth ? 250 : 1},
      {
        isZooming: true,
        isPanning: true
      }
    );
    return true;
  }

  protected _onMultiPanStart(event: MjolnirGestureEvent): boolean {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    const newControllerState = this.controllerState.rotateStart({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
    return true;
  }

  protected _onMultiPan(event: MjolnirGestureEvent): boolean {
    if (!this.touchRotate) {
      return false;
    }
    if (!this.isDragging()) {
      return false;
    }

    const pos = this.getCenter(event);
    pos[0] -= event.deltaX;

    const newControllerState = this.controllerState.rotate({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
    return true;
  }

  protected _onMultiPanEnd(event: MjolnirGestureEvent): boolean {
    if (!this.isDragging()) {
      return false;
    }
    const {inertia} = this;
    if (this.touchRotate && inertia && event.velocityY) {
      const pos = this.getCenter(event);
      const endPos: [number, number] = [pos[0], (pos[1] += (event.velocityY * inertia) / 2)];
      const newControllerState = this.controllerState.rotate({pos: endPos});
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isRotating: true
        }
      );
      this.blockEvents(inertia);
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
    }
    return true;
  }

  // Default handler for the `pinchstart` event.
  protected _onPinchStart(event: MjolnirGestureEvent): boolean {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }

    const newControllerState = this.controllerState.zoomStart({pos}).rotateStart({pos});
    // hack - hammer's `rotation` field doesn't seem to produce the correct angle
    pinchEventWorkaround._startPinchRotation = event.rotation;
    pinchEventWorkaround._lastPinchEvent = event;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
    return true;
  }

  // Default handler for the `pinchmove` and `pinchend` events.
  protected _onPinch(event: MjolnirGestureEvent): boolean {
    if (!this.touchZoom && !this.touchRotate) {
      return false;
    }
    if (!this.isDragging()) {
      return false;
    }

    let newControllerState = this.controllerState;
    if (this.touchZoom) {
      const {scale} = event;
      const pos = this.getCenter(event);
      newControllerState = newControllerState.zoom({pos, scale});
    }
    if (this.touchRotate) {
      const {rotation} = event;
      newControllerState = newControllerState.rotate({
        deltaAngleX: pinchEventWorkaround._startPinchRotation - rotation
      });
    }

    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: this.touchZoom,
      isZooming: this.touchZoom,
      isRotating: this.touchRotate
    });
    pinchEventWorkaround._lastPinchEvent = event;
    return true;
  }

  protected _onPinchEnd(event: MjolnirGestureEvent): boolean {
    if (!this.isDragging()) {
      return false;
    }
    const {inertia} = this;
    const {_lastPinchEvent} = pinchEventWorkaround;
    if (this.touchZoom && inertia && _lastPinchEvent && event.scale !== _lastPinchEvent.scale) {
      const pos = this.getCenter(event);
      let newControllerState = this.controllerState.rotateEnd();
      const z = Math.log2(event.scale);
      const velocityZ =
        (z - Math.log2(_lastPinchEvent.scale)) / (event.deltaTime - _lastPinchEvent.deltaTime);
      const endScale = Math.pow(2, z + (velocityZ * inertia) / 2);
      newControllerState = newControllerState.zoom({pos, scale: endScale}).zoomEnd();

      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps({around: pos}),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isPanning: this.touchZoom,
          isZooming: this.touchZoom,
          isRotating: false
        }
      );
      this.blockEvents(inertia);
    } else {
      const newControllerState = this.controllerState.zoomEnd().rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false,
        isZooming: false,
        isRotating: false
      });
    }
    pinchEventWorkaround._startPinchRotation = null;
    pinchEventWorkaround._lastPinchEvent = null;
    return true;
  }

  // Default handler for the `dblclick` event.
  protected _onDoubleClick(event: MjolnirGestureEvent): boolean {
    if (!this.doubleClickZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }

    const isZoomOut = this.isFunctionKeyPressed(event);

    const newControllerState = this.controllerState.zoom({pos, scale: isZoomOut ? 0.5 : 2});
    this.updateViewport(newControllerState, this._getTransitionProps({around: pos}), {
      isZooming: true,
      isPanning: true
    });
    this.blockEvents(100);
    return true;
  }

  // Default handler for the `keydown` event
  protected _onKeyDown(event: MjolnirKeyEvent): boolean {
    if (!this.keyboard) {
      return false;
    }
    const funcKey = this.isFunctionKeyPressed(event);
    // @ts-ignore
    const {zoomSpeed, moveSpeed, rotateSpeedX, rotateSpeedY} = this.keyboard === true ? {} : this.keyboard;
    const {controllerState} = this;
    let newControllerState;
    const interactionState: InteractionState = {};

    switch (event.srcEvent.code) {
      case 'Minus':
        newControllerState = funcKey
          ? controllerState.zoomOut(zoomSpeed).zoomOut(zoomSpeed)
          : controllerState.zoomOut(zoomSpeed);
        interactionState.isZooming = true;
        break;
      case 'Equal':
        newControllerState = funcKey
          ? controllerState.zoomIn(zoomSpeed).zoomIn(zoomSpeed)
          : controllerState.zoomIn(zoomSpeed);
        interactionState.isZooming = true;
        break;
      case 'ArrowLeft':
        if (funcKey) {
          newControllerState = controllerState.rotateLeft(rotateSpeedX);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveLeft(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case 'ArrowRight':
        if (funcKey) {
          newControllerState = controllerState.rotateRight(rotateSpeedX);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveRight(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case 'ArrowUp':
        if (funcKey) {
          newControllerState = controllerState.rotateUp(rotateSpeedY);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveUp(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case 'ArrowDown':
        if (funcKey) {
          newControllerState = controllerState.rotateDown(rotateSpeedY);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveDown(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      default:
        return false;
    }
    this.updateViewport(newControllerState, this._getTransitionProps(), interactionState);
    return true;
  }

  protected _getTransitionProps(opts?: any): TransitionProps {
    const {transition} = this;

    if (!transition || !transition.transitionInterpolator) {
      return NO_TRANSITION_PROPS;
    }

    // Enables Transitions on double-tap and key-down events.
    return opts
      ? {
        ...transition,
        transitionInterpolator: new LinearInterpolator({
          ...opts,
          ...(transition.transitionInterpolator as LinearInterpolator).opts,
          makeViewport: this.controllerState.makeViewport
        })
      }
      : transition;
  }
}
