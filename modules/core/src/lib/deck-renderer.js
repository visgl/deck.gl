import log from '../utils/log';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';
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
    this.renderBuffers = [];
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

    opts.layerFilter = this.layerFilter;
    opts.effects = opts.effects || [];
    opts.target = opts.target || Framebuffer.getDefaultFramebuffer(this.gl);

    this._preRender(opts.effects, opts);

    const outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : opts.target;
    const renderStats = layerPass.render({...opts, target: outputBuffer});

    this._postRender(opts.effects, opts);

    this.renderCount++;

    if (log.priority >= LOG_PRIORITY_DRAW) {
      renderStats.forEach(status => {
        this._logRenderStats(status, opts.pass, opts.redrawReason, opts.stats, renderStats);
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
      effect.preRender(this.gl, opts);
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
      renderBuffers.push(new Framebuffer(this.gl), new Framebuffer(this.gl));
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
          effect.postRender(this.gl, params);
          break;
        }
        const buffer = effect.postRender(this.gl, params);
        params.inputBuffer = buffer;
        params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
      }
    }
  }

  _logRenderStats(status, pass, redrawReason, stats, renderStats) {
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
