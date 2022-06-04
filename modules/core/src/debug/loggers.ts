import type {Log} from '@probe.gl/log';

const logState: {
  attributeUpdateStart: number;
  attributeManagerUpdateStart: number;
  attributeUpdateMessages: string[];
} = {
  attributeUpdateStart: -1,
  attributeManagerUpdateStart: -1,
  attributeUpdateMessages: []
};

const LOG_LEVEL_MAJOR_UPDATE = 1; // Events with direct perf impact
const LOG_LEVEL_MINOR_UPDATE = 2; // Events that may affect perf
const LOG_LEVEL_UPDATE_DETAIL = 3;
const LOG_LEVEL_INFO = 4;
const LOG_LEVEL_DRAW = 2;

export const getLoggers = (log: Log): Record<string, Function> => ({
  /* Layer events */

  'layer.changeFlag': (layer, key, flags) => {
    log.log(LOG_LEVEL_UPDATE_DETAIL, `${layer.id} ${key}: `, flags[key])();
  },

  'layer.initialize': layer => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, `Initializing ${layer}`)();
  },
  'layer.update': (layer, needsUpdate) => {
    if (needsUpdate) {
      const flags = layer.getChangeFlags();
      log.log(
        LOG_LEVEL_MINOR_UPDATE,
        `Updating ${layer} because: ${Object.keys(flags)
          .filter(key => flags[key])
          .join(', ')}`
      )();
    } else {
      log.log(LOG_LEVEL_INFO, `${layer} does not need update`)();
    }
  },
  'layer.matched': (layer, changed) => {
    if (changed) {
      log.log(LOG_LEVEL_INFO, `Matched ${layer}, state transfered`)();
    }
  },
  'layer.finalize': layer => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, `Finalizing ${layer}`)();
  },

  /* CompositeLayer events */

  'compositeLayer.renderLayers': (layer, updated, subLayers) => {
    if (updated) {
      log.log(
        LOG_LEVEL_MINOR_UPDATE,
        `Composite layer rendered new subLayers ${layer}`,
        subLayers
      )();
    } else {
      log.log(LOG_LEVEL_INFO, `Composite layer reused subLayers ${layer}`, subLayers)();
    }
  },

  /* LayerManager events */

  'layerManager.setLayers': (layerManager, updated, layers) => {
    if (updated) {
      log.log(LOG_LEVEL_MINOR_UPDATE, `Updating ${layers.length} deck layers`)();
    }
  },

  'layerManager.activateViewport': (layerManager, viewport) => {
    log.log(LOG_LEVEL_UPDATE_DETAIL, 'Viewport changed', viewport)();
  },

  /* AttributeManager events */

  'attributeManager.invalidate': (attributeManager, trigger, attributeNames) => {
    log.log(
      LOG_LEVEL_MAJOR_UPDATE,
      attributeNames
        ? `invalidated attributes ${attributeNames} (${trigger}) for ${attributeManager.id}`
        : `invalidated all attributes for ${attributeManager.id}`
    )();
  },

  'attributeManager.updateStart': attributeManager => {
    logState.attributeUpdateMessages.length = 0;
    logState.attributeManagerUpdateStart = Date.now();
  },
  'attributeManager.updateEnd': (attributeManager, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attributeManagerUpdateStart);
    log.groupCollapsed(
      LOG_LEVEL_MINOR_UPDATE,
      `Updated attributes for ${numInstances} instances in ${attributeManager.id} in ${timeMs}ms`
    )();
    for (const updateMessage of logState.attributeUpdateMessages) {
      log.log(LOG_LEVEL_UPDATE_DETAIL, updateMessage)();
    }
    log.groupEnd(LOG_LEVEL_MINOR_UPDATE)();
  },

  /* Attribute events */

  'attribute.updateStart': attribute => {
    logState.attributeUpdateStart = Date.now();
  },
  'attribute.allocate': (attribute, numInstances) => {
    const message = `${attribute.id} allocated ${numInstances}`;
    logState.attributeUpdateMessages.push(message);
  },
  'attribute.updateEnd': (attribute, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attributeUpdateStart);
    const message = `${attribute.id} updated ${numInstances} in ${timeMs}ms`;
    logState.attributeUpdateMessages.push(message);
  },

  /* Render events */

  'deckRenderer.renderLayers': (deckRenderer, renderStats, opts) => {
    const {pass, redrawReason, stats} = opts;
    for (const status of renderStats) {
      const {totalCount, visibleCount, compositeCount, pickableCount} = status;
      const primitiveCount = totalCount - compositeCount;
      const hiddenCount = primitiveCount - visibleCount;

      log.log(
        LOG_LEVEL_DRAW,
        `RENDER #${deckRenderer.renderCount} \
  ${visibleCount} (of ${totalCount} layers) to ${pass} because ${redrawReason} \
  (${hiddenCount} hidden, ${compositeCount} composite ${pickableCount} pickable)`
      )();

      if (stats) {
        stats.get('Redraw Layers').add(visibleCount);
      }
    }
  }
});
