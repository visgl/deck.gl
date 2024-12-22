import LayersPass, {LayersPassRenderOptions, RenderStats, Rect} from './layers-pass';
import type {Framebuffer} from '@luma.gl/webgl-legacy';
import type Viewport from '../viewports/viewport';
import type Layer from '../lib/layer';
declare type PickLayersPassRenderOptions = LayersPassRenderOptions & {
  pickingFBO: Framebuffer;
  deviceRect: Rect;
  pickZ: boolean;
};
export declare type PickingColorDecoder = (pickedColor: number[] | Uint8Array) =>
  | {
      pickedLayer: Layer;
      pickedViewports: Viewport[];
      pickedObjectIndex: number;
    }
  | undefined;
export default class PickLayersPass extends LayersPass {
  private pickZ?;
  private _colors;
  render(props: PickLayersPassRenderOptions): any;
  _drawPickingBuffer({
    layers,
    layerFilter,
    views,
    viewports,
    onViewportActive,
    pickingFBO,
    deviceRect: {x, y, width, height},
    cullRect,
    effects,
    pass,
    pickZ
  }: PickLayersPassRenderOptions): {
    decodePickingColor: PickingColorDecoder | null;
    stats: RenderStats;
  };
  protected shouldDrawLayer(layer: Layer): boolean;
  protected getModuleParameters(): {
    pickingActive: number;
    pickingAttribute: boolean;
    lightSources: {};
  };
  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): any;
}
export {};
// # sourceMappingURL=pick-layers-pass.d.ts.map
