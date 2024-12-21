import type {Device} from '@luma.gl/api';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';
export default class DeckRenderer {
  device: Device;
  layerFilter: Function | null;
  drawPickingColors: boolean;
  drawLayersPass: DrawLayersPass;
  pickLayersPass: PickLayersPass;
  renderCount: number;
  _needsRedraw: string | false;
  renderBuffers: any[];
  lastPostProcessEffect: any;
  constructor(device: Device);
  setProps(props: any): void;
  renderLayers(opts: any): void;
  needsRedraw(opts?: {clearRedrawFlags: boolean}): string | false;
  finalize(): void;
  _preRender(effects: any, opts: any): void;
  _resizeRenderBuffers(): void;
  _postRender(effects: any, opts: any): void;
}
// # sourceMappingURL=deck-renderer.d.ts.map
