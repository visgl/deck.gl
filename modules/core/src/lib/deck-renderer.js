import log from '../utils/log';
import DrawLayersPass from '../passes/draw-layers-pass';

const LOG_PRIORITY_DRAW = 2;

export default class DeckRenderer {
  constructor(props) {
    const {gl, layerManager, effectManager} = props;

    this.gl = gl;
    this.layerManager = layerManager;
    this.effectManager = effectManager;
    this.drawLayersPass = new DrawLayersPass(gl);
    this.renderCount = 0;
  }

  renderLayers({
    viewports,
    views,
    redrawReason = 'unknown reason',
    customRender = false,
    pass,
    stats
  }) {
    const {drawPickingColors, layers, layerFilter} = this.layerManager;
    const {useDevicePixels} = this.layerManager.context;

    this.drawLayersPass.setProps({
      layers,
      viewports,
      views,
      onViewportActive: this.layerManager.activateViewport,
      useDevicePixels,
      drawPickingColors,
      layerFilter,
      redrawReason,
      customRender
    });

    const renderStats = this.drawLayersPass.render();
    this.renderCount++;

    if (log.priority >= LOG_PRIORITY_DRAW) {
      renderStats.forEach(status => {
        this.logRenderStats({status, pass, redrawReason, stats});
      });
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
