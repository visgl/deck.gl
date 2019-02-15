import log from '../utils/log';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';

const LOG_PRIORITY_DRAW = 2;

export default class DeckRenderer {
  constructor(gl) {
    this.gl = gl;
    this.useDevicePixels = true;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(gl);
    this.pickLayersPass = new PickLayersPass(gl);
    this.renderCount = 0;
  }

  setProps(props) {
    if ('useDevicePixels' in props) {
      this.useDevicePixels = props.useDevicePixels;
    }

    if ('layerFilter' in props) {
      if (this.layerFilter !== props.layerFilter) {
        this.layerFilter = props.layerFilter;
      }
    }

    if ('drawPickingColors' in props) {
      if (props.drawPickingColors !== this.drawPickingColors) {
        this.drawPickingColors = props.drawPickingColors;
      }
    }
  }

  renderLayers({
    layers,
    viewports,
    activateViewport,
    views,
    redrawReason = 'unknown reason',
    customRender = false,
    pass,
    stats
  }) {
    const {drawPickingColors, layerFilter} = this;
    const layerPass = drawPickingColors ? this.pickLayersPass : this.drawLayersPass;
    layerPass.setProps({
      layers,
      viewports,
      views,
      onViewportActive: activateViewport,
      useDevicePixels: this.useDevicePixels,
      layerFilter,
      redrawReason,
      customRender
    });

    const renderStats = layerPass.render();
    this.renderCount++;

    if (log.priority >= LOG_PRIORITY_DRAW) {
      renderStats.forEach(status => {
        this.logRenderStats({status, pass, redrawReason, stats});
      });
    }
  }

  // Private
  prepareEffects({effects}) {
    const effectProps = {};

    for (const effect of effects) {
      Object.assign(effectProps, effect.prepare());
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
      stats.increment('redraw layers', visibleCount);
    }
  }
}
