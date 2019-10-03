import log from '../utils/log';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';
import PostProcessEffect from '../effects/post-process-effect';
import {Framebuffer} from '@luma.gl/core';

const LOG_PRIORITY_DRAW = 2;

export default class DeckRenderer {
  constructor(gl) {
    this.gl = gl;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(gl);
    this.pickLayersPass = new PickLayersPass(gl);
    this.renderCount = 0;
    this._needsRedraw = 'Initial render';
    this.screenBuffer = null;
    this.offscreenBuffer = null;
    this.lastPostProcessEffect = null;
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

  renderLayers({
    layers,
    viewports,
    onViewportActive,
    views,
    redrawReason,
    clearCanvas,
    effects = [],
    pass,
    stats
  }) {
    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;
    const effectProps = this._prepareEffects({
      layers,
      layerFilter: this.layerFilter,
      viewports,
      onViewportActive,
      views,
      effects
    });
    const outputBuffer = this.lastPostProcessEffect
      ? this.screenBuffer
      : Framebuffer.getDefaultFramebuffer(this.gl);

    const renderStats = layerPass.render({
      layers,
      layerFilter: this.layerFilter,
      viewports,
      views,
      onViewportActive,
      pass,
      redrawReason,
      clearCanvas,
      effects,
      effectProps,
      outputBuffer
    });

    this._postRender(effects);

    this.renderCount++;

    if (log.priority >= LOG_PRIORITY_DRAW) {
      renderStats.forEach(status => {
        this._logRenderStats({status, pass, redrawReason, stats, renderStats});
      });
    }
  }

  needsRedraw(opts = {clearRedrawFlags: false}) {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  finalize() {
    if (this.screenBuffer) {
      this.screenBuffer.delete();
      this.screenBuffer = null;
    }
    if (this.offscreenBuffer) {
      this.offscreenBuffer.delete();
      this.offscreenBuffer = null;
    }
  }

  // Private
  _prepareEffects(params) {
    const {effects} = params;
    const effectProps = {};
    this.lastPostProcessEffect = null;

    for (const effect of effects) {
      Object.assign(effectProps, effect.prepare(this.gl, params));
      if (effect instanceof PostProcessEffect) {
        this.lastPostProcessEffect = effect;
      }
    }

    if (this.lastPostProcessEffect) {
      this._prepareRenderBuffers();
    }

    return effectProps;
  }

  _prepareRenderBuffers() {
    if (!this.screenBuffer) {
      this.screenBuffer = new Framebuffer(this.gl);
    }
    this.screenBuffer.resize();

    if (!this.offscreenBuffer) {
      this.offscreenBuffer = new Framebuffer(this.gl);
    }
    this.offscreenBuffer.resize();
  }

  _postRender(effects) {
    let params = {inputBuffer: this.screenBuffer, outputBuffer: this.offscreenBuffer, target: null};
    for (const effect of effects) {
      if (effect instanceof PostProcessEffect) {
        if (effect === this.lastPostProcessEffect) {
          Object.assign(params, {target: Framebuffer.getDefaultFramebuffer(this.gl)});
          params = effect.render(params);
          break;
        }
        params = effect.render(params);
      }
    }
  }

  _logRenderStats({renderStats, pass, redrawReason, stats}) {
    const {totalCount, visibleCount, compositeCount, pickableCount} = renderStats;
    const primitiveCount = totalCount - compositeCount;
    const hiddenCount = primitiveCount - visibleCount;

    let message = '';
    message += `RENDER #${this.renderCount} \
${visibleCount} (of ${totalCount} layers) to ${pass} because ${redrawReason} `;
    if (log.priority > LOG_PRIORITY_DRAW) {
      message += `\
(${hiddenCount} hidden, ${compositeCount} composite ${pickableCount} pickable)`;
    }

    log.log(LOG_PRIORITY_DRAW, message)();

    if (stats) {
      stats.get('Redraw Layers').add(visibleCount);
    }
  }
}
