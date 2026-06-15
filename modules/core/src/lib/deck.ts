// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import LayerManager from './layer-manager';
import ViewManager, {DEFAULT_CANVAS_ID} from './view-manager';
import MapView from '../views/map-view';
import EffectManager from './effect-manager';
import DeckRenderer from './deck-renderer';
import DeckPicker from './deck-picker';
import {Widget} from './widget';
import {WidgetManager} from './widget-manager';
import {TooltipWidget} from './tooltip-widget';
import CanvasManager, {type CanvasTarget} from './canvas-manager';
import log from '../utils/log';
import {deepEqual} from '../utils/deep-equal';
import typedArrayManager from '../utils/typed-array-manager';
import {VERSION} from './init';

import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {GL} from '@luma.gl/webgl/constants';
import {Timeline} from '@luma.gl/engine';
import {AnimationLoop} from '@luma.gl/engine';
import type {
  CanvasContext,
  CanvasContextProps,
  Device,
  DeviceProps,
  Framebuffer,
  Parameters,
  PresentationContext
} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

import {Stats} from '@probe.gl/stats';
import {EventManager} from 'mjolnir.js';

import assert from '../utils/assert';
import {EVENT_HANDLERS, RECOGNIZERS, RecognizerOptions} from './constants';

import type {Effect} from './effect';
import type {FilterContext} from '../passes/layers-pass';
import type Layer from './layer';
import type View from '../views/view';
import type Viewport from '../viewports/viewport';
import type {EventManagerOptions, MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
import type {TypedArrayManagerOptions} from '../utils/typed-array-manager';
import type {ViewStateChangeParameters, InteractionState} from '../controllers/controller';
import type {PickingInfo} from './picking/pick-info';
import type {PickByPointOptions, PickByRectOptions} from './deck-picker';
import type {LayersList} from './layer-manager';
import type {TooltipContent} from './tooltip-widget';
import type {ViewStateMap, AnyViewStateOf, ViewOrViews, ViewStateObject} from './view-manager';
import {CreateDeviceProps} from '@luma.gl/core';

/* global document */

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const getCursor = ({isDragging}) => (isDragging ? 'grabbing' : 'grab');

export type DeckMetrics = {
  fps: number;
  setPropsTime: number;
  layersCount: number;
  drawLayersCount: number;
  updateLayersCount: number;
  updateAttributesTime: number;
  updateAttributesCount: number;
  framesRedrawn: number;
  pickTime: number;
  pickCount: number;
  pickLayersCount: number;
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

type InternalPickingMode = 'sync' | 'async';
type PointPickResult = {
  result: PickingInfo[];
  emptyInfo: PickingInfo;
};

export type DeckProps<ViewsT extends ViewOrViews = null> = {
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
  /** Selects the internal picking policy used by deck-managed events and controllers.
   * @default `'auto'`
   */
  pickAsync?: InternalPickingMode | 'auto';

  /** WebGL parameters to be set before each frame is rendered. */
  parameters?: Parameters;
  /** If supplied, will be called before a layer is drawn to determine whether it should be rendered. */
  layerFilter?: ((context: FilterContext) => boolean) | null;

  /** The container to append the auto-created canvas to.
   * @default `document.body`
   */
  parent?: HTMLDivElement | null;

  /** The canvas or canvases to render into.
   * A single canvas can be either an `HTMLCanvasElement` or the element id, and will be
   * auto-created if not supplied. When an array is supplied, Deck renders into an offscreen
   * default context and presents the result into one canvas per entry. Views without an explicit
   * `canvasId` render into the first configured canvas.
   */
  canvas?: HTMLCanvasElement | string | (HTMLCanvasElement | string)[] | null;

  /** Use an existing luma.gl GPU device. @note If not supplied, a new device will be created using props.deviceProps */
  device?: Device | null;

  /** A new device will be created using these props, assuming that an existing device is not supplied using props.device) */
  deviceProps?: CreateDeviceProps;

  /** WebGL context @deprecated Use props.deviceProps.webgl. Also note that preserveDrawingBuffers is true by default */
  gl?: WebGL2RenderingContext | null;

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
  views?: ViewsT;
  /** Options for viewport interactivity, e.g. pan, rotate and zoom with mouse, touch and keyboard.
   * This is a shorthand for defining interaction with the `views` prop if you are using the default view (i.e. a single `MapView`)
   */
  controller?: View['props']['controller'];
  /**
   * An object that describes the view state for each view in the `views` prop.
   * Use if the camera state should be managed external to the `Deck` instance.
   */
  viewState?: ViewStateMap<ViewsT> | null;
  /**
   * If provided, the `Deck` instance will track camera state changes automatically,
   * with `initialViewState` as its initial settings.
   */
  initialViewState?: ViewStateMap<ViewsT> | null;

  /** Allow browser default touch actions.
   * @default `'none'`
   */
  touchAction?: EventManagerOptions['touchAction'];
  /**
   * Optional mjolnir.js recognizer options
   */
  eventRecognizerOptions?: RecognizerOptions;

  /** (Experimental) Render to a custom frame buffer other than to screen. */
  _framebuffer?: Framebuffer | null;
  /** (Experimental) Forces deck.gl to redraw layers every animation frame. */
  _animate?: boolean;
  /** (Experimental) If set to `false`, force disables all picking features, disregarding the `pickable` prop set in any layer. */
  _pickable?: boolean;
  /** (Experimental) Fine-tune attribute memory usage. See documentation for details. */
  _typedArrayManagerProps?: TypedArrayManagerOptions;
  /** An array of Widget instances to be added to the parent element. */
  widgets?: Widget<any, ViewsT>[];

  /** Called once the GPU Device has been initiated. */
  onDeviceInitialized?: (device: Device) => void;
  /** @deprecated Called once the WebGL context has been initiated. */
  onWebGLInitialized?: (gl: WebGL2RenderingContext) => void;
  /** Called when the canvas resizes. */
  onResize?: (dimensions: {width: number; height: number}, canvasContext?: CanvasContext) => void;
  /** Called when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard. */
  onViewStateChange?: <ViewStateT extends AnyViewStateOf<ViewsT>>(
    params: ViewStateChangeParameters<ViewStateT>
  ) => ViewStateT | null | void;
  /** Called when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard. */
  onInteractionStateChange?: (state: InteractionState) => void;
  /** Called just before the canvas rerenders. */
  onBeforeRender?: (context: {device: Device; gl: WebGL2RenderingContext}) => void;
  /** Called right after the canvas rerenders. */
  onAfterRender?: (context: {device: Device; gl: WebGL2RenderingContext}) => void;
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

const defaultProps: DeckProps = {
  id: '',
  width: '100%',
  height: '100%',
  style: null,
  viewState: null,
  initialViewState: null,
  pickingRadius: 0,
  pickAsync: 'auto',
  layerFilter: null,
  parameters: {},
  parent: null,
  device: null,
  deviceProps: {} as DeviceProps,
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
  widgets: [],

  onDeviceInitialized: noop,
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
export default class Deck<ViewsT extends ViewOrViews = null> {
  static defaultProps = defaultProps;
  // This is used to defeat tree shaking of init.js
  // https://github.com/visgl/deck.gl/issues/3213
  static VERSION = VERSION;

  readonly props: Required<DeckProps<ViewsT>>;
  readonly width: number = 0;
  readonly height: number = 0;
  // Allows attaching arbitrary data to the instance
  readonly userData: Record<string, any> = {};

  protected device: Device | null = null;

  protected canvas: HTMLCanvasElement | null = null;
  protected viewManager: ViewManager<View[]> | null = null;
  protected layerManager: LayerManager | null = null;
  protected effectManager: EffectManager | null = null;
  protected deckRenderer: DeckRenderer | null = null;
  protected deckPicker: DeckPicker | null = null;
  protected eventManager: EventManager | null = null;
  protected eventManagers: Record<string, EventManager> = {};
  protected widgetManager: WidgetManager | null = null;
  protected tooltip: TooltipWidget | null = null;
  protected animationLoop: AnimationLoop | null = null;
  private _canvasContext: CanvasContext | null = null;
  private _deviceResizeHandler: {
    device: Device;
    onResize: NonNullable<DeviceProps['onResize']>;
    syncDrawingBuffer: boolean;
  } | null = null;

  /** Internal view state if no callback is supplied */
  protected viewState: ViewStateObject<ViewsT> | null;
  protected cursorState: CursorState = {
    isHovering: false,
    isDragging: false
  };

  protected stats = new Stats({id: 'deck.gl'});
  protected metrics: DeckMetrics = {
    fps: 0,
    setPropsTime: 0,
    layersCount: 0,
    drawLayersCount: 0,
    updateLayersCount: 0,
    updateAttributesCount: 0,
    updateAttributesTime: 0,
    framesRedrawn: 0,
    pickTime: 0,
    pickCount: 0,
    pickLayersCount: 0,
    gpuTime: 0,
    gpuTimePerFrame: 0,
    cpuTime: 0,
    cpuTimePerFrame: 0,
    bufferMemory: 0,
    textureMemory: 0,
    renderbufferMemory: 0,
    gpuMemory: 0
  };
  private _metricsCounter: number = 0;
  private _hoverPickSequence: number = 0;
  private _pointerDownPickSequence: number = 0;

  private _needsRedraw: false | string = 'Initial render';
  private _canvasManager = new CanvasManager({
    createEventManager: root => this._createEventManager(root),
    getEventRoot: canvas => this._getEventRoot(canvas)
  });
  private _ownedCanvas: HTMLCanvasElement | null = null;
  private _pickRequest: {
    mode: string;
    event: MjolnirPointerEvent | null;
    x: number;
    y: number;
    radius: number;
    canvasId?: string;
    unproject3D?: boolean;
  } = {
    mode: 'hover',
    x: -1,
    y: -1,
    radius: 0,
    canvasId: undefined,
    event: null,
    unproject3D: false
  };

  /**
   * Pick and store the object under the pointer on `pointerdown`.
   * This object is reused for subsequent `onClick` and `onDrag*` callbacks.
   */
  private _lastPointerDownInfo: PickingInfo | null = null;
  private _lastPointerDownInfoPromise: Promise<PickingInfo> | null = null;

  private get _canvasTargets(): Record<string, CanvasTarget> {
    return this._canvasManager.targets;
  }

  private get _canvasTargetOrder(): string[] {
    return this._canvasManager.order;
  }

  constructor(props: DeckProps<ViewsT>) {
    const initialProps = props;
    // @ts-ignore views
    this.props = {...defaultProps, ...props};
    props = this.props;

    this._validateCanvasConfiguration(props);

    if (props.viewState && props.initialViewState) {
      log.warn(
        'View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.'
      )();
    }
    this.viewState = this.props.initialViewState;

    // See if we already have a device
    if (props.device) {
      this.device = props.device;
      this._setDeviceCanvasContext(props.device);
    }

    let deviceOrPromise: Device | Promise<Device> | null = this.device;

    // Attach a new luma.gl device to a WebGL2 context if supplied
    if (!deviceOrPromise && props.gl) {
      if (props.gl instanceof WebGLRenderingContext) {
        log.error('WebGL1 context not supported.')();
      }
      deviceOrPromise = webgl2Adapter.attach(props.gl, {
        // Enable shader and pipeline caching for attached devices (matches _createDevice defaults)
        // Without this, interleaved mode (e.g., MapboxOverlay) creates new pipelines every frame
        _cacheShaders: true,
        _cachePipelines: true,
        ...this.props.deviceProps
      });
    }

    // Create a new device
    if (!deviceOrPromise) {
      deviceOrPromise = this._createDevice(props);
    }

    this.animationLoop = this._createAnimationLoop(deviceOrPromise, props);

    this.setProps(initialProps);

    // UNSAFE/experimental prop: only set at initialization to avoid performance hit
    if (props._typedArrayManagerProps) {
      typedArrayManager.setOptions(props._typedArrayManagerProps);
    }

    this.animationLoop.start();
  }

  /** Stop rendering and dispose all resources */
  finalize() {
    this._restoreDeviceResizeHandler();

    this.animationLoop?.stop();
    this.animationLoop?.destroy();
    this.animationLoop = null;
    this._hoverPickSequence++;
    this._pointerDownPickSequence++;
    this._lastPointerDownInfo = null;
    this._lastPointerDownInfoPromise = null;

    this._teardownManagers();
    this._destroyCanvasTargets();

    if (!this._isMultiCanvasMode() && this.canvas && this.canvas === this._ownedCanvas) {
      // remove internally created canvas
      this.canvas.parentElement?.removeChild(this.canvas);
      this.canvas = null;
      this._ownedCanvas = null;
    }
    this._canvasContext = null;
  }

  /** Partially update props */
  setProps(props: DeckProps<ViewsT>): void {
    this.stats.get('setProps Time').timeStart();
    const previousCanvas = this.props.canvas;

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
    this._validateCanvasConfiguration(this.props);
    this._validateInternalPickingMode();

    if (
      this.device &&
      !this.props.device &&
      !this.props.gl &&
      this._isMultiCanvasProp(previousCanvas) !== this._isMultiCanvasMode()
    ) {
      this._rebuildDeckOwnedDevice();
      this.stats.get('setProps Time').timeEnd();
      return;
    }

    if (this.device && this._isMultiCanvasMode()) {
      this._syncCanvasTargets();
    }

    // Update CSS size of canvas
    this._setCanvasSize(this.props);

    // We need to overwrite CSS style width and height with actual, numeric values
    const resolvedProps: Required<DeckProps> & {
      width: number;
      height: number;
      views: View[];
      viewState: ViewStateObject<ViewsT> | null;
      canvasMetrics: Record<string, {width: number; height: number}>;
      eventManagers: Record<string, EventManager>;
    } = Object.create(this.props);
    Object.assign(resolvedProps, {
      views: this._getViews(),
      width: this.width,
      height: this.height,
      viewState: this._getViewState(),
      canvasMetrics: this._getCanvasMetrics(),
      eventManagers: this.eventManagers
    });

    if (props.device && props.device.id !== this.device?.id) {
      const canvasContext = props.device.getDefaultCanvasContext();
      this.animationLoop?.stop();
      if (!this._isMultiCanvasMode() && this.canvas !== canvasContext.canvas) {
        // remove old canvas if new one being used and de-register events
        // TODO (ck): We might not own this canvas depending it's source, so removing it from the
        // DOM here might be a bit unexpected but it should be ok for most users.
        this.canvas?.remove();
        this.eventManager?.destroy();

        // ensure we will re-attach ourselves after createDevice callbacks
        this.canvas = null;
      }

      this._setDeviceCanvasContext(props.device);

      log.log(`recreating animation loop for new device! id=${props.device.id}`)();

      this.animationLoop = this._createAnimationLoop(props.device, props);
      this.animationLoop.start();
    }

    // Update the animation loop
    this.animationLoop?.setProps(resolvedProps);

    if (props.useDevicePixels !== undefined && this._canvasContext?.setProps) {
      this._canvasContext.setProps({useDevicePixels: props.useDevicePixels});
      for (const target of Object.values(this._canvasTargets)) {
        target.presentationContext.setProps({useDevicePixels: props.useDevicePixels});
      }
    }

    // If initialized, update sub manager props
    if (this.layerManager) {
      this.viewManager!.setProps(resolvedProps);
      // Make sure that any new layer gets initialized with the current viewport
      this.layerManager.activateViewport(this.getViewports()[0]);
      this.layerManager.setProps(resolvedProps);
      this.effectManager!.setProps(resolvedProps);
      this.deckRenderer!.setProps(resolvedProps);
      this.deckPicker!.setProps(resolvedProps);
      this.widgetManager!.setProps(resolvedProps);
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

  /** Get a view by id */
  getView(viewId: string): View | undefined {
    assert(this.viewManager);
    return this.viewManager.getView(viewId);
  }

  /** Get a list of viewports that are currently rendered.
   * @param rect If provided, only returns viewports within the given bounding box.
   */
  getViewports(rect?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    canvasId?: string;
  }): Viewport[] {
    assert(this.viewManager);
    return this.viewManager.getViewports(rect);
  }

  /**
   * Get the current canvas element.
   *
   * In multi-canvas mode this returns the first configured presentation canvas.
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Resolve the rendered canvas bounds relative to a widget root.
   * @internal
   */
  getCanvasBounds(
    viewport?: Viewport | null,
    parentElement?: HTMLElement | null
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const canvasId = viewport ? this.viewManager?.getCanvasId(viewport.id) : undefined;
    const canvasContext = this._getCanvasContext(canvasId);
    const [width, height] = canvasContext?.getCSSSize() || [this.width, this.height];
    const parentRect = parentElement?.getBoundingClientRect();
    if (!canvasContext || !parentRect) {
      return {x: 0, y: 0, width, height};
    }

    canvasContext.updatePosition();
    const [x, y] = canvasContext.getPosition();
    return {
      x: x - parentRect.left,
      y: y - parentRect.top,
      width,
      height
    };
  }

  /**
   * Get the event manager associated with a view or the default Deck canvas.
   */
  getEventManager(viewId?: string): EventManager | null {
    if (!viewId || !this.viewManager) {
      return this.eventManager;
    }

    const canvasId = this.viewManager.getCanvasId(viewId) || DEFAULT_CANVAS_ID;
    return this.eventManagers[canvasId] || this.eventManager;
  }

  /** Query the object rendered on top at a given point */
  async pickObjectAsync(opts: {
    /** x position in pixels */
    x: number;
    /** y position in pixels */
    y: number;
    /** Canvas id when querying a presented canvas in multi-canvas mode. */
    canvasId?: string;
    /** Radius of tolerance in pixels. Default `0`. */
    radius?: number;
    /** A list of layer ids to query from. If not specified, then all pickable and visible layers are queried. */
    layerIds?: string[];
    /** If `true`, `info.coordinate` will be a 3D point by unprojecting the `x, y` screen coordinates onto the picked geometry. Default `false`. */
    unproject3D?: boolean;
  }): Promise<PickingInfo | null> {
    const infos = (await this._pickAsync('pickObjectAsync', 'pickObject Time', opts)).result;
    return infos.length ? infos[0] : null;
  }

  /**
   * Query all objects rendered on top within a bounding box
   * @note Caveat: this method performs multiple async GPU queries, so state could potentially change between calls.
   */
  async pickObjectsAsync(opts: {
    /** Left of the bounding box in pixels */
    x: number;
    /** Top of the bounding box in pixels */
    y: number;
    /** Width of the bounding box in pixels. Default `1` */
    width?: number;
    /** Height of the bounding box in pixels. Default `1` */
    height?: number;
    /** Canvas id when querying a presented canvas in multi-canvas mode. */
    canvasId?: string;
    /** A list of layer ids to query from. If not specified, then all pickable and visible layers are queried. */
    layerIds?: string[];
    /** If specified, limits the number of objects that can be returned. */
    maxObjects?: number | null;
  }): Promise<PickingInfo[]> {
    return await this._pickAsync('pickObjectsAsync', 'pickObjects Time', opts);
  }

  /**
   * Query the object rendered on top at a given point
   * @deprecated WebGL only. Use `pickObjectsAsync` instead
   */
  pickObject(opts: {
    /** x position in pixels */
    x: number;
    /** y position in pixels */
    y: number;
    /** Canvas id when querying a presented canvas in multi-canvas mode. */
    canvasId?: string;
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

  /**
   * Query all rendered objects at a given point
   * @deprecated WebGL only. Use `pickObjectsAsync` instead
   */
  pickMultipleObjects(opts: {
    /** x position in pixels */
    x: number;
    /** y position in pixels */
    y: number;
    /** Radius of tolerance in pixels. Default `0`. */
    radius?: number;
    /** Canvas id when querying a presented canvas in multi-canvas mode. */
    canvasId?: string;
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

  /**
   * Query all objects rendered on top within a bounding box
   * @deprecated WebGL only. Use `pickObjectsAsync` instead
   */
  pickObjects(opts: {
    /** Left of the bounding box in pixels */
    x: number;
    /** Top of the bounding box in pixels */
    y: number;
    /** Width of the bounding box in pixels. Default `1` */
    width?: number;
    /** Height of the bounding box in pixels. Default `1` */
    height?: number;
    /** Canvas id when querying a presented canvas in multi-canvas mode. */
    canvasId?: string;
    /** A list of layer ids to query from. If not specified, then all pickable and visible layers are queried. */
    layerIds?: string[];
    /** If specified, limits the number of objects that can be returned. */
    maxObjects?: number | null;
  }): PickingInfo[] {
    return this._pick('pickObjects', 'pickObjects Time', opts);
  }

  /**
   * Internal method used by controllers to pick 3D position at a screen coordinate
   * @private
   */
  private _pickPositionForController(
    x: number,
    y: number,
    viewId?: string
  ): {coordinate?: number[]} | null {
    const internalPickingMode = this._getInternalPickingMode();
    if (internalPickingMode !== 'sync') {
      return null;
    }

    return this.pickObject({
      x,
      y,
      radius: 0,
      unproject3D: true,
      canvasId: viewId ? this.viewManager?.getCanvasId(viewId) : undefined
    });
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

  _addDefaultShaderModule(module: ShaderModule<Record<string, unknown>>) {
    this.layerManager!.addDefaultShaderModule(module);
  }

  _removeDefaultShaderModule(module: ShaderModule<Record<string, unknown>>) {
    this.layerManager?.removeDefaultShaderModule(module);
  }

  // Private Methods

  private _resolveInternalPickingMode(): InternalPickingMode {
    const {pickAsync} = this.props;
    const deviceType = this.device?.type || this.props.deviceProps?.type;

    if (pickAsync === 'auto') {
      return deviceType === 'webgpu' ? 'async' : 'sync';
    }
    if (pickAsync === 'sync' && deviceType === 'webgpu') {
      throw new Error('`pickAsync: "sync"` is not supported when Deck is using a WebGPU device.');
    }
    return pickAsync;
  }

  private _getInternalPickingMode(): InternalPickingMode | null {
    try {
      return this._resolveInternalPickingMode();
    } catch (error) {
      this.props.onError?.(error as Error);
      return null;
    }
  }

  private _validateInternalPickingMode(): void {
    this._getInternalPickingMode();
  }

  private _getFirstPickedInfo({result, emptyInfo}: PointPickResult): PickingInfo {
    return result[0] || emptyInfo;
  }

  private _shouldUnproject3D(layers = this.layerManager?.getLayers() || []): boolean {
    return layers.some(layer => layer.props.pickable === '3d');
  }

  private _getPointPickOptions(
    x: number,
    y: number,
    opts: Partial<PickByPointOptions> = {},
    layers = this.layerManager?.getLayers() || []
  ): PickByPointOptions {
    return {
      x,
      y,
      canvasId: opts.canvasId,
      radius: this.props.pickingRadius,
      unproject3D: this._shouldUnproject3D(layers),
      ...opts
    };
  }

  private _pickPointSync(opts: PickByPointOptions): PointPickResult {
    return this._pick('pickObject', 'pickObject Time', opts);
  }

  private _pickPointAsync(opts: PickByPointOptions): Promise<PointPickResult> {
    return this._pickAsync('pickObjectAsync', 'pickObject Time', opts);
  }

  private _getLastPointerDownPickingInfo(
    x: number,
    y: number,
    canvasId?: string,
    layers = this.layerManager?.getLayers() || []
  ): PickingInfo {
    return this.deckPicker!.getLastPickedObject(
      {
        x,
        y,
        layers,
        viewports: this.getViewports({x, y, canvasId})
      },
      this._lastPointerDownInfo
    ) as PickingInfo;
  }

  private _applyHoverCallbacks(
    {result, emptyInfo}: PointPickResult,
    event: MjolnirPointerEvent
  ): void {
    if (!this.widgetManager) {
      return;
    }

    this.cursorState.isHovering = result.length > 0;

    let pickedInfo = emptyInfo;
    let handled = false;
    for (const info of result) {
      pickedInfo = info;
      handled = info.layer?.onHover(info, event) || handled;
    }
    if (!handled) {
      this.props.onHover?.(pickedInfo, event);
      this.widgetManager.onHover(pickedInfo, event);
    }
  }

  private _dispatchPickingEvent(info: PickingInfo, event: MjolnirGestureEvent): void {
    if (!this.layerManager || !this.widgetManager) {
      return;
    }

    const eventHandlerProp = EVENT_HANDLERS[event.type];
    if (!eventHandlerProp) {
      return;
    }

    const {layer} = info;
    const layerHandler = layer && (layer[eventHandlerProp] || layer.props[eventHandlerProp]);
    const rootHandler = this.props[eventHandlerProp];
    let handled = false;

    if (layerHandler) {
      handled = layerHandler.call(layer, info, event);
    }
    if (!handled) {
      rootHandler?.(info, event);
      this.widgetManager.onEvent(info, event);
    }
  }

  private _pickAsync(
    method: 'pickObjectAsync',
    statKey: string,
    opts: PickByPointOptions & {layerIds?: string[]}
  ): Promise<{
    result: PickingInfo[];
    emptyInfo: PickingInfo;
  }>;
  private _pickAsync(
    method: 'pickObjectsAsync',
    statKey: string,
    opts: PickByRectOptions & {layerIds?: string[]}
  ): Promise<PickingInfo[]>;

  private _pickAsync(
    method: 'pickObjectAsync' | 'pickObjectsAsync',
    statKey: string,
    opts: (PickByPointOptions | PickByRectOptions) & {layerIds?: string[]}
  ) {
    assert(this.deckPicker);

    const {stats} = this;
    const canvasId = this._isMultiCanvasMode()
      ? opts.canvasId || this._getDefaultCanvasId()
      : opts.canvasId;
    const canvasContext = this._getCanvasContext(canvasId) || undefined;

    stats.get('Pick Count').incrementCount();
    stats.get(statKey).timeStart();
    this._resizeForCanvasTarget(canvasId);

    const infos = this.deckPicker[method]({
      // layerManager, viewManager and effectManager are always defined if deckPicker is
      layers: this.layerManager!.getLayers(opts),
      views: this.viewManager!.getViews(),
      viewports: this.getViewports({
        ...(opts as {x: number; y: number; width?: number; height?: number}),
        canvasId
      }),
      onViewportActive: this.layerManager!.activateViewport,
      effects: this.effectManager!.getEffects(),
      ...opts,
      canvasId,
      canvasContext
    });

    stats.get(statKey).timeEnd();

    return infos;
  }

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
    const canvasId = this._isMultiCanvasMode()
      ? opts.canvasId || this._getDefaultCanvasId()
      : opts.canvasId;
    const canvasContext = this._getCanvasContext(canvasId) || undefined;

    stats.get('Pick Count').incrementCount();
    stats.get(statKey).timeStart();
    this._resizeForCanvasTarget(canvasId);

    const infos = this.deckPicker[method]({
      // layerManager, viewManager and effectManager are always defined if deckPicker is
      layers: this.layerManager!.getLayers(opts),
      views: this.viewManager!.getViews(),
      viewports: this.getViewports({
        ...(opts as {x: number; y: number; width?: number; height?: number}),
        canvasId
      }),
      onViewportActive: this.layerManager!.activateViewport,
      effects: this.effectManager!.getEffects(),
      ...opts,
      canvasId,
      canvasContext
    });

    stats.get(statKey).timeEnd();

    return infos;
  }

  private _isMultiCanvasProp(
    canvas: DeckProps<ViewsT>['canvas'] | Required<DeckProps<ViewsT>>['canvas']
  ): canvas is (string | HTMLCanvasElement)[] {
    return Array.isArray(canvas);
  }

  private _isMultiCanvasMode(): boolean {
    return this._isMultiCanvasProp(this.props.canvas);
  }

  private _getDefaultCanvasId(): string {
    return this._canvasManager.defaultCanvasId;
  }

  private _validateCanvasConfiguration(props: DeckProps<ViewsT>): void {
    if (!this._isMultiCanvasProp(props.canvas)) {
      return;
    }

    if (props.gl) {
      throw new Error(
        'Array-valued `canvas` is not supported with `gl`. Do not supply `gl`; let Deck create the device.'
      );
    }

    if (props.device?.canvasContext && !props.device.getDefaultCanvasContext().offscreenCanvas) {
      throw new Error(
        'Array-valued `canvas` requires an offscreen-backed default canvas context when using an external device.'
      );
    }
  }

  private _getPresentationCanvases(): (string | HTMLCanvasElement)[] {
    return this._isMultiCanvasProp(this.props.canvas) ? this.props.canvas : [];
  }

  private _createEventManager(root: HTMLElement): EventManager {
    const eventManager = new EventManager(root, {
      touchAction: this.props.touchAction,
      recognizers: Object.keys(RECOGNIZERS).map((eventName: string) => {
        // Resolve recognizer settings
        const [RecognizerConstructor, defaultOptions, recognizeWith, requireFailure] =
          RECOGNIZERS[eventName];
        const optionsOverride = this.props.eventRecognizerOptions?.[eventName];
        const options = {...defaultOptions, ...optionsOverride, event: eventName};
        return {
          recognizer: new RecognizerConstructor(options),
          recognizeWith,
          requireFailure
        };
      }),
      events: {
        pointerdown: this._onPointerDown,
        pointermove: this._onPointerMove,
        pointerleave: this._onPointerMove
      }
    });

    for (const eventType in EVENT_HANDLERS) {
      eventManager.on(eventType, this._onEvent);
    }
    return eventManager;
  }

  private _getEventRoot(canvas: HTMLCanvasElement): HTMLElement {
    return (
      canvas.closest<HTMLElement>('.deck-events-root') ||
      this.props.parent?.querySelector<HTMLElement>('.deck-events-root') ||
      canvas
    );
  }

  private _destroyCanvasTargets(): void {
    this._canvasManager.finalize();
    this.eventManagers = {};
    this.eventManager = null;
    if (this._isMultiCanvasMode()) {
      this.canvas = null;
    }
  }

  private _syncCanvasTargets(): void {
    if (!this.device || !this._isMultiCanvasMode()) {
      return;
    }

    this._canvasManager.sync({
      device: this.device,
      canvases: this._getPresentationCanvases(),
      useDevicePixels: this.props.useDevicePixels
    });
    this.eventManagers = this._canvasManager.eventManagers;
    this.eventManager = this._canvasManager.eventManager;
    this.canvas = this._canvasManager.canvas;
  }

  private _setCanvasContext(canvasContext: CanvasContext): void {
    this._canvasContext = canvasContext;

    if ('style' in canvasContext.canvas) {
      this.canvas = canvasContext.canvas;
    }
  }

  private _setDeviceCanvasContext(device: Device, opts: {syncDrawingBuffer?: boolean} = {}): void {
    const canvasContext = device.getDefaultCanvasContext();
    this._setCanvasContext(canvasContext);
    this._setDeviceResizeHandler(device, opts);
  }

  private _setDeviceResizeHandler(device: Device, opts: {syncDrawingBuffer?: boolean} = {}): void {
    const syncDrawingBuffer = Boolean(opts.syncDrawingBuffer);
    if (this._deviceResizeHandler?.device === device) {
      this._deviceResizeHandler.syncDrawingBuffer = syncDrawingBuffer;
      return;
    }

    this._restoreDeviceResizeHandler();

    const onResize: NonNullable<DeviceProps['onResize']> = canvasContext => {
      if (canvasContext === this._canvasContext && this._canvasContext) {
        // Deck owns resize handling for the active render CanvasContext. Applications should use
        // DeckProps.onResize instead of the lower-level luma device callback while Deck is active.
        this._onCanvasContextResize(this._canvasContext, {
          syncDrawingBuffer: this._deviceResizeHandler?.syncDrawingBuffer
        });
      } else if (this._isMultiCanvasMode()) {
        this._updateCanvasMetrics();
      }
    };

    device.props.onResize = onResize;
    this._deviceResizeHandler = {device, onResize, syncDrawingBuffer};
  }

  private _restoreDeviceResizeHandler(): void {
    const resizeHandler = this._deviceResizeHandler;
    if (resizeHandler && resizeHandler.device.props?.onResize === resizeHandler.onResize) {
      resizeHandler.device.props.onResize = noop;
    }
    this._deviceResizeHandler = null;
  }

  /** Return per-canvas CSS pixel sizes used to resolve view layouts. */
  private _getCanvasMetrics(): Record<string, {width: number; height: number}> {
    return this._isMultiCanvasMode()
      ? this._canvasManager.getMetrics(this.width, this.height)
      : {[this._getDefaultCanvasId()]: {width: this.width, height: this.height}};
  }
  /** Resolve the presentation canvas id that produced a deck-managed DOM event. */
  private _getCanvasIdFromEvent(
    event?: {rootElement?: HTMLElement | null} | null
  ): string | undefined {
    return this._canvasManager.getCanvasIdFromEvent(event?.rootElement);
  }

  /** Look up the presentation target for a canvas id in multi-canvas mode. */
  private _getCanvasTarget(canvasId?: string): CanvasTarget | null {
    if (!this._isMultiCanvasMode()) {
      return null;
    }
    return this._canvasManager.getTarget(canvasId);
  }

  /** Look up the canvas context used for a canvas id. */
  private _getCanvasContext(canvasId?: string): CanvasContext | PresentationContext | null {
    return this._getCanvasTarget(canvasId)?.presentationContext || this._canvasContext;
  }

  /** Resize the offscreen default canvas context to match a presentation target. */
  private _resizeForCanvasTarget(canvasId?: string): void {
    const target = this._getCanvasTarget(canvasId);
    if (!target || !this.device?.canvasContext) {
      return;
    }

    const [width, height] = target.presentationContext.getDrawingBufferSize();
    this.device.canvasContext.setDrawingBufferSize(width, height);
  }

  private _teardownManagers(): void {
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

    if (!Object.keys(this._canvasTargets).length) {
      this.eventManager?.destroy();
    }
    this.eventManager = null;
    this.eventManagers = {};

    this.widgetManager?.finalize();
    this.widgetManager = null;
  }

  private _rebuildDeckOwnedDevice(): void {
    const ownedCanvas = this._ownedCanvas;
    this.animationLoop?.stop();
    this.animationLoop?.destroy();
    this.animationLoop = null;
    this._restoreDeviceResizeHandler();
    this._teardownManagers();
    this._destroyCanvasTargets();
    this.device = null;
    this.canvas = null;
    this._canvasContext = null;

    if (ownedCanvas) {
      ownedCanvas.remove();
      this._ownedCanvas = null;
    }

    const deviceOrPromise = this._createDevice(this.props);
    this.animationLoop = this._createAnimationLoop(deviceOrPromise, this.props);
    this.animationLoop.start();
  }

  private _createDeviceCanvas(props: DeckProps<ViewsT>): HTMLCanvasElement | OffscreenCanvas {
    if (this._isMultiCanvasMode()) {
      const OffscreenCanvasConstructor = globalThis.OffscreenCanvas;
      if (!OffscreenCanvasConstructor) {
        throw new Error('Array-valued `canvas` requires OffscreenCanvas support.');
      }
      const width =
        typeof props.width === 'number' && Number.isFinite(props.width) ? props.width : 1;
      const height =
        typeof props.height === 'number' && Number.isFinite(props.height) ? props.height : 1;
      return new OffscreenCanvasConstructor(width, height);
    }

    return this._createCanvas(props);
  }

  /** Resolve props.canvas to element */
  private _createCanvas(props: DeckProps<ViewsT>): HTMLCanvasElement {
    let canvas = props.canvas;

    if (Array.isArray(canvas)) {
      throw new Error('Array-valued `canvas` cannot create a single device canvas.');
    }

    // TODO EventManager should accept element id
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas) as HTMLCanvasElement;
      assert(canvas);
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = props.id || 'deckgl-overlay';

      // TODO this is a hack, investigate why these are not set for the picking
      // tests
      if (props.width && typeof props.width === 'number') {
        canvas.width = props.width;
      }
      if (props.height && typeof props.height === 'number') {
        canvas.height = props.height;
      }
      const parent = props.parent || document.body;
      parent.appendChild(canvas);
      this._ownedCanvas = canvas;
    } else {
      this._ownedCanvas = null;
    }

    Object.assign(canvas.style, props.style);

    return canvas;
  }

  /** Updates canvas width and/or height, if provided as props */
  private _setCanvasSize(props: Required<DeckProps<ViewsT>>): void {
    if (this._isMultiCanvasMode()) {
      return;
    }
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

  /**
   * Sync Deck viewport dimensions from the active canvas context.
   * luma.gl owns resize observation, DPR tracking and drawing buffer sizing for Deck-created
   * canvases. Attached WebGL contexts still need Deck to mirror external drawing-buffer changes.
   */
  private _updateCanvasSize(canvasContext: CanvasContext | null = this._canvasContext): void {
    if (this._isMultiCanvasMode()) {
      this._updateCanvasMetrics();
      return;
    }
    const {canvas} = this;
    const [newWidth, newHeight] = canvasContext
      ? // The canvas context owns the authoritative CSS size after resize/DPR observation.
        canvasContext.getCSSSize()
      : // Fallback to width/height when there is no default canvas context available yet.
        [canvas?.clientWidth ?? canvas?.width ?? 0, canvas?.clientHeight ?? canvas?.height ?? 0];

    if (newWidth !== this.width || newHeight !== this.height) {
      // @ts-expect-error private assign to read-only property
      this.width = newWidth;
      // @ts-expect-error private assign to read-only property
      this.height = newHeight;
      this.viewManager?.setProps({
        width: newWidth,
        height: newHeight,
        canvasMetrics: {[this._getDefaultCanvasId()]: {width: newWidth, height: newHeight}}
      });
      // Make sure that any new layer gets initialized with the current viewport
      this.layerManager?.activateViewport(this.getViewports()[0]);
      this.props.onResize({width: newWidth, height: newHeight}, canvasContext || undefined);
    }
  }

  private _onCanvasContextResize(
    canvasContext: CanvasContext,
    opts: {syncDrawingBuffer?: boolean} = {}
  ): void {
    if (opts.syncDrawingBuffer) {
      const {width, height} = canvasContext.canvas;
      canvasContext.setDrawingBufferSize(width, height);
    }
    // luma owns resize detection; Deck reacts by invalidating redraw and updating view state.
    this._needsRedraw = 'Canvas resized';
    this._updateCanvasSize(canvasContext);
  }

  private _updateCanvasMetrics(): void {
    const canvasMetrics = this._getCanvasMetrics();
    const {width: newWidth = 0, height: newHeight = 0} =
      canvasMetrics[this._getDefaultCanvasId()] || {};
    if (newWidth !== this.width || newHeight !== this.height) {
      // @ts-expect-error private assign to read-only property
      this.width = newWidth;
      // @ts-expect-error private assign to read-only property
      this.height = newHeight;
      this.props.onResize({width: newWidth, height: newHeight});
    }

    this._needsRedraw = 'Canvas resized';
    this.viewManager?.setProps({
      width: this.width,
      height: this.height,
      canvasMetrics
    });
    this.layerManager?.activateViewport(this.getViewports()[0]);
  }

  private _createAnimationLoop(
    deviceOrPromise: Device | Promise<Device>,
    props: DeckProps<ViewsT>
  ): AnimationLoop {
    const {
      // width,
      // height,
      gl,
      // debug,
      onError
      // onBeforeRender,
      // onAfterRender,
    } = props;

    return new AnimationLoop({
      device: deviceOrPromise,
      // TODO v9
      autoResizeDrawingBuffer: !gl && !this._isMultiCanvasProp(props.canvas), // do not auto resize external or multi-canvas contexts
      autoResizeViewport: false,
      // @ts-expect-error luma.gl needs to accept Promise<void> return value
      onInitialize: context => this._setDevice(context.device),
      onRender: this._onRenderFrame.bind(this),
      // @ts-expect-error typing mismatch: AnimationLoop does not accept onError:null
      onError

      // onBeforeRender,
      // onAfterRender,
    });
  }

  // Create a device from the deviceProps, assigning required defaults
  private _createDevice(props: DeckProps<ViewsT>): Promise<Device> {
    const canvasContextUserProps = this.props.deviceProps?.createCanvasContext;
    const canvasContextProps =
      typeof canvasContextUserProps === 'object' ? canvasContextUserProps : undefined;

    // In deck.gl v9, Deck always bundles and adds a webgl2Adapter.
    // This behavior is expected to change in deck.gl v10 to support WebGPU only builds.
    const deviceProps = {
      adapters: [],
      _cacheShaders: true,
      _cachePipelines: true,
      ...props.deviceProps
    };
    if (!deviceProps.adapters.includes(webgl2Adapter)) {
      deviceProps.adapters.push(webgl2Adapter);
    }

    const defaultCanvasProps: CanvasContextProps = {
      // we must use 'premultiplied' canvas for webgpu to enable transparency and match shaders
      alphaMode: this.props.deviceProps?.type === 'webgpu' ? 'premultiplied' : undefined
    };

    // Create the "best" device supported from the registered adapters
    return luma.createDevice({
      // luma by default throws if a device is already attached
      // asynchronous device creation could happen after finalize() is called
      // TODO - createDevice should support AbortController?
      _reuseDevices: true,
      // tests can't handle WebGPU devices yet so we force WebGL2 unless overridden
      type: 'webgl',
      ...deviceProps,
      // In deck.gl v10 we may emphasize multi canvas support and unwind this prop wrapping
      createCanvasContext: {
        ...defaultCanvasProps,
        ...canvasContextProps,
        canvas: this._createDeviceCanvas(props),
        useDevicePixels: this.props.useDevicePixels,
        autoResize: true
      }
    });
  }

  // Get the most relevant view state: props.viewState, if supplied, shadows internal viewState
  // TODO: For backwards compatibility ensure numeric width and height is added to the viewState
  private _getViewState(): ViewStateObject<ViewsT> | null {
    return this.props.viewState || this.viewState;
  }

  // Get the view descriptor list
  private _getViews(): View[] {
    const {views} = this.props;
    const normalizedViews: View[] = Array.isArray(views)
      ? views
      : // If null, default to a full screen map view port
        views
        ? [views]
        : [new MapView({id: 'default-view'})];
    if (normalizedViews.length && this.props.controller) {
      // Backward compatibility: support controller prop
      normalizedViews[0].props.controller = this.props.controller;
    }
    return normalizedViews;
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
    const canvasId = this._getCanvasIdFromEvent(event);
    if (event.type === 'pointerleave') {
      _pickRequest.x = -1;
      _pickRequest.y = -1;
      _pickRequest.radius = 0;
      _pickRequest.canvasId = canvasId;
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
      _pickRequest.canvasId = canvasId;
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
      const event = _pickRequest.event;
      const layers = this.layerManager?.getLayers() || [];
      const pickOptions = this._getPointPickOptions(
        _pickRequest.x,
        _pickRequest.y,
        {
          canvasId: _pickRequest.canvasId,
          radius: _pickRequest.radius,
          mode: _pickRequest.mode
        },
        layers
      );
      const internalPickingMode = this._getInternalPickingMode();
      const hoverPickSequence = ++this._hoverPickSequence;

      _pickRequest.event = null;
      _pickRequest.canvasId = undefined;

      if (!internalPickingMode) {
        return;
      }

      if (internalPickingMode === 'sync') {
        this._applyHoverCallbacks(this._pickPointSync(pickOptions), event);
        return;
      }

      this._pickPointAsync(pickOptions)
        .then(({result, emptyInfo}) => {
          if (hoverPickSequence === this._hoverPickSequence) {
            this._applyHoverCallbacks({result, emptyInfo}, event);
          }
        })
        .catch(error => this.props.onError?.(error));
    }
  }

  private _updateCursor(): void {
    const cursor = this.props.getCursor(this.cursorState);
    if (this._isMultiCanvasMode()) {
      for (const target of Object.values(this._canvasTargets)) {
        target.canvas.style.cursor = cursor;
      }
      return;
    }

    const container = this.props.parent || this.canvas;
    if (container) {
      container.style.cursor = cursor;
    }
  }

  private _setDevice(device: Device) {
    this.device = device;
    this._validateInternalPickingMode();

    if (!this.animationLoop) {
      // finalize() has been called
      return;
    }

    this._setDeviceCanvasContext(device, {
      syncDrawingBuffer: Boolean(this.props.gl && this.props.device !== device)
    });

    if (this._isMultiCanvasMode()) {
      this._syncCanvasTargets();
    } else if (this.canvas && !this.canvas.isConnected && this.props.parent) {
      // external canvas may not be in DOM
      this.props.parent.insertBefore(this.canvas, this.props.parent.firstChild);
    }
    // TODO v9
    // ts-expect-error - Currently luma.gl v9 does not expose these options
    // All WebGLDevice contexts are instrumented, but it seems the device
    // should have a method to start state tracking even if not enabled?
    // instrumentGLContext(this.device.gl, {enable: true, copyState: true});

    if (this.device.type === 'webgl') {
      this.device.setParametersWebGL({
        blend: true,
        blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
        polygonOffsetFill: true,
        depthTest: true,
        depthFunc: GL.LEQUAL
      });
    }

    this.props.onDeviceInitialized(this.device);
    if (this.device.type === 'webgl') {
      // Legacy callback - warn?
      // @ts-expect-error gl is not visible on Device base class
      this.props.onWebGLInitialized(this.device.gl);
    }

    // timeline for transitions
    const timeline = new Timeline();
    timeline.play();
    this.animationLoop.attachTimeline(timeline);

    if (!this._isMultiCanvasMode()) {
      const eventRoot = this.canvas && this._getEventRoot(this.canvas);
      assert(eventRoot);
      this.eventManager = this._createEventManager(eventRoot);
      this.eventManagers = {[DEFAULT_CANVAS_ID]: this.eventManager};
    }

    this.viewManager = new ViewManager({
      timeline,
      eventManager: this.eventManager,
      eventManagers: this.eventManagers,
      canvasMetrics: this._getCanvasMetrics(),
      onViewStateChange: this._onViewStateChange.bind(this),
      onInteractionStateChange: this._onInteractionStateChange.bind(this),
      pickPosition: this._pickPositionForController.bind(this),
      views: this._getViews(),
      viewState: this._getViewState(),
      width: this.width,
      height: this.height
    });

    // viewManager must be initialized before layerManager
    // layerManager depends on viewport created by viewManager.
    const viewport = this.viewManager.getViewports()[0];

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager(this.device, {
      deck: this,
      stats: this.stats,
      viewport,
      timeline
    });

    this.effectManager = new EffectManager({
      deck: this,
      device: this.device
    });

    this.deckRenderer = new DeckRenderer(this.device, {stats: this.stats});

    this.deckPicker = new DeckPicker(this.device, {stats: this.stats});

    const widgetParent =
      this.props.parent?.querySelector<HTMLDivElement>('.deck-widgets-root') ||
      (this._isMultiCanvasMode() ? this.props.parent || this.canvas?.parentElement : null) ||
      this.canvas?.parentElement;

    this.widgetManager = new WidgetManager({
      deck: this,
      parentElement: widgetParent
    });
    this.widgetManager.addDefault(new TooltipWidget());

    this.setProps({});

    // Seed the initial Deck width/height from the current canvas context before onLoad fires.
    this._updateCanvasSize(this._canvasContext);
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
      shaderModuleProps?: any;
      renderPassId?: string;
      clearStack?: boolean;
      clearCanvas?: boolean;
    }
  ) {
    const {device, gl} = this.layerManager!.context;

    this.props.onBeforeRender({device, gl});

    const opts = {
      target: this.props._framebuffer,
      layers: this.layerManager!.getLayers(),
      viewports: this.viewManager!.getViewports(),
      onViewportActive: this.layerManager!.activateViewport,
      views: this.viewManager!.getViews(),
      pass: 'screen',
      effects: this.effectManager!.getEffects(),
      ...renderOptions
    };

    if (
      this._isMultiCanvasMode() &&
      opts.pass === 'screen' &&
      !opts.target &&
      this._canvasTargetOrder.length
    ) {
      for (const canvasId of this._canvasTargetOrder) {
        const canvasViewports = opts.viewports.filter(
          viewport => this.viewManager!.getCanvasId(viewport.id) === canvasId
        );
        if (!canvasViewports.length) {
          this._clearCanvasTarget(canvasId, `screen-${canvasId}`);
          continue;
        }

        const target = this._canvasTargets[canvasId];
        this._resizeForCanvasTarget(canvasId);
        const framebuffer = target.presentationContext.getCurrentFramebuffer();
        this.deckRenderer?.renderLayers({
          ...opts,
          canvasContext: target.presentationContext,
          renderPassId: `screen-${canvasId}`,
          target: framebuffer,
          viewports: canvasViewports
        });
        target.presentationContext.present();
      }
    } else {
      this.deckRenderer?.renderLayers(opts);
    }

    if (opts.pass === 'screen') {
      // This method could be called when drawing to picking buffer, texture etc.
      // Only when drawing to screen, update all widgets (UI components)
      this.widgetManager!.onRedraw({
        viewports: opts.viewports,
        layers: opts.layers
      });
    }

    this.props.onAfterRender({device, gl});
  }

  /** Clear and present a canvas that currently has no mapped viewports. */
  private _clearCanvasTarget(canvasId: string, renderPassId: string): void {
    const target = this._canvasTargets[canvasId];
    if (!target || !this.device) {
      return;
    }

    this._resizeForCanvasTarget(canvasId);
    const framebuffer = target.presentationContext.getCurrentFramebuffer();
    const [width, height] = target.presentationContext.getDrawingBufferSize();
    const renderPass = this.device.beginRenderPass({
      id: renderPassId,
      framebuffer,
      parameters: {viewport: [0, 0, width, height]},
      clearColor: [0, 0, 0, 0],
      clearDepth: 1,
      clearStencil: 0
    });
    renderPass.end();
    this.device.submit();
    target.presentationContext.present();
  }

  // Callbacks

  private _onRenderFrame() {
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

    this._updateCursor();

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
    const eventHandlerProp = EVENT_HANDLERS[event.type];
    const pos = event.offsetCenter;
    const canvasId = this._getCanvasIdFromEvent(event);

    if (!eventHandlerProp || !pos || !this.layerManager) {
      return;
    }

    const layers = this.layerManager.getLayers();
    const internalPickingMode = this._getInternalPickingMode();

    if (!internalPickingMode) {
      return;
    }

    if (internalPickingMode === 'sync') {
      const info =
        event.type === 'click' && this._shouldUnproject3D(layers)
          ? this._getFirstPickedInfo(
              this._pickPointSync(
                this._getPointPickOptions(pos.x, pos.y, {unproject3D: true, canvasId}, layers)
              )
            )
          : this._getLastPointerDownPickingInfo(pos.x, pos.y, canvasId, layers);

      this._dispatchPickingEvent(info, event);
      return;
    }

    const pointerDownInfoPromise =
      this._lastPointerDownInfoPromise ||
      Promise.resolve(this._getLastPointerDownPickingInfo(pos.x, pos.y, canvasId, layers));

    pointerDownInfoPromise
      .then(info => {
        this._dispatchPickingEvent(info, event);
      })
      .catch(error => this.props.onError?.(error));
  };

  /** Internal use only: evnet handler for pointerdown */
  _onPointerDown = (event: MjolnirPointerEvent) => {
    const pos = event.offsetCenter;
    const canvasId = this._getCanvasIdFromEvent(event);
    if (!pos) {
      return;
    }

    const internalPickingMode = this._getInternalPickingMode();
    if (!internalPickingMode) {
      return;
    }

    const layers = this.layerManager?.getLayers() || [];
    const pointerDownPickSequence = ++this._pointerDownPickSequence;

    if (internalPickingMode === 'sync') {
      const pickedInfo = this._pickPointSync({
        x: pos.x,
        y: pos.y,
        canvasId,
        radius: this.props.pickingRadius
      });
      const info = this._getFirstPickedInfo(pickedInfo);
      this._lastPointerDownInfo = info;
      this._lastPointerDownInfoPromise = Promise.resolve(info);
      return;
    }

    const pickPromise = this._pickPointAsync(
      this._getPointPickOptions(pos.x, pos.y, {canvasId}, layers)
    )
      .then(pickResult => this._getFirstPickedInfo(pickResult))
      .then(info => {
        if (pointerDownPickSequence === this._pointerDownPickSequence) {
          this._lastPointerDownInfo = info;
        }
        return info;
      })
      .catch(error => {
        this.props.onError?.(error);
        const fallbackInfo =
          this.deckPicker && this.viewManager
            ? this._getLastPointerDownPickingInfo(pos.x, pos.y, canvasId, layers)
            : ({} as PickingInfo);
        if (pointerDownPickSequence === this._pointerDownPickSequence) {
          this._lastPointerDownInfo = fallbackInfo;
        }
        return fallbackInfo;
      });

    this._lastPointerDownInfo = null;
    this._lastPointerDownInfoPromise = pickPromise;
  };

  private _getFrameStats(): void {
    const {stats} = this;
    stats.get('frameRate').timeEnd();
    stats.get('frameRate').timeStart();

    // Get individual stats from luma.gl so reset works
    const animationLoopStats = this.animationLoop!.stats;
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

    metrics.layersCount = this.layerManager?.layers.length ?? 0;
    metrics.drawLayersCount = stats.get('Layers rendered').lastSampleCount;
    metrics.pickLayersCount = stats.get('Layers picked').lastSampleCount;
    metrics.updateAttributesCount = stats.get('Layers updated').count;
    metrics.updateAttributesCount = stats.get('Attributes updated').count;

    // Luma stats
    metrics.gpuTime = stats.get('GPU Time').time;
    metrics.cpuTime = stats.get('CPU Time').time;
    metrics.gpuTimePerFrame = stats.get('GPU Time').getAverageTime();
    metrics.cpuTimePerFrame = stats.get('CPU Time').getAverageTime();

    const memoryStats = luma.stats.get('GPU Time and Memory');
    metrics.bufferMemory = memoryStats.get('Buffer Memory').count;
    metrics.textureMemory = memoryStats.get('Texture Memory').count;
    metrics.renderbufferMemory = memoryStats.get('Renderbuffer Memory').count;
    metrics.gpuMemory = memoryStats.get('GPU Memory').count;
  }
}
