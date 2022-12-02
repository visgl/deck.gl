import type {Device} from '@luma.gl/api';
import {Framebuffer} from '@luma.gl/core';
import debug from '../debug';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';

const TRACE_RENDER_LAYERS = 'deckRenderer.renderLayers';

export default class DeckRenderer {
  device: Device;
  layerFilter: Function | null = null;
  drawPickingColors = false;
  drawLayersPass: DrawLayersPass;
  pickLayersPass: PickLayersPass;
  renderCount = 0;
  _needsRedraw: string | false = 'Initial render';
  renderBuffers: any[] = [];
  lastPostProcessEffect = null;

  constructor(device: Device) {
    this.device = device;
    this.drawLayersPass = new DrawLayersPass(device);
    this.pickLayersPass = new PickLayersPass(device);
  }

  setProps(props) {
    if ('layerFilter' in props && this.layerFilter !== props.layerFilter) {
      this.layerFilter = props.layerFilter;
      this._needsRedraw = 'layerFilter changed';
    }

    if ('drawPickingColors' in props && this.drawPickingColors !== props.drawPickingColors) {
      this.drawPickingColors = props.drawPickingColors;
      this._needsRedraw = 'drawPickingColors changed';
    }
  }

  /*
    target,
    layers,
    viewports,
    onViewportActive,
    views,
    redrawReason,
    clearCanvas,
    effects,
    pass,
    stats
  */
  renderLayers(opts) {
    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;

    opts.layerFilter = opts.layerFilter || this.layerFilter;
    opts.effects = opts.effects || [];
    // @ts-expect-error
    const gl = this.device.gl as WebGLRenderingContext;
    opts.target = opts.target || Framebuffer.getDefaultFramebuffer(gl);

    this._preRender(opts.effects, opts);

    const outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : opts.target;
    const renderStats = layerPass.render({...opts, target: outputBuffer});

    this._postRender(opts.effects, opts);

    this.renderCount++;

    debug(TRACE_RENDER_LAYERS, this, renderStats, opts);
  }

  needsRedraw(opts = {clearRedrawFlags: false}) {
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

  // Private
  _preRender(effects, opts) {
    let lastPostProcessEffect = null;

    for (const effect of effects) {
      effect.preRender(this.device, opts);
      if (effect.postRender) {
        lastPostProcessEffect = effect;
      }
    }

    if (lastPostProcessEffect) {
      this._resizeRenderBuffers();
    }
    this.lastPostProcessEffect = lastPostProcessEffect;
  }

  _resizeRenderBuffers() {
    const {renderBuffers} = this;
    if (renderBuffers.length === 0) {
      renderBuffers.push(new Framebuffer(this.device), new Framebuffer(this.device));
    }
    for (const buffer of renderBuffers) {
      buffer.resize();
    }
  }

  _postRender(effects, opts) {
    const {renderBuffers} = this;
    const params = {
      inputBuffer: renderBuffers[0],
      swapBuffer: renderBuffers[1],
      target: null
    };
    for (const effect of effects) {
      if (effect.postRender) {
        if (effect === this.lastPostProcessEffect) {
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
