import type {Device} from '@luma.gl/core';
import {Framebuffer} from '@luma.gl/core';
import debug from '../debug';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';

import type Layer from './layer';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type {Effect, PostRenderOptions} from './effect';
import type {LayersPassRenderOptions, FilterContext} from '../passes/layers-pass';
import {WEBGLRenderbuffer} from '@luma.gl/webgl';

const TRACE_RENDER_LAYERS = 'deckRenderer.renderLayers';

type LayerFilter = ((context: FilterContext) => boolean) | null;

export default class DeckRenderer {
  device: Device;
  gl: WebGLRenderingContext;
  layerFilter: LayerFilter;
  drawPickingColors: boolean;
  drawLayersPass: DrawLayersPass;
  pickLayersPass: PickLayersPass;

  private renderCount: number;
  private _needsRedraw: string | false;
  private renderBuffers: Framebuffer[];
  private lastPostProcessEffect: string | null;

  constructor(device: Device) {
    this.device = device;
    // @ts-expect-error
    this.gl = device.gl;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(device);
    this.pickLayersPass = new PickLayersPass(device);
    this.renderCount = 0;
    this._needsRedraw = 'Initial render';
    this.renderBuffers = [];
    this.lastPostProcessEffect = null;
  }

  setProps(props: {layerFilter: LayerFilter; drawPickingColors: boolean}) {
    if (this.layerFilter !== props.layerFilter) {
      this.layerFilter = props.layerFilter;
      this._needsRedraw = 'layerFilter changed';
    }

    if (this.drawPickingColors !== props.drawPickingColors) {
      this.drawPickingColors = props.drawPickingColors;
      this._needsRedraw = 'drawPickingColors changed';
    }
  }

  renderLayers(opts: {
    pass: string;
    layers: Layer[];
    viewports: Viewport[];
    views: {[viewId: string]: View};
    onViewportActive: (viewport: Viewport) => void;
    effects: Effect[];
    target?: Framebuffer | null;
    layerFilter?: LayerFilter;
    clearStack?: boolean;
    clearCanvas?: boolean;
  }) {
    if (!opts.viewports.length) {
      return;
    }

    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;

    const renderOpts: LayersPassRenderOptions = {
      layerFilter: this.layerFilter,
      isPicking: this.drawPickingColors,
      ...opts
    };

    if (renderOpts.effects) {
      this._preRender(renderOpts.effects, renderOpts);
    }

    const outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : renderOpts.target;
    const renderStats = layerPass.render({...renderOpts, target: outputBuffer});

    if (renderOpts.effects) {
      this._postRender(renderOpts.effects, renderOpts);
    }

    this.renderCount++;

    debug(TRACE_RENDER_LAYERS, this, renderStats, opts);
  }

  needsRedraw(opts: {clearRedrawFlags: boolean} = {clearRedrawFlags: false}): string | false {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  finalize() {
    const {renderBuffers} = this;
    for (const buffer of renderBuffers) {
      buffer.delete();
    }
    renderBuffers.length = 0;
  }

  private _preRender(effects: Effect[], opts: LayersPassRenderOptions) {
    this.lastPostProcessEffect = null;
    opts.preRenderStats = opts.preRenderStats || {};

    for (const effect of effects) {
      opts.preRenderStats[effect.id] = effect.preRender(this.device, opts);
      if (effect.postRender) {
        this.lastPostProcessEffect = effect.id;
      }
    }

    if (this.lastPostProcessEffect) {
      this._resizeRenderBuffers();
    }
  }

  private _resizeRenderBuffers() {
    const {renderBuffers} = this;
    const size = this.device.canvasContext!.getDrawingBufferSize();
    if (renderBuffers.length === 0) {
      [0, 1].map(i => {
        const texture = this.device.createTexture({
          width: 1,
          height: 1,
          sampler: {
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge'
          }
        });
        const depthBuffer = new WEBGLRenderbuffer(this.device as any, {
          format: 'depth16unorm',
          width: 1,
          height: 1
        });
        renderBuffers.push(
          this.device.createFramebuffer({
            id: `deck-render-buffer-${i}`,
            width: 1,
            height: 1,
            colorAttachments: [texture],
            // @ts-expect-error Renderbuffer typing not solved in luma.gl
            depthStencilAttachment: depthBuffer
          })
        );
      });
    }
    for (const buffer of renderBuffers) {
      buffer.resize(size);
    }
  }

  private _postRender(effects: Effect[], opts: LayersPassRenderOptions) {
    const {renderBuffers} = this;
    const params: PostRenderOptions = {
      ...opts,
      inputBuffer: renderBuffers[0],
      swapBuffer: renderBuffers[1]
    };
    for (const effect of effects) {
      if (effect.postRender) {
        if (effect.id === this.lastPostProcessEffect) {
          params.target = opts.target;
          effect.postRender(this.device, params);
          break;
        }
        const buffer = effect.postRender(this.device, params);
        params.inputBuffer = buffer;
        params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
      }
    }
  }
}
