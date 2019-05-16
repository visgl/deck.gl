import log from '../utils/log';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';
import getPixelRatio from '../utils/get-pixel-ratio';
import PostProcessEffect from '../effects/post-process-effect';
import {Framebuffer} from '@luma.gl/core';

const LOG_PRIORITY_DRAW = 2;

export default class DeckRenderer {
  constructor(gl) {
    this.gl = gl;
    this.pixelRatio = null;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(gl);
    this.pickLayersPass = new PickLayersPass(gl);
    this.renderCount = 0;
    this._needsRedraw = 'Initial render';
    this.screenBuffer = null;
    this.offscreenBuffer = null;
  }

  setProps(props) {
    if ('useDevicePixels' in props) {
      this.pixelRatio = getPixelRatio(props.useDevicePixels);
    }

    if ('layerFilter' in props) {
      if (this.layerFilter !== props.layerFilter) {
        this.layerFilter = props.layerFilter;
        this._needsRedraw = 'layerFilter changed';
      }
    }

    if ('drawPickingColors' in props) {
      if (this.drawPickingColors !== props.drawPickingColors) {
        this.drawPickingColors = props.drawPickingColors;
        this._needsRedraw = 'drawPickingColors changed';
      }
    }

    const {pixelRatio, layerFilter} = this;

    this.drawLayersPass.setProps({
      pixelRatio,
      layerFilter
    });
    this.pickLayersPass.setProps({
      pixelRatio,
      layerFilter
    });
  }

  renderLayers({
    layers,
    viewports,
    activateViewport,
    views,
    redrawReason = 'unknown reason',
    clearCanvas = true,
    effects = [],
    pass,
    stats
  }) {
    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;
    const {effectProps, postProcessEffects} = this.prepareEffects(effects);
    const outputBuffer =
      postProcessEffects.length > 0
        ? this.screenBuffer
        : Framebuffer.getDefaultFramebuffer(this.gl);

    const renderStats = layerPass.render({
      layers,
      viewports,
      views,
      onViewportActive: activateViewport,
      redrawReason,
      clearCanvas,
      effects,
      effectProps,
      outputBuffer
    });

    this.renderPostProcessEffects(postProcessEffects);

    this.renderCount++;

    if (log.priority >= LOG_PRIORITY_DRAW) {
      renderStats.forEach(status => {
        this.logRenderStats({status, pass, redrawReason, stats});
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

  // Private
  prepareEffects(effects) {
    const effectProps = {};
    const postProcessEffects = [];

    for (const effect of effects) {
      Object.assign(effectProps, effect.prepare(this.gl));
      if (effect instanceof PostProcessEffect) {
        postProcessEffects.push(effect);
      }
    }

    this.prepareRenderBuffers(postProcessEffects);

    return {effectProps, postProcessEffects};
  }

  prepareRenderBuffers(postProcessEffects) {
    if (postProcessEffects.length > 0) {
      if (!this.screenBuffer) {
        this.screenBuffer = new Framebuffer(this.gl);
      }
      this.screenBuffer.resize();

      if (!this.offscreenBuffer) {
        this.offscreenBuffer = new Framebuffer(this.gl);
      }
      this.offscreenBuffer.resize();
    }
  }

  renderPostProcessEffects(effects) {
    let params = {inputBuffer: this.screenBuffer, outputBuffer: this.offscreenBuffer, target: null};
    for (let index = 0; index < effects.length; index++) {
      if (index === effects.length - 1) {
        Object.assign(params, {target: Framebuffer.getDefaultFramebuffer(this.gl)});
      }
      params = effects[index].render(this.gl, params);
    }
  }

  logRenderStats({renderStats, pass, redrawReason, stats}) {
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
