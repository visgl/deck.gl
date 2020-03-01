// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import log from '../utils/log';
import {isAsyncIterable} from '../utils/iterable-utils';
import {PROP_SYMBOLS} from './constants';
const {ASYNC_ORIGINAL, ASYNC_RESOLVED, ASYNC_DEFAULTS} = PROP_SYMBOLS;

const EMPTY_PROPS = Object.freeze({});

export default class ComponentState {
  constructor(component = null) {
    this.component = component;
    this.asyncProps = {}; // Prop values that the layer sees
    this.onAsyncPropUpdated = () => {};
    this.oldProps = EMPTY_PROPS; // Last props before update
    this.oldAsyncProps = null; // Last props before update, with async values copied.
  }

  getOldProps() {
    return this.oldAsyncProps || this.oldProps;
  }

  resetOldProps() {
    this.oldAsyncProps = null;
    this.oldProps = this.component.props;
  }

  // Whenever async props are changing, we need to make a copy of oldProps
  // otherwise the prop rewriting will affect the value both in props and oldProps.
  // While the copy is relatively expensive, this only happens on load completion.
  freezeAsyncOldProps() {
    if (!this.oldAsyncProps) {
      // Make sure oldProps is set
      this.oldProps = this.oldProps || this.component.props;

      // 1. inherit all synchronous props from oldProps
      // 2. reconfigure the async prop descriptors to fixed values
      this.oldAsyncProps = Object.create(this.oldProps);
      for (const propName in this.asyncProps) {
        Object.defineProperty(this.oldAsyncProps, propName, {
          enumerable: true,
          value: this.oldProps[propName]
        });
      }
    }
  }

  // ASYNC PROP HANDLING
  //

  // Checks if a prop is overridden
  hasAsyncProp(propName) {
    return propName in this.asyncProps;
  }

  // Returns value of an overriden prop
  getAsyncProp(propName) {
    const asyncProp = this.asyncProps[propName];
    return asyncProp && asyncProp.resolvedValue;
  }

  isAsyncPropLoading(propName) {
    if (propName) {
      const asyncProp = this.asyncProps[propName];
      return Boolean(
        asyncProp &&
          asyncProp.pendingLoadCount > 0 &&
          asyncProp.pendingLoadCount !== asyncProp.resolvedLoadCount
      );
    }
    for (const key in this.asyncProps) {
      if (this.isAsyncPropLoading(key)) {
        return true;
      }
    }
    return false;
  }

  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  setAsyncProps(props) {
    // NOTE: prop param and default values are only support for testing
    const resolvedValues = props[ASYNC_RESOLVED] || {};
    const originalValues = props[ASYNC_ORIGINAL] || props;
    const defaultValues = props[ASYNC_DEFAULTS] || {};

    // TODO - use async props from the layer's prop types
    for (const propName in resolvedValues) {
      const value = resolvedValues[propName];
      this._createAsyncPropData(propName, value, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
    }

    for (const propName in originalValues) {
      const value = originalValues[propName];
      // Makes sure a record exists for this prop
      this._createAsyncPropData(propName, value, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
    }
  }

  // Intercept strings (URLs) and Promises and activates loading and prop rewriting
  _updateAsyncProp(propName, value) {
    if (!this._didAsyncInputValueChange(propName, value)) {
      return;
    }

    // interpret value string as url and start a new load tracked by a promise
    if (typeof value === 'string') {
      const fetch = this.layer && this.layer.props.fetch;
      const url = value;
      if (fetch) {
        value = fetch(url, {propName, layer: this.layer});
      }
    }

    // interprets promise and track the "loading"
    if (value instanceof Promise) {
      this._watchPromise(propName, value);
      return;
    }

    if (isAsyncIterable(value)) {
      this._resolveAsyncIterable(propName, value);
      return;
    }

    // else, normal, non-async value. Just store value for now
    this._setPropValue(propName, value);
  }

  // Checks if an input value actually changed (to avoid reloading/rewatching promises/urls)
  _didAsyncInputValueChange(propName, value) {
    const asyncProp = this.asyncProps[propName];
    if (value === asyncProp.lastValue) {
      return false;
    }
    asyncProp.lastValue = value;
    return true;
  }

  // Set normal, non-async value
  _setPropValue(propName, value) {
    const asyncProp = this.asyncProps[propName];
    asyncProp.value = value;
    asyncProp.resolvedValue = value;
    asyncProp.pendingLoadCount++;
    asyncProp.resolvedLoadCount = asyncProp.pendingLoadCount;
  }

  // Set a just resolved async value, calling onAsyncPropUpdates if value changes asynchronously
  _setAsyncPropValue(propName, value, loadCount) {
    // Only update if loadCount is larger or equal to resolvedLoadCount
    // otherwise a more recent load has already completed
    const asyncProp = this.asyncProps[propName];
    if (asyncProp && loadCount >= asyncProp.resolvedLoadCount && value !== undefined) {
      // A chance to copy old props before updating
      this.freezeAsyncOldProps();

      asyncProp.resolvedValue = value;
      asyncProp.resolvedLoadCount = loadCount;

      // Call callback to inform listener
      this.onAsyncPropUpdated(propName, value);
    }
  }

  // Tracks a promise, sets the prop when loaded, handles load count
  _watchPromise(propName, promise) {
    const asyncProp = this.asyncProps[propName];
    asyncProp.pendingLoadCount++;
    const loadCount = asyncProp.pendingLoadCount;
    promise
      .then(data => {
        data = this._postProcessValue(propName, data);
        this._setAsyncPropValue(propName, data, loadCount);

        const onDataLoad = this.layer && this.layer.props.onDataLoad;
        if (propName === 'data' && onDataLoad) {
          onDataLoad(data, {propName, layer: this.layer});
        }
      })
      .catch(error => log.error(error)());
  }

  async _resolveAsyncIterable(propName, iterable) {
    if (propName !== 'data') {
      // we only support data as async iterable
      this._setPropValue(propName, iterable);
    }

    const asyncProp = this.asyncProps[propName];
    asyncProp.pendingLoadCount++;
    const loadCount = asyncProp.pendingLoadCount;
    let data = [];
    let count = 0;

    for await (const chunk of iterable) {
      data = this._postProcessValue(propName, chunk, data);

      // Used by the default _dataDiff function
      Object.defineProperty(data, '__diff', {
        enumerable: false,
        value: [{startRow: count, endRow: data.length}]
      });

      count = data.length;
      this._setAsyncPropValue(propName, data, loadCount);
    }

    const onDataLoad = this.layer && this.layer.props.onDataLoad;
    if (onDataLoad) {
      onDataLoad(data, {propName, layer: this.layer});
    }
  }

  // Give the app a chance to post process the loaded data
  _postProcessValue(propName, value, previousValue) {
    const {dataTransform} = this.component ? this.component.props : {};
    if (propName !== 'data') {
      return value;
    }
    if (dataTransform) {
      return dataTransform(value, previousValue);
    }
    // previousValue is assigned if loaded with async iterator
    return previousValue ? previousValue.concat(value) : value;
  }

  // Creating an asyncProp record if needed
  _createAsyncPropData(propName, value, defaultValue) {
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      // assert(defaultValue !== undefined);
      this.asyncProps[propName] = {
        lastValue: null, // Supplied prop value (can be url/promise, not visible to layer)
        resolvedValue: defaultValue, // Resolved prop value (valid data, can be "shown" to layer)
        pendingLoadCount: 0, // How many loads have been issued
        resolvedLoadCount: 0 // Latest resolved load, (earlier loads will be ignored)
      };
    }
  }
}
