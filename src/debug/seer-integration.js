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
export const setOverride = (id, valuePath, value) => {
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
export const getOverrides = props => {
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

// Blacklist some properties that can't be stringified (eg: circular dependencies)
const dataBlackList = ['zoomLevels'];

/**
 * Transform the data passed to Seer for performance purposes.
 * Slice the data array to the first 20 items
 */
const transformData = data => {
  if (!data) {
    return [];
  }

  const out = data.type === 'FeatureCollection' ? data.features : data;
  return out.slice(0, 20).map(item => Object.keys(item).reduce((acc, key) => {
    if (dataBlackList.includes(key)) {
      return acc;
    }
    acc[key] = item[key];
    return acc;
  }, {}));
};

export const initLayer = layer => {
  if (!window.__SEER_INITIALIZED__) {
    return;
  }

  seer.listItem('deck.gl', layer.id, {
    badges: [layer.constructor.layerName],
    links: [`luma.gl:${layer.state.model.id}`],
    parent: layer.parentLayer ? layer.parentLayer.id : undefined
  });
};

const getAttribute = (key, attr) => {
  if (key === 'value') {
    const isArray = Object.prototype.toString.call(attr).slice(8, -1).includes('Array');
    if (isArray) {
      return Array.prototype.slice.call(attr);
    }
  }
  return attr;
};

export const logPayload = layer => {
  const simpleProps = Object.keys(layer.props).reduce((acc, key) => {
    if (typeof layer.props[key] === 'function') {
      return acc;
    }

    acc[key] = key === 'data' ? transformData(layer.props.data) : layer.props[key];
    return acc;
  }, {});

  const data = [
    {path: 'objects.props', data: simpleProps}
  ];

  if (layer.state && layer.state.attributeManager) {
    const attrs = layer.state.attributeManager.getAttributes();

    const mod = Object.keys(attrs).reduce((acc, attrKey) => {

      const attr = attrs[attrKey];
      acc[attrKey] = Object.keys(attr).reduce((out, key) => {
        if (typeof attr[key] !== 'function') {
          out[key] = getAttribute(key, attr[key]);
        }
        return out;
      }, {});

      return acc;
    }, {});

    data.push({path: 'objects.attributes', data: mod});
  }

  return data;
};

/**
 * Log layer's properties to Seer
 */
export const logLayer = layer => {
  if (!window.__SEER_INITIALIZED__ || seer.throttle(`deck.gl:${layer.id}`, 1E3)) {
    return;
  }

  const data = logPayload(layer);
  seer.multiUpdate('deck.gl', layer.id, data);
};
