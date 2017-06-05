import seer from 'seer';
import {window} from '../lib/utils/globals';

/**
 * Recursively set a nested property of an object given a properties array and a value
 */
const recursiveSet = (obj, path, value) => {
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
    if (payload.type !== 'edit') {
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

/**
 * Log layer's properties to Seer
 */
export const logLayer = layer => {
  if (!window.__SEER_INITIALIZED__) {
    return;
  }

  const simpleProps = Object.keys(layer.props).reduce((acc, key) => {
    if (typeof layer.props[key] === 'function') {
      return acc;
    }

    acc[key] = key === 'data' ? transformData(layer.props.data) : layer.props[key];
    return acc;
  }, {});

  seer.indexedListItem('deck.gl', layer.id, simpleProps);

};
