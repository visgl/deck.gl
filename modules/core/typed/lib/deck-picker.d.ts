import type {Device} from '@luma.gl/api';
import PickLayersPass, {PickingColorDecoder} from '../passes/pick-layers-pass';
import {PickingInfo} from './picking/pick-info';
import type {Framebuffer as LumaFramebuffer} from '@luma.gl/webgl-legacy';
import type {FilterContext, Rect} from '../passes/layers-pass';
import type Layer from './layer';
import type {Effect} from './effect';
import type View from '../views/view';
import type Viewport from '../viewports/viewport';
export declare type PickByPointOptions = {
  x: number;
  y: number;
  radius?: number;
  depth?: number;
  mode?: string;
  unproject3D?: boolean;
};
export declare type PickByRectOptions = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  mode?: string;
  maxObjects?: number | null;
};
declare type PickOperationContext = {
  layers: Layer[];
  views: Record<string, View>;
  viewports: Viewport[];
  onViewportActive: (viewport: Viewport) => void;
  effects: Effect[];
};
/** Manages picking in a Deck context */
export default class DeckPicker {
  device: Device;
  pickingFBO?: LumaFramebuffer;
  depthFBO?: LumaFramebuffer;
  pickLayersPass: PickLayersPass;
  layerFilter?: (context: FilterContext) => boolean;
  /** Identifiers of the previously picked object, for callback tracking and auto highlight */
  lastPickedInfo: {
    index: number;
    layerId: string | null;
    info: PickingInfo | null;
  };
  _pickable: boolean;
  constructor(device: Device);
  setProps(props: any): void;
  finalize(): void;
  /** Pick the closest info at given coordinate */
  pickObject(opts: PickByPointOptions & PickOperationContext): {
    result: PickingInfo[];
    emptyInfo: PickingInfo;
  };
  /** Get all unique infos within a bounding box */
  pickObjects(opts: PickByRectOptions & PickOperationContext): PickingInfo[];
  getLastPickedObject(
    {
      x,
      y,
      layers,
      viewports
    }: {
      x: any;
      y: any;
      layers: any;
      viewports: any;
    },
    lastPickedInfo?: PickingInfo
  ): {
    x: any;
    y: any;
    viewport: any;
    coordinate: any;
    layer: any;
    color: Uint8Array;
    sourceLayer?: Layer<{}>;
    index: number;
    picked: boolean;
    object?: any;
    pixel?: [number, number];
    devicePixel?: [number, number];
    pixelRatio: number;
  };
  /** Ensures that picking framebuffer exists and matches the canvas size */
  _resizeBuffer(): void;
  /** Preliminary filtering of the layers list. Skid picking pass if no layer is pickable. */
  _getPickable(layers: Layer[]): Layer[] | null;
  /** Pick the closest object at the given coordinate */
  _pickClosestObject({
    layers,
    views,
    viewports,
    x,
    y,
    radius,
    depth,
    mode,
    unproject3D,
    onViewportActive,
    effects
  }: PickByPointOptions & PickOperationContext): {
    result: PickingInfo[];
    emptyInfo: PickingInfo;
  };
  /** Pick all objects within the given bounding box */
  _pickVisibleObjects({
    layers,
    views,
    viewports,
    x,
    y,
    width,
    height,
    mode,
    maxObjects,
    onViewportActive,
    effects
  }: PickByRectOptions & PickOperationContext): PickingInfo[];
  /** Renders layers into the picking buffer with picking colors and read the pixels. */
  _drawAndSample(params: {
    deviceRect: Rect;
    pass: string;
    layers: Layer[];
    views: Record<string, View>;
    viewports: Viewport[];
    onViewportActive: (viewport: Viewport) => void;
    cullRect?: Rect;
    effects: Effect[];
  }): {
    pickedColors: Uint8Array;
    decodePickingColor: PickingColorDecoder;
  };
  /** Renders layers into the picking buffer with encoded z values and read the pixels. */
  _drawAndSample(
    params: {
      deviceRect: Rect;
      pass: string;
      layers: Layer[];
      views: Record<string, View>;
      viewports: Viewport[];
      onViewportActive: (viewport: Viewport) => void;
      cullRect?: Rect;
      effects: Effect[];
    },
    pickZ: true
  ): {
    pickedColors: Float32Array;
    decodePickingColor: null;
  };
  _getPickingRect({
    deviceX,
    deviceY,
    deviceRadius,
    deviceWidth,
    deviceHeight
  }: {
    deviceX: number;
    deviceY: number;
    deviceRadius: number;
    deviceWidth: number;
    deviceHeight: number;
  }): Rect | null;
}
export {};
// # sourceMappingURL=deck-picker.d.ts.map
