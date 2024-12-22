import type {Framebuffer} from '@luma.gl/webgl-legacy';
import Pass from './pass';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type Layer from '../lib/layer';
import type {Effect} from '../lib/effect';
export declare type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export declare type LayersPassRenderOptions = {
  target?: Framebuffer;
  pass: string;
  layers: Layer[];
  viewports: Viewport[];
  onViewportActive: (viewport: Viewport) => void;
  cullRect?: Rect;
  views?: Record<string, View>;
  effects?: Effect[];
  /** If true, recalculates render index (z) from 0. Set to false if a stack of layers are rendered in multiple passes. */
  clearStack?: boolean;
  clearCanvas?: boolean;
  layerFilter?: (context: FilterContext) => boolean;
  moduleParameters?: any;
};
export declare type FilterContext = {
  layer: Layer;
  viewport: Viewport;
  isPicking: boolean;
  renderPass: string;
  cullRect?: Rect;
};
export declare type RenderStats = {
  totalCount: number;
  visibleCount: number;
  compositeCount: number;
  pickableCount: number;
};
export default class LayersPass extends Pass {
  _lastRenderIndex: number;
  render(options: LayersPassRenderOptions): any;
  private _drawLayers;
  private _getDrawLayerParams;
  private _drawLayersInViewport;
  protected shouldDrawLayer(layer: Layer): boolean;
  protected getModuleParameters(layer: Layer, effects?: Effect[]): any;
  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): any;
  private _shouldDrawLayer;
  private _getModuleParameters;
}
export declare function layerIndexResolver(
  startIndex?: number,
  layerIndices?: Record<string, number>
): (layer: Layer, isDrawn: boolean) => number;
// # sourceMappingURL=layers-pass.d.ts.map
