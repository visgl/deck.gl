import Stats from './stats';
import assert from 'assert';

export default class LayerState {
  constructor({attributeManager}) {
    assert(attributeManager);
    this.attributeManager = attributeManager;
    this.model = null;
    this.needsRedraw = true;
    this.subLayers = null; // reference to sublayers rendered in a previous cycle
    this.stats = new Stats({id: 'draw'});
    // this.initializePropOverrides();
    // this.animatedProps = null, // Computing animated props requires layer manager state
  }

  initializePropOverrides() {
    this.setAsyncProp({propName: 'data', value: null});
  }

  getAsyncProp(propName) {
    return this.asyncProps[propName].value;
  }

  setAsyncProp({propName, value, layer, fetch, dataTransform}) {
    assert(propName && layer);
    this.asyncProps[propName] = this.asyncProps[propName] || {
      lastValue: null, // Original value is stored here
      loadValue: null, // Auto loaded data is stored here
      loadPromise: null, // Auto load promise
      loadCount: 0
    };

    const asyncProp = this.asyncProps[propName];
    if (value === asyncProp.lastValue) {
      return false;
    }
    asyncProp.lastValue = value;

    // Intercept strings and promises
    const type = value instanceof Promise ? 'Promise' : typeof value;
    switch (type) {
    case 'string':
      // interpret value string as url and start a new load
      const url = value;
      this._loadAsyncProp({url, asyncProp, fetch, dataTransform});
      break;

    case 'Promise':
      // TODO - implement support for promise arguments
    default: // eslint-disable-line
      // An actual value was set
      asyncProp.loadValue = value;
    }
    return false;
  }

  _loadAsyncProp({url, asyncProp, fetch, dataTransform}) {
    // Set data to ensure props.data does not return a string
    // Note: Code in LayerProps class depends on this
    asyncProp.data = asyncProp.data || [];

    // Closure will track counter to make sure we only update on last load
    const count = ++asyncProp.loadCount;

    // Load the data
    asyncProp.loadPromise = fetch(url)
    .then(data => dataTransform(data))
    .then(data => {
      if (count === asyncProp.loadCount) {
        asyncProp.loadValue = data;
        asyncProp.loadPromise = null;
        asyncProp.
        layer.setChangeFlags({dataChanged: true});
      }
    });
  }
}

