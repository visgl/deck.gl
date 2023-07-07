// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import LayerManager from './layer-manager';
import ViewManager from './view-manager';
import MapView from '../views/map-view';
import EffectManager from './effect-manager';
import DeckRenderer from './deck-renderer';
import DeckPicker from './deck-picker';
import Tooltip from './tooltip';
import log from '../utils/log';
import {deepEqual} from '../utils/deep-equal';
import typedArrayManager from '../utils/typed-array-manager';
import {VERSION} from './init';

import {getBrowser} from '@probe.gl/env';
import GL from '@luma.gl/constants';
import {
  AnimationLoop,
  createGLContext,
  instrumentGLContext,
  setParameters,
  Timeline,
  lumaStats
} from '@luma.gl/core';
import {Stats} from '@probe.gl/stats';
import {EventManager} from 'mjolnir.js';

import assert from '../utils/assert';
import {EVENTS} from './constants';

import type {Effect} from './effect';
import type {FilterContext} from '../passes/layers-pass';
import type Layer from './layer';
import type View from '../views/view';
import type Viewport from '../viewports/viewport';
import type {RecognizerOptions, MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
import type {Framebuffer} from '@luma.gl/core';
import type {TypedArrayManagerOptions} from '../utils/typed-array-manager';
import type {ViewStateChangeParameters, InteractionState} from '../controllers/controller';
import type {PickingInfo} from './picking/pick-info';
import type {PickByPointOptions, PickByRectOptions} from './deck-picker';
import type {LayersList} from './layer-manager';
import type {TooltipContent} from './tooltip';

/* global document */

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const getCursor = ({isDragging}) => (isDragging ? 'grabbing' : 'grab');

export type DeckMetrics = {
  fps: number;
  setPropsTime: number;
  updateAttributesTime: number;
  framesRedrawn: number;
  pickTime: number;
  pickCount: number;
  gpuTime: number;
  gpuTimePerFrame: number;
  cpuTime: number;
  cpuTimePerFrame: number;
  bufferMemory: number;
  textureMemory: number;
  renderbufferMemory: number;
  gpuMemory: number;
};

type CursorState = {
  /** Whether the cursor is over a pickable object */
  isHovering: boolean;
  /** Whether the cursor is down */
  isDragging: boolean;
};

export type DeckProps = {
  /** Id of this Deck instance */
  id?: string;
  /** Width of the canvas, a number in pixels or a valid CSS string.
   * @default `'100%'`
   */
  width?: string | number | null;
  /** Height of the canvas, a number in pixels or a valid CSS string.
   * @default `'100%'`
   */
  height?: string | number | null;
  /** Additional CSS styles for the canvas. */
  style?: Partial<CSSStyleDeclaration> | null;

  /** Controls the resolution of drawing buffer used for rendering.
   * @default `true` (use browser devicePixelRatio)
   */
  useDevicePixels?: boolean | number;
  /** Extra pixels around the pointer to include while picking.
   * @default `0`
   */
  pickingRadius?: number;

  /** WebGL parameters to be set before each frame is rendered.
   * @see https://github.com/visgl/luma.gl/blob/8.5-release/modules/gltools/docs/api-reference/parameter-setting.md#parameters
   */
  parameters?: any;
  /** If supplied, will be called before a layer is drawn to determine whether it should be rendered. */
  layerFilter?: ((context: FilterContext) => boolean) | null;

  /** The container to append the auto-created canvas to.
   * @default `document.body`
   */
  parent?: HTMLDivElement | null;
  /** The canvas to render into.
   * Can be either a HTMLCanvasElement or the element id.
   * Will be auto-created if not supplied.
   */
  canvas?: HTMLCanvasElement | string | null;
  /** WebGL context. Will be auto-created if not supplied. */
  gl?: WebGLRenderingContext | null;
  /** Additional options used when creating the WebGL context. */
  glOptions?: WebGLContextAttributes;

  /**
   * The array of Layer instances to be rendered.
   * Nested arrays are accepted, as well as falsy values (`null`, `false`, `undefined`)
   */
  layers?: LayersList;
  /** The array of effects to be rendered. A lighting effect will be added if an empty array is supplied. */
  effects?: Effect[];
  /** A single View instance, or an array of `View` instances.
   * @default `new MapView()`
   */
  views?: View | View[] | null;
  /** Options for viewport interactivity, e.g. pan, rotate and zoom with mouse, touch and keyboard.
   * This is a shorthand for defining interaction with the `views` prop if you are using the default view (i.e. a single `MapView`)
   */
  controller?: View['props']['controller'];
  /**
   * An object that describes the view state for each view in the `views` prop.
   * Use if the camera state should be managed external to the `Deck` instance.
   */
  viewState?: any;
  /**
   * If provided, the `Deck` instance will track camera state changes automatically,
   * with `initialViewState` as its initial settings.
   */
  initialViewState?: any;

  /** Allow browser default touch actions.
   * @default `'none'`
   */
  touchAction?: string;
  /** Set Hammer.js recognizer options for gesture recognition. See documentation for details. */
  eventRecognizerOptions?: {
    [type: string]: RecognizerOptions;
  };

  /** (Experimental) Render to a custom frame buffer other than to screen. */
  _framebuffer?: Framebuffer | null;
  /** (Experimental) Forces deck.gl to redraw layers every animation frame. */
  _animate?: boolean;
  /** (Experimental) If set to `false`, force disables all picking features, disregarding the `pickable` prop set in any layer. */
  _pickable?: boolean;
  /** (Experimental) Fine-tune attribute memory usage. See documentation for details. */
  _typedArrayManagerProps?: TypedArrayManagerOptions;

  /** Called once the WebGL context has been initiated. */
  onWebGLInitialized?: (gl: WebGLRenderingContext) => void;
  /** Called when the canvas resizes. */
  onResize?: (dimensions: {width: number; height: number}) => void;
  /** Called when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard. */
  onViewStateChange?: (params: ViewStateChangeParameters & {viewId: string}) => any;
  /** Called when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard. */
  onInteractionStateChange?: (state: InteractionState) => void;
  /** Called just before the canvas rerenders. */
  onBeforeRender?: (context: {gl: WebGLRenderingContext}) => void;
  /** Called right after the canvas rerenders. */
  onAfterRender?: (context: {gl: WebGLRenderingContext}) => void;
  /** Called once after gl context and all Deck components are created. */
  onLoad?: () => void;
  /** Called if deck.gl encounters an error.
   * If this callback is set to `null`, errors are silently ignored.
   * @default `console.error`
   */
  onError?: ((error: Error, layer?: Layer) => void) | null;
  /** Called when the pointer moves over the canvas. */
  onHover?: ((info: PickingInfo, event: MjolnirPointerEvent) => void) | null;
  /** Called when clicking on the canvas. */
  onClick?: ((info: PickingInfo, event: MjolnirGestureEvent) => void) | null;
  /** Called when the user starts dragging on the canvas. */
  onDragStart?: ((info: PickingInfo, event: MjolnirGestureEvent) => void) | null;
  /** Called when dragging the canvas. */
  onDrag?: ((info: PickingInfo, event: MjolnirGestureEvent) => void) | null;
  /** Called when the user releases from dragging the canvas. */
  onDragEnd?: ((info: PickingInfo, event: MjolnirGestureEvent) => void) | null;

  /** (Experimental) Replace the default redraw procedure */
  _customRender?: ((reason: string) => void) | null;
  /** (Experimental) Called once every second with performance metrics. */
  _onMetrics?: ((metrics: DeckMetrics) => void) | null;

  /** A custom callback to retrieve the cursor type. */
  getCursor?: (state: CursorState) => string;
  /** Callback that takes a hovered-over point and renders a tooltip. */
  getTooltip?: ((info: PickingInfo) => TooltipContent) | null;

  /** (Debug) Flag to enable WebGL debug mode. Requires importing `@luma.gl/debug`. */
  debug?: boolean;
  /** (Debug) Render the picking buffer to screen. */
  drawPickingColors?: boolean;
};

const defaultProps = {
  id: '',
  width: '100%',
  height: '100%',
  style: null,
  viewState: null,
  initialViewState: null,
  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  parameters: {},
  parent: null,
  gl: null,
  canvas: null,
  layers: [],
  effects: [],
  views: null,
  controller: null, // Rely on external controller, e.g. react-map-gl
  useDevicePixels: true,
  touchAction: 'none',
  eventRecognizerOptions: {},
  _framebuffer: null,
  _animate: false,
  _pickable: true,
  _typedArrayManagerProps: {},
  _customRender: null,

  onWebGLInitialized: noop,
  onResize: noop,
  onViewStateChange: noop,
  onInteractionStateChange: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLoad: noop,
  onError: (error: Error) => log.error(error.message, error.cause)(),
  onHover: null,
  onClick: null,
  onDragStart: null,
  onDrag: null,
  onDragEnd: null,
  _onMetrics: null,

  getCursor,
  getTooltip: null,

  debug: false,
  drawPickingColors: false
};

/* eslint-disable max-statements */
export default class Deck {
  static defaultProps = defaultProps;
  // This is used to defeat tree shaking of init.js
  // https://github.com/visgl/deck.gl/issues/3213
  static VERSION = VERSION;

  readonly props: Required<DeckProps>;
  readonly width: number = 0;
  readonly height: number = 0;
  // Allows attaching arbitrary data to the instance
  readonly userData: Record<string, any> = {};

  protected canvas: HTMLCanvasElement | null = null;
  protected viewManager: ViewManager | null = null;
  protected layerManager: LayerManager | null = null;
  protected effectManager: EffectManager | null = null;
  protected deckRenderer: DeckRenderer | null = null;
  protected deckPicker: DeckPicker | null = null;
  protected eventManager: EventManager | null = null;
  protected tooltip: Tooltip | null = null;
  protected metrics: DeckMetrics;
  protected animationLoop: AnimationLoop;
  protected stats: Stats;

  /** Internal view state if no callback is supplied */
  protected viewState: any;
  protected cursorState: CursorState;

  private _needsRedraw: false | string;
  private _pickRequest: {
    mode: string;
    event: MjolnirPointerEvent | null;
    x: number;
    y: number;
    radius: number;
  };
  /**
   * Pick and store the object under the pointer on `pointerdown`.
   * This object is reused for subsequent `onClick` and `onDrag*` callbacks.
   */
  private _lastPointerDownInfo: PickingInfo | null = null;
  private _metricsCounter: number;

  constructor(props: DeckProps) {
    this.props = {...defaultProps, ...props};
    props = this.props;

    this._needsRedraw = 'Initial render';
    this._pickRequest = {
      mode: 'hover',
      x: -1,
      y: -1,
      radius: 0,
      event: null
    };

    this.cursorState = {
      isHovering: false,
      isDragging: false
    };

    if (props.viewState && props.initialViewState) {
      log.warn(
        'View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.'
      )();
    }
    if (getBrowser() === 'IE') {
      log.warn('IE 11 is not supported')();
    }
    this.viewState = props.initialViewState;

    if (!props.gl) {
      // Note: LayerManager creation deferred until gl context available
      if (typeof document !== 'undefined') {
        this.canvas = this._createCanvas(props);
      }
    }
    this.animationLoop = this._createAnimationLoop(props);

    this.stats = new Stats({id: 'deck.gl'});
    this.metrics = {
      fps: 0,
      setPropsTime: 0,
      updateAttributesTime: 0,
      framesRedrawn: 0,
      pickTime: 0,
      pickCount: 0,
      gpuTime: 0,
      gpuTimePerFrame: 0,
      cpuTime: 0,
      cpuTimePerFrame: 0,
      bufferMemory: 0,
      textureMemory: 0,
      renderbufferMemory: 0,
      gpuMemory: 0
    };
    this._metricsCounter = 0;

    this.setProps(props);

    // UNSAFE/experimental prop: only set at initialization to avoid performance hit
    if (props._typedArrayManagerProps) {
      typedArrayManager.setOptions(props._typedArrayManagerProps);
    }

    this.animationLoop.start();
  }

  /** Stop rendering and dispose all resources */
  finalize() {
    this.animationLoop?.stop();
    this.animationLoop = null;
    this._lastPointerDownInfo = null;

    this.layerManager?.finalize();
    this.layerManager = null;

    this.viewManager?.finalize();
    this.viewManager = null;

    this.effectManager?.finalize();
    this.effectManager = null;

    this.deckRenderer?.finalize();
    this.deckRenderer = null;

    this.deckPicker?.finalize();
    this.deckPicker = null;

    this.eventManager?.destroy();
    this.eventManager = null;

    this.tooltip?.remove();
    this.tooltip = null;

    if (!this.props.canvas && !this.props.gl && this.canvas) {
      // remove internally created canvas
      this.canvas.parentElement?.removeChild(this.canvas);
      this.canvas = null;
    }
  }

  /** Partially update props */
  setProps(props: DeckProps): void {
    this.stats.get('setProps Time').timeStart();

    if ('onLayerHover' in props) {
      log.removed('onLayerHover', 'onHover')();
    }
    if ('onLayerClick' in props) {
      log.removed('onLayerClick', 'onClick')();
    }
    if (
      props.initialViewState &&
      // depth = 3 when comparing viewStates: viewId.position.0
      !deepEqual(this.props.initialViewState, props.initialViewState, 3)
    ) {
      // Overwrite internal view state
      this.viewState = props.initialViewState;
    }

    // Merge with existing props
    Object.assign(this.props, props);

    // Update CSS size of canvas
    this._setCanvasSize(this.props);

    // We need to overwrite CSS style width and height with actual, numeric values
    const resolvedProps: Required<DeckProps> & {
      width: number;
      height: number;
      views: View[];
      viewState: Record<string, any>;
    } = Object.create(this.props);
    Object.assign(resolvedProps, {
      views: this._getViews(),
      width: this.width,
      height: this.height,
      viewState: this._getViewState()
    });

    // Update the animation loop
    this.animationLoop.setProps(resolvedProps);

    // If initialized, update sub manager props
    if (this.layerManager) {
      this.viewManager!.setProps(resolvedProps);
      // Make sure that any new layer gets initialized with the current viewport
      this.layerManager.activateViewport(this.getViewports()[0]);
      this.layerManager.setProps(resolvedProps);
      this.effectManager!.setProps(resolvedProps);
      this.deckRenderer!.setProps(resolvedProps);
      this.deckPicker!.setProps(resolvedProps);
    }

    this.stats.get('setProps Time').timeEnd();
  }

  // Public API

  /**
   * Check if a redraw is needed
   * @returns `false` or a string summarizing the redraw reason
   */
  needsRedraw(
    opts: {
      /** Reset the redraw flag afterwards. Default `true` */
      clearRedrawFlags: boolean;
    } = {clearRedrawFlags: false}
  ): false | string {
    if (!this.layerManager) {
      // Not initialized or already finalized
      return false;
    }
    if (this.props._animate) {
      return 'Deck._animate';
    }

    let redraw: false | string = this._needsRedraw;

    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }

    const viewManagerNeedsRedraw = this.viewManager!.needsRedraw(opts);
    const layerManagerNeedsRedraw = this.layerManager.needsRedraw(opts);
    const effectManagerNeedsRedraw = this.effectManager!.needsRedraw(opts);
    const deckRendererNeedsRedraw = this.deckRenderer!.needsRedraw(opts);

    redraw =
      redraw ||
      viewManagerNeedsRedraw ||
      layerManagerNeedsRedraw ||
      effectManagerNeedsRedraw ||
      deckRendererNeedsRedraw;
    return redraw;
  }

  /**
   * Redraw the GL context
   * @param reason If not provided, only redraw if deemed necessary. Otherwise redraw regardless of internal states.
   * @returns
   */
  redraw(reason?: string): void {
    if (!this.layerManager) {
      // Not yet initialized
      return;
    }
    // Check if we need to redraw
    let redrawReason = this.needsRedraw({clearRedrawFlags: true});
    // User-supplied should take precedent, however the redraw flags get cleared regardless
    redrawReason = reason || redrawReason;

    if (!redrawReason) {
      return;
    }

    this.stats.get('Redraw Count').incrementCount();
    if (this.props._customRender) {
      this.props._customRender(redrawReason);
    } else {
      this._drawLayers(redrawReason);
    }
  }

  /** Flag indicating that the Deck instance has initialized its resources and it's safe to call public methods. */
  get isInitialized(): boolean {
    return this.viewManager !== null;
  }

  /** Get a list of views that are currently rendered */
  getViews(): View[] {
    assert(this.viewManager);
    return this.viewManager.views;
  }

  /** Get a list of viewports that are currently rendered.
   * @param rect If provided, only returns viewports within the given bounding box.
   */
  getViewports(rect?: {x: number; y: number; width?: number; height?: number}): Viewport[] {
    assert(this.viewManager);
    return this.viewManager.getViewports(rect);
  }

  /** Query the object rendered on top at a given point */
  pickObject(opts: {
    /** x position in pixels */
    x: number;
    /** y position in pixels */
    y: number;
    /** Radius of tolerance in pixels. Default `0`. */
    radius?: number;
    /** A list of layer ids to query from. If not specified, then all pickable and visible layers are queried. */
    layerIds?: string[];
    /** If `true`, `info.coordinate` will be a 3D point by unprojecting the `x, y` screen coordinates onto the picked geometry. Default `false`. */
    unproject3D?: boolean;
  }): PickingInfo | null {
    const infos = this._pick('pickObject', 'pickObject Time', opts).result;
    return infos.length ? infos[0] : null;
  }

  /* Query all rendered objects at a given point */
  pickMultipleObjects(opts: {
    /** x position in pixels */
    x: number;
    /** y position in pixels */
    y: number;
    /** Radius of tolerance in pixels. Default `0`. */
    radius?: number;
    /** Specifies the max number of objects to return. Default `10`. */
    depth?: number;
    /** A list of layer ids to query from. If not specified, then all pickable and visible layers are queried. */
    layerIds?: string[];
    /** If `true`, `info.coordinate` will be a 3D point by unprojecting the `x, y` screen coordinates onto the picked geometry. Default `false`. */
    unproject3D?: boolean;
  }): PickingInfo[] {
    opts.depth = opts.depth || 10;
    return this._pick('pickObject', 'pickMultipleObjects Time', opts).result;
  }

  /* Query all objects rendered on top within a bounding box */
  pickObjects(opts: {
    /** Left of the bounding box in pixels */
    x: number;
    /** Top of the bounding box in pixels */
    y: number;
    /** Width of the bounding box in pixels. Default `1` */
    width?: number;
    /** Height of the bounding box in pixels. Default `1` */
    height?: number;
    /** A list of layer ids to query from. If not specified, then all pickable and visible layers are queried. */
    layerIds?: string[];
    /** If specified, limits the number of objects that can be returned. */
    maxObjects?: number | null;
  }): PickingInfo[] {
    return this._pick('pickObjects', 'pickObjects Time', opts);
  }

  /** Experimental
   * Add a global resource for sharing among layers
   */
  _addResources(
    resources: {
      [id: string]: any;
    },
    forceUpdate = false
  ) {
    for (const id in resources) {
      this.layerManager!.resourceManager.add({resourceId: id, data: resources[id], forceUpdate});
    }
  }

  /** Experimental
   * Remove a global resource
   */
  _removeResources(resourceIds: string[]) {
    for (const id of resourceIds) {
      this.layerManager!.resourceManager.remove(id);
    }
  }

  /** Experimental
   * Register a default effect. Effects will be sorted by order, those with a low order will be rendered first
   */
  _addDefaultEffect(effect: Effect) {
    this.effectManager!.addDefaultEffect(effect);
  }

  // Private Methods

  private _pick(
    method: 'pickObject',
    statKey: string,
    opts: PickByPointOptions & {layerIds?: string[]}
  ): {
    result: PickingInfo[];
    emptyInfo: PickingInfo;
  };
  private _pick(
    method: 'pickObjects',
    statKey: string,
    opts: PickByRectOptions & {layerIds?: string[]}
  ): PickingInfo[];

  private _pick(
    method: 'pickObject' | 'pickObjects',
    statKey: string,
    opts: (PickByPointOptions | PickByRectOptions) & {layerIds?: string[]}
  ) {
    assert(this.deckPicker);

    const {stats} = this;

    stats.get('Pick Count').incrementCount();
    stats.get(statKey).timeStart();

    const infos = this.deckPicker[method]({
      // layerManager, viewManager and effectManager are always defined if deckPicker is
      layers: this.layerManager!.getLayers(opts),
      views: this.viewManager!.getViews(),
      viewports: this.getViewports(opts),
      onViewportActive: this.layerManager!.activateViewport,
      effects: this.effectManager!.getEffects(),
      ...opts
    });

    stats.get(statKey).timeEnd();

    return infos;
  }

  /** Resolve props.canvas to element */
  private _createCanvas(props: DeckProps): HTMLCanvasElement {
    let canvas = props.canvas;

    // TODO EventManager should accept element id
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas) as HTMLCanvasElement;
      assert(canvas);
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = props.id || 'deckgl-overlay';
      const parent = props.parent || document.body;
      parent.appendChild(canvas);
    }

    Object.assign(canvas.style, props.style);

    return canvas;
  }

  /** Updates canvas width and/or height, if provided as props */
  private _setCanvasSize(props: Required<DeckProps>): void {
    if (!this.canvas) {
      return;
    }

    const {width, height} = props;
    // Set size ONLY if props are being provided, otherwise let canvas be layouted freely
    if (width || width === 0) {
      const cssWidth = Number.isFinite(width) ? `${width}px` : (width as string);
      this.canvas.style.width = cssWidth;
    }
    if (height || height === 0) {
      const cssHeight = Number.isFinite(height) ? `${height}px` : (height as string);
      // Note: position==='absolute' required for height 100% to work
      this.canvas.style.position = props.style?.position || 'absolute';
      this.canvas.style.height = cssHeight;
    }
  }

  /** If canvas size has changed, reads out the new size and update */
  private _updateCanvasSize(): void {
    const {canvas} = this;
    if (!canvas) {
      return;
    }
    // Fallback to width/height when clientWidth/clientHeight are undefined (OffscreenCanvas).
    const newWidth = canvas.clientWidth ?? canvas.width;
    const newHeight = canvas.clientHeight ?? canvas.height;
    if (newWidth !== this.width || newHeight !== this.height) {
      // @ts-expect-error private assign to read-only property
      this.width = newWidth;
      // @ts-expect-error private assign to read-only property
      this.height = newHeight;
      this.viewManager?.setProps({width: newWidth, height: newHeight});
      // Make sure that any new layer gets initialized with the current viewport
      this.layerManager?.activateViewport(this.getViewports()[0]);
      this.props.onResize({width: newWidth, height: newHeight});
    }
  }

  private _createAnimationLoop(props: DeckProps): AnimationLoop {
    const {
      width,
      height,
      gl,
      glOptions,
      debug,
      onError,
      onBeforeRender,
      onAfterRender,
      useDevicePixels
    } = props;

    return new AnimationLoop({
      width,
      height,
      useDevicePixels,
      autoResizeDrawingBuffer: !gl, // do not auto resize external context
      autoResizeViewport: false,
      gl,
      onCreateContext: opts =>
        createGLContext({
          ...glOptions,
          ...opts,
          canvas: this.canvas,
          debug,
          onContextLost: () => this._onContextLost()
        }),
      onInitialize: context => this._setGLContext(context.gl),
      onRender: this._onRenderFrame.bind(this),
      onBeforeRender,
      onAfterRender,
      onError
    });
  }

  // Get the most relevant view state: props.viewState, if supplied, shadows internal viewState
  // TODO: For backwards compatibility ensure numeric width and height is added to the viewState
  private _getViewState(): Record<string, any> {
    return this.props.viewState || this.viewState;
  }

  // Get the view descriptor list
  private _getViews(): View[] {
    // Default to a full screen map view port
    let views = this.props.views || [new MapView({id: 'default-view'})];
    views = Array.isArray(views) ? views : [views];
    if (views.length && this.props.controller) {
      // Backward compatibility: support controller prop
      views[0].props.controller = this.props.controller;
    }
    return views;
  }

  private _onContextLost() {
    const {onError} = this.props;
    if (this.animationLoop && onError) {
      onError(new Error('WebGL context is lost'));
    }
  }

  // The `pointermove` event may fire multiple times in between two animation frames,
  // it's a waste of time to run picking without rerender. Instead we save the last pick
  // request and only do it once on the next animation frame.
  /** Internal use only: event handler for pointerdown */
  _onPointerMove = (event: MjolnirPointerEvent) => {
    const {_pickRequest} = this;
    if (event.type === 'pointerleave') {
      _pickRequest.x = -1;
      _pickRequest.y = -1;
      _pickRequest.radius = 0;
    } else if (event.leftButton || event.rightButton) {
      // Do not trigger onHover callbacks if mouse button is down.
      return;
    } else {
      const pos = event.offsetCenter;
      // Do not trigger callbacks when click/hover position is invalid. Doing so will cause a
      // assertion error when attempting to unproject the position.
      if (!pos) {
        return;
      }
      _pickRequest.x = pos.x;
      _pickRequest.y = pos.y;
      _pickRequest.radius = this.props.pickingRadius;
    }

    if (this.layerManager) {
      this.layerManager.context.mousePosition = {x: _pickRequest.x, y: _pickRequest.y};
    }

    _pickRequest.event = event;
  };

  /** Actually run picking */
  private _pickAndCallback() {
    const {_pickRequest} = this;

    if (_pickRequest.event) {
      // Perform picking
      const {result, emptyInfo} = this._pick('pickObject', 'pickObject Time', _pickRequest);
      this.cursorState.isHovering = result.length > 0;

      // There are 4 possible scenarios:
      // result is [outInfo, pickedInfo] (moved from one pickable layer to another)
      // result is [outInfo] (moved outside of a pickable layer)
      // result is [pickedInfo] (moved into or over a pickable layer)
      // result is [] (nothing is or was picked)
      //
      // `layer.props.onHover` should be called on all affected layers (out/over)
      // `deck.props.onHover` should be called with the picked info if any, or empty info otherwise
      // `deck.props.getTooltip` should be called with the picked info if any, or empty info otherwise

      // Execute callbacks
      let pickedInfo = emptyInfo;
      let handled = false;
      for (const info of result) {
        pickedInfo = info;
        handled = info.layer?.onHover(info, _pickRequest.event) || handled;
      }
      if (!handled && this.props.onHover) {
        this.props.onHover(pickedInfo, _pickRequest.event);
      }

      // Update tooltip
      if (this.props.getTooltip && this.tooltip) {
        const displayInfo = this.props.getTooltip(pickedInfo);
        this.tooltip.setTooltip(displayInfo, pickedInfo.x, pickedInfo.y);
      }

      // Clear pending pickRequest
      _pickRequest.event = null;
    }
  }

  private _updateCursor(): void {
    const container = this.props.parent || this.canvas;
    if (container) {
      container.style.cursor = this.props.getCursor(this.cursorState);
    }
  }

  private _setGLContext(gl: WebGLRenderingContext) {
    if (this.layerManager) {
      return;
    }

    // if external context...
    if (!this.canvas) {
      this.canvas = gl.canvas;
      instrumentGLContext(gl, {enable: true, copyState: true});
    }

    this.tooltip = new Tooltip(this.canvas);

    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthTest: true,
      depthFunc: GL.LEQUAL
    });

    this.props.onWebGLInitialized(gl);

    // timeline for transitions
    const timeline = new Timeline();
    timeline.play();
    this.animationLoop.attachTimeline(timeline);

    this.eventManager = new EventManager(this.props.parent || gl.canvas, {
      touchAction: this.props.touchAction,
      recognizerOptions: this.props.eventRecognizerOptions,
      events: {
        pointerdown: this._onPointerDown,
        pointermove: this._onPointerMove,
        pointerleave: this._onPointerMove
      }
    });
    for (const eventType in EVENTS) {
      this.eventManager.on(eventType as keyof typeof EVENTS, this._onEvent);
    }

    this.viewManager = new ViewManager({
      timeline,
      eventManager: this.eventManager,
      onViewStateChange: this._onViewStateChange.bind(this),
      onInteractionStateChange: this._onInteractionStateChange.bind(this),
      views: this._getViews(),
      viewState: this._getViewState(),
      width: this.width,
      height: this.height
    });

    // viewManager must be initialized before layerManager
    // layerManager depends on viewport created by viewManager.
    const viewport = this.viewManager.getViewports()[0];

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager(gl, {
      deck: this,
      stats: this.stats,
      viewport,
      timeline
    });

    this.effectManager = new EffectManager();

    this.deckRenderer = new DeckRenderer(gl);

    this.deckPicker = new DeckPicker(gl);

    this.setProps(this.props);

    this._updateCanvasSize();
    this.props.onLoad();
  }

  /** Internal only: default render function (redraw all layers and views) */
  _drawLayers(
    redrawReason: string,
    renderOptions?: {
      target?: Framebuffer;
      layerFilter?: (context: FilterContext) => boolean;
      layers?: Layer[];
      viewports?: Viewport[];
      views?: {[viewId: string]: View};
      pass?: string;
      effects?: Effect[];
      clearStack?: boolean;
      clearCanvas?: boolean;
    }
  ) {
    const {gl} = this.layerManager!.context;

    setParameters(gl, this.props.parameters);

    this.props.onBeforeRender({gl});

    this.deckRenderer!.renderLayers({
      target: this.props._framebuffer,
      layers: this.layerManager!.getLayers(),
      viewports: this.viewManager!.getViewports(),
      onViewportActive: this.layerManager!.activateViewport,
      views: this.viewManager!.getViews(),
      pass: 'screen',
      effects: this.effectManager!.getEffects(),
      ...renderOptions
    });

    this.props.onAfterRender({gl});
  }

  // Callbacks

  private _onRenderFrame(animationProps: any) {
    this._getFrameStats();

    // Log perf stats every second
    if (this._metricsCounter++ % 60 === 0) {
      this._getMetrics();
      this.stats.reset();
      log.table(4, this.metrics)();

      // Experimental: report metrics
      if (this.props._onMetrics) {
        this.props._onMetrics(this.metrics);
      }
    }

    this._updateCanvasSize();

    this._updateCursor();

    // If view state has changed, clear tooltip
    if (this.tooltip!.isVisible && this.viewManager!.needsRedraw()) {
      this.tooltip!.setTooltip(null);
    }

    // Update layers if needed (e.g. some async prop has loaded)
    // Note: This can trigger a redraw
    this.layerManager!.updateLayers();

    // Perform picking request if any
    this._pickAndCallback();

    // Redraw if necessary
    this.redraw();

    // Update viewport transition if needed
    // Note: this can trigger `onViewStateChange`, and affect layers
    // We want to defer these changes to the next frame
    if (this.viewManager) {
      this.viewManager.updateViewStates();
    }
  }

  // Callbacks

  private _onViewStateChange(params: ViewStateChangeParameters & {viewId: string}) {
    // Let app know that view state is changing, and give it a chance to change it
    const viewState = this.props.onViewStateChange(params) || params.viewState;

    // If initialViewState was set on creation, auto track position
    if (this.viewState) {
      this.viewState = {...this.viewState, [params.viewId]: viewState};
      if (!this.props.viewState) {
        // Apply internal view state
        if (this.viewManager) {
          this.viewManager.setProps({viewState: this.viewState});
        }
      }
    }
  }

  private _onInteractionStateChange(interactionState: InteractionState) {
    this.cursorState.isDragging = interactionState.isDragging || false;
    this.props.onInteractionStateChange(interactionState);
  }

  /** Internal use only: event handler for click & drag */
  _onEvent = (event: MjolnirGestureEvent) => {
    const eventOptions = EVENTS[event.type];
    const pos = event.offsetCenter;

    if (!eventOptions || !pos || !this.layerManager) {
      return;
    }

    // Reuse last picked object
    const layers = this.layerManager.getLayers();
    const info = this.deckPicker!.getLastPickedObject(
      {
        x: pos.x,
        y: pos.y,
        layers,
        viewports: this.getViewports(pos)
      },
      this._lastPointerDownInfo
    );

    const {layer} = info;
    const layerHandler =
      layer && (layer[eventOptions.handler] || layer.props[eventOptions.handler]);
    const rootHandler = this.props[eventOptions.handler];
    let handled = false;

    if (layerHandler) {
      handled = layerHandler.call(layer, info, event);
    }
    if (!handled && rootHandler) {
      rootHandler(info, event);
    }
  };

  /** Internal use only: evnet handler for pointerdown */
  _onPointerDown = (event: MjolnirPointerEvent) => {
    const pos = event.offsetCenter;
    const pickedInfo = this._pick('pickObject', 'pickObject Time', {
      x: pos.x,
      y: pos.y,
      radius: this.props.pickingRadius
    });
    this._lastPointerDownInfo = pickedInfo.result[0] || pickedInfo.emptyInfo;
  };

  private _getFrameStats(): void {
    const {stats} = this;
    stats.get('frameRate').timeEnd();
    stats.get('frameRate').timeStart();

    // Get individual stats from luma.gl so reset works
    const animationLoopStats = this.animationLoop.stats;
    stats.get('GPU Time').addTime(animationLoopStats.get('GPU Time').lastTiming);
    stats.get('CPU Time').addTime(animationLoopStats.get('CPU Time').lastTiming);
  }

  private _getMetrics(): void {
    const {metrics, stats} = this;
    metrics.fps = stats.get('frameRate').getHz();
    metrics.setPropsTime = stats.get('setProps Time').time;
    metrics.updateAttributesTime = stats.get('Update Attributes').time;
    metrics.framesRedrawn = stats.get('Redraw Count').count;
    metrics.pickTime =
      stats.get('pickObject Time').time +
      stats.get('pickMultipleObjects Time').time +
      stats.get('pickObjects Time').time;
    metrics.pickCount = stats.get('Pick Count').count;

    // Luma stats
    metrics.gpuTime = stats.get('GPU Time').time;
    metrics.cpuTime = stats.get('CPU Time').time;
    metrics.gpuTimePerFrame = stats.get('GPU Time').getAverageTime();
    metrics.cpuTimePerFrame = stats.get('CPU Time').getAverageTime();

    const memoryStats = lumaStats.get('Memory Usage');
    metrics.bufferMemory = memoryStats.get('Buffer Memory').count;
    metrics.textureMemory = memoryStats.get('Texture Memory').count;
    metrics.renderbufferMemory = memoryStats.get('Renderbuffer Memory').count;
    metrics.gpuMemory = memoryStats.get('GPU Memory').count;
  }
}
