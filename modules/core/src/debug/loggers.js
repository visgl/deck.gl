const logState = {
  amMessages: []
};

const PRIORITY_MAJOR_UPDATE = 1; // Events with direct perf impact
const PRIORITY_MINOR_UPDATE = 2; // Events that may affect perf
const PRIORITY_UPDATE_DETAIL = 3;
const PRIORITY_INFO = 4;
const PRIORITY_DRAW = 2;

export const getLoggers = log => ({
  /* Layer events */

  'layer.changeFlag': (layer, key, flags) => {
    let value = flags[key];
    if (key === 'updateTriggersChanged') {
      value = Object.keys(value).join(', ');
    }
    log.log(PRIORITY_UPDATE_DETAIL, `${key}: ${value} in ${layer.id}`)();
  },

  'layer.initialize': layer => {
    log.log(PRIORITY_MAJOR_UPDATE, `Initializing ${layer}`)();
  },
  'layer.update': (layer, needsUpdate) => {
    if (needsUpdate) {
      log.log(PRIORITY_MINOR_UPDATE, `Updating ${layer} because: ${layer.printChangeFlags()}`)();
    } else {
      log.log(PRIORITY_INFO, `${layer} does not need update`)();
    }
  },
  'layer.matched': (layer, changed) => {
    if (changed) {
      log.log(PRIORITY_INFO, `Matched ${layer}, state transfered`)();
    }
  },
  'layer.finalize': layer => {
    log.log(PRIORITY_MAJOR_UPDATE, `Finalizing ${layer}`)();
  },

  /* CompositeLayer events */

  'compositeLayer.renderLayers': (layer, updated, subLayers) => {
    if (updated) {
      log.log(
        PRIORITY_MINOR_UPDATE,
        `Composite layer rendered new subLayers ${layer}`,
        subLayers
      )();
    } else {
      log.log(PRIORITY_INFO, `Composite layer reused subLayers ${layer}`, subLayers)();
    }
  },

  /* LayerManager events */

  'layerManager.setLayers': (layerManager, updated, layers) => {
    if (updated) {
      log.log(PRIORITY_MINOR_UPDATE, `Updating ${layers.length} deck layers`)();
    }
  },

  'layerManager.activateViewport': (layerManager, viewport) => {
    log.log(PRIORITY_UPDATE_DETAIL, 'Viewport changed', viewport)();
  },

  /* AttributeManager events */

  'attributeManager.invalidate': (attributeManager, trigger, attributeNames) => {
    log.log(
      PRIORITY_MAJOR_UPDATE,
      attributeNames
        ? `invalidated attributes ${attributeNames} (${trigger}) for ${attributeManager.id}`
        : `invalidated all attributes for ${attributeManager.id}`
    )();
  },

  'attributeManager.updateStart': attributeManager => {
    logState.amMessages.length = 0;
    logState.amUpdateStart = Date.now();
  },
  'attributeManager.updateEnd': (attributeManager, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.amUpdateStart);
    log.groupCollapsed(
      PRIORITY_MINOR_UPDATE,
      `Updated attributes for ${numInstances} instances in ${attributeManager.id} in ${timeMs}ms`
    )();
    for (const updateMessage of logState.amMessages) {
      log.log(PRIORITY_UPDATE_DETAIL, updateMessage)();
    }
    log.groupEnd(PRIORITY_MINOR_UPDATE)();
  },

  /* Attribute events */

  'attribute.updateStart': attribute => {
    logState.attrUpdateStart = Date.now();
  },
  'attribute.allocate': (attribute, numInstances) => {
    const message = `${attribute.id} allocated ${numInstances}`;
    logState.amMessages.push(message);
  },
  'attribute.updateEnd': (attribute, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attrUpdateStart);
    const message = `${attribute.id} updated ${numInstances} in ${timeMs}ms`;
    logState.amMessages.push(message);
  },

  /* Render events */

  'deckRenderer.renderLayers': (deckRenderer, renderStats, opts) => {
    const {pass, redrawReason, stats} = opts;
    for (const status of renderStats) {
      const {totalCount, visibleCount, compositeCount, pickableCount} = status;
      const primitiveCount = totalCount - compositeCount;
      const hiddenCount = primitiveCount - visibleCount;

      log.log(
        PRIORITY_DRAW,
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
