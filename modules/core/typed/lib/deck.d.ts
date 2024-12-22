import LayerManager from './layer-manager';
import ViewManager from './view-manager';
import EffectManager from './effect-manager';
import DeckRenderer from './deck-renderer';
import DeckPicker from './deck-picker';
import Tooltip from './tooltip';
import {Device, DeviceProps} from '@luma.gl/api';
import {AnimationLoop} from '@luma.gl/webgl-legacy';
import {Stats} from '@probe.gl/stats';
import {EventManager} from 'mjolnir.js';
import type {Effect} from './effect';
import type {FilterContext} from '../passes/layers-pass';
import type Layer from './layer';
import type View from '../views/view';
import type Viewport from '../viewports/viewport';
import type {RecognizerOptions, MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
import type {Framebuffer} from '@luma.gl/webgl-legacy';
import type {TypedArrayManagerOptions} from '../utils/typed-array-manager';
import type {ViewStateChangeParameters, InteractionState} from '../controllers/controller';
import type {PickingInfo} from './picking/pick-info';
import type {LayersList} from './layer-manager';
import type {TooltipContent} from './tooltip';
declare function noop(): void;
export declare type DeckMetrics = {
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
declare type CursorState = {
  /** Whether the cursor is over a pickable object */
  isHovering: boolean;
  /** Whether the cursor is down */
  isDragging: boolean;
};
export declare type DeckProps = {
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
  /** luma.gl GPU device. A device will be auto-created if not supplied. */
  device?: Device | null;
  /** A device will be auto-created if not supplied using these props. */
  deviceProps?: DeviceProps;
  /** WebGL context @deprecated Use props.device */
  gl?: WebGLRenderingContext | null;
  /** Options used when creating a WebGL context. @deprecated Use props.deviceProps */
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
  /** Called once the GPU Device has been initiated. */
  onDeviceInitialized?: (device: Device) => void;
  /** @deprecated Called once the WebGL context has been initiated. */
  onWebGLInitialized?: (gl: WebGLRenderingContext) => void;
  /** Called when the canvas resizes. */
  onResize?: (dimensions: {width: number; height: number}) => void;
  /** Called when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard. */
  onViewStateChange?: (
    params: ViewStateChangeParameters & {
      viewId: string;
    }
  ) => any;
  /** Called when the user has interacted with the deck.gl canvas, e.g. using mouse, touch or keyboard. */
  onInteractionStateChange?: (state: InteractionState) => void;
  /** Called just before the canvas rerenders. */
  onBeforeRender?: (context: {device: Device; gl: WebGLRenderingContext}) => void;
  /** Called right after the canvas rerenders. */
  onAfterRender?: (context: {device: Device; gl: WebGLRenderingContext}) => void;
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
export default class Deck {
  static defaultProps: {
    id: string;
    width: string;
    height: string;
    style: any;
    viewState: any;
    initialViewState: any;
    pickingRadius: number;
    layerFilter: any;
    parameters: {};
    parent: any;
    device: any;
    deviceProps: {};
    gl: any;
    glOptions: {};
    canvas: any;
    layers: any[];
    effects: any[];
    views: any;
    controller: any;
    useDevicePixels: boolean;
    touchAction: string;
    eventRecognizerOptions: {};
    _framebuffer: any;
    _animate: boolean;
    _pickable: boolean;
    _typedArrayManagerProps: {};
    _customRender: any;
    onDeviceInitialized: typeof noop;
    onWebGLInitialized: typeof noop;
    onResize: typeof noop;
    onViewStateChange: typeof noop;
    onInteractionStateChange: typeof noop;
    onBeforeRender: typeof noop;
    onAfterRender: typeof noop;
    onLoad: typeof noop;
    onError: (error: Error) => void;
    onHover: any;
    onClick: any;
    onDragStart: any;
    onDrag: any;
    onDragEnd: any;
    _onMetrics: any;
    getCursor: ({isDragging}: {isDragging: any}) => 'grabbing' | 'grab';
    getTooltip: any;
    debug: boolean;
    drawPickingColors: boolean;
  };
  static VERSION: any;
  readonly props: Required<DeckProps>;
  readonly width: number;
  readonly height: number;
  readonly userData: Record<string, any>;
  protected device: Device | null;
  protected canvas: HTMLCanvasElement | null;
  protected viewManager: ViewManager | null;
  protected layerManager: LayerManager | null;
  protected effectManager: EffectManager | null;
  protected deckRenderer: DeckRenderer | null;
  protected deckPicker: DeckPicker | null;
  protected eventManager: EventManager | null;
  protected tooltip: Tooltip | null;
  protected animationLoop: AnimationLoop;
  /** Internal view state if no callback is supplied */
  protected viewState: any;
  protected cursorState: CursorState;
  protected stats: Stats;
  protected metrics: DeckMetrics;
  private _metricsCounter;
  private _needsRedraw;
  private _pickRequest;
  /**
   * Pick and store the object under the pointer on `pointerdown`.
   * This object is reused for subsequent `onClick` and `onDrag*` callbacks.
   */
  private _lastPointerDownInfo;
  constructor(props: DeckProps);
  /** Stop rendering and dispose all resources */
  finalize(): void;
  /** Partially update props */
  setProps(props: DeckProps): void;
  /**
   * Check if a redraw is needed
   * @returns `false` or a string summarizing the redraw reason
   */
  needsRedraw(opts?: {
    /** Reset the redraw flag afterwards. Default `true` */
    clearRedrawFlags: boolean;
  }): false | string;
  /**
   * Redraw the GL context
   * @param reason If not provided, only redraw if deemed necessary. Otherwise redraw regardless of internal states.
   * @returns
   */
  redraw(reason?: string): void;
  /** Flag indicating that the Deck instance has initialized its resources and it's safe to call public methods. */
  get isInitialized(): boolean;
  /** Get a list of views that are currently rendered */
  getViews(): View[];
  /** Get a list of viewports that are currently rendered.
   * @param rect If provided, only returns viewports within the given bounding box.
   */
  getViewports(rect?: {x: number; y: number; width?: number; height?: number}): Viewport[];
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
  }): PickingInfo | null;
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
  }): PickingInfo[];
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
  }): PickingInfo[];
  /** Experimental
   * Add a global resource for sharing among layers
   */
  _addResources(
    resources: {
      [id: string]: any;
    },
    forceUpdate?: boolean
  ): void;
  /** Experimental
   * Remove a global resource
   */
  _removeResources(resourceIds: string[]): void;
  private _pick;
  /** Resolve props.canvas to element */
  private _createCanvas;
  /** Updates canvas width and/or height, if provided as props */
  private _setCanvasSize;
  /** If canvas size has changed, reads out the new size and update */
  private _updateCanvasSize;
  private _createAnimationLoop;
  private _getViewState;
  private _getViews;
  private _onContextLost;
  /** Internal use only: event handler for pointerdown */
  _onPointerMove: (event: MjolnirPointerEvent) => void;
  /** Actually run picking */
  private _pickAndCallback;
  private _updateCursor;
  private _setDevice;
  /** Internal only: default render function (redraw all layers and views) */
  _drawLayers(
    redrawReason: string,
    renderOptions?: {
      target?: Framebuffer;
      layerFilter?: (context: FilterContext) => boolean;
      layers?: Layer[];
      viewports?: Viewport[];
      views?: {
        [viewId: string]: View;
      };
      pass?: string;
      effects?: Effect[];
      clearStack?: boolean;
      clearCanvas?: boolean;
    }
  ): void;
  private _onRenderFrame;
  private _onViewStateChange;
  private _onInteractionStateChange;
  /** Internal use only: event handler for click & drag */
  _onEvent: (event: MjolnirGestureEvent) => void;
  /** Internal use only: evnet handler for pointerdown */
  _onPointerDown: (event: MjolnirPointerEvent) => void;
  private _getFrameStats;
  private _getMetrics;
}
export {};
// # sourceMappingURL=deck.d.ts.map
