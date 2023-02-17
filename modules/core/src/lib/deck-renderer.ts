import debug from '../debug';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';
import {Framebuffer} from '@luma.gl/core';

import type Layer from './layer';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type {Effect} from './effect';
import type {LayersPassRenderOptions, FilterContext} from '../passes/layers-pass';

const TRACE_RENDER_LAYERS = 'deckRenderer.renderLayers';

type LayerFilter = ((context: FilterContext) => boolean) | null;

export default class DeckRenderer {
  gl: WebGLRenderingContext;
  layerFilter: LayerFilter;
  drawPickingColors: boolean;
  drawLayersPass: DrawLayersPass;
  pickLayersPass: PickLayersPass;

  private renderCount: number;
  private _needsRedraw: string | false;
  private renderBuffers: Framebuffer[];
  private lastPostProcessEffect: string | null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(gl);
    this.pickLayersPass = new PickLayersPass(gl);
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
    target?: Framebuffer;
    layerFilter?: LayerFilter;
    clearStack?: boolean;
    clearCanvas?: boolean;
  }) {
    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;

    const renderOpts: LayersPassRenderOptions = {
      layerFilter: this.layerFilter,
      isPicking: this.drawPickingColors,
      ...opts,
      target: opts.target || Framebuffer.getDefaultFramebuffer(this.gl)
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
      opts.preRenderStats[effect.id] = effect.preRender(this.gl, opts);
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
    if (renderBuffers.length === 0) {
      renderBuffers.push(new Framebuffer(this.gl), new Framebuffer(this.gl));
    }
    for (const buffer of renderBuffers) {
      buffer.resize();
    }
  }

  private _postRender(effects: Effect[], opts: LayersPassRenderOptions) {
    const {renderBuffers} = this;
    const params = {
      ...opts,
      inputBuffer: renderBuffers[0],
      swapBuffer: renderBuffers[1],
      target: null
    };
    for (const effect of effects) {
      if (effect.postRender) {
        if (effect.id === this.lastPostProcessEffect) {
          params.target = opts.target;
          effect.postRender(this.gl, params);
          break;
        }
        const buffer = effect.postRender(this.gl, params);
        params.inputBuffer = buffer;
        params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
      }
    }
  }
}
