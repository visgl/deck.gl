import seer from 'seer';
import {window} from '../lib/utils/globals';

/**
 * Recursively set a nested property of an object given a properties array and a value
 */
const recursiveSet = (obj, path, value) => {
  if (!obj) {
    return;
  }

  if (path.length > 1) {
    recursiveSet(obj[path[0]], path.slice(1), value);
  } else {
    obj[path[0]] = value;
  }
};

const overrides = new Map();

/**
 * Create an override on the specify layer, indexed by a valuePath array.
 * Do nothing in case Seer as not been initialized to prevent any preformance drawback.
 */
export const setPropOverrides = (id, valuePath, value) => {
  if (!window.__SEER_INITIALIZED__) {
    return;
  }

  if (!overrides.has(id)) {
    overrides.set(id, new Map());
  }

  const props = overrides.get(id);
  props.set(valuePath, value);
};

/**
 * Get the props overrides of a specific layer if Seer as been initialized
 * Invalidates the data to be sure new ones are always picked up.
 */
export const applyPropOverrides = props => {
  if (!window.__SEER_INITIALIZED__ || !props.id) {
    return;
  }

  const overs = overrides.get(props.id);
  if (!overs) {
    return;
  }

  overs.forEach((value, valuePath) => {
    recursiveSet(props, valuePath, value);
    // Invalidate data array if we have a data override
    if (valuePath[0] === 'data') {
      props.data = [...props.data];
    }
  });
};

/**
 * Listen for deck.gl edit events
 */
export const layerEditListener = cb => {
  if (!window.__SEER_INITIALIZED__) {
    return;
  }

  seer.listenFor('deck.gl', payload => {
    if (payload.type !== 'edit' || payload.valuePath[0] !== 'props') {
      return;
    }

    cb(payload);
  });
};

export const removeLayerInSeer = id => {
  if (!window.__SEER_INITIALIZED__ || !id) {
    return;
  }

  seer.deleteItem('deck.gl', id);
};

export const logPayload = layer => {
  const data = [
    {path: 'objects.props', data: layer.props}
  ];

  const badges = [layer.constructor.layerName];

  if (layer.state) {
    if (layer.state.attributeManager) {
      const attrs = layer.state.attributeManager.getAttributes();
      data.push({path: 'objects.attributes', data: attrs});
      badges.push(layer.state.attributeManager.stats.getTimeString());
    }
    if (layer.state.model) {
      layer.state.model.timerQueryEnabled = true;
      const {lastFrameTime} = layer.state.model.stats;
      if (lastFrameTime) {
        badges.push(`${(lastFrameTime * 1000).toFixed(0)}μs`);
      }
    }
  }

  data.push({path: 'badges', data: badges});

  return data;
};

export const initLayerInSeer = layer => {
  if (!window.__SEER_INITIALIZED__ || !layer) {
    return;
  }

  const badges = [layer.constructor.layerName];

  seer.listItem('deck.gl', layer.id, {
    badges,
    links: layer.state && layer.state.model ? [`luma.gl:${layer.state.model.id}`] : undefined,
    parent: layer.parentLayer ? layer.parentLayer.id : undefined
  });
};

/**
 * Log layer's properties to Seer
 */
export const updateLayerInSeer = layer => {
  if (!window.__SEER_INITIALIZED__ || seer.throttle(`deck.gl:${layer.id}`, 1E3)) {
    return;
  }

  const data = logPayload(layer);
  seer.multiUpdate('deck.gl', layer.id, data);
};
