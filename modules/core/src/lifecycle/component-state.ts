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

import {isAsyncIterable} from '../utils/iterable-utils';
import {ASYNC_ORIGINAL, ASYNC_RESOLVED, ASYNC_DEFAULTS} from './constants';
import type Component from './component';
import {ComponentProps, StatefulComponentProps} from './component';
import {PropType} from './prop-types';

const EMPTY_PROPS = Object.freeze({});

type AsyncPropState = {
  type: PropType;
  lastValue: any;
  resolvedValue: any;
  pendingLoadCount: number;
  resolvedLoadCount: number;
};

export default class ComponentState<T extends ComponentProps> {
  component: Component<T>;
  onAsyncPropUpdated: (propName: keyof T, value: any) => void;

  private asyncProps: Partial<Record<keyof T, AsyncPropState>>;
  private oldProps: StatefulComponentProps<T> | null;
  private oldAsyncProps: StatefulComponentProps<T> | null;

  constructor(component: Component<T>) {
    this.component = component;
    this.asyncProps = {}; // Prop values that the layer sees
    this.onAsyncPropUpdated = () => {};
    this.oldProps = null; // Last props before update
    this.oldAsyncProps = null; // Last props before update, with async values copied.
  }

  finalize() {
    for (const propName in this.asyncProps) {
      const asyncProp = this.asyncProps[propName];
      if (asyncProp && asyncProp.type && asyncProp.type.release) {
        // Release any resources created by transforms
        asyncProp.type.release(asyncProp.resolvedValue, asyncProp.type, this.component);
      }
    }
  }

  /* Layer-facing props API */

  getOldProps(): StatefulComponentProps<T> | typeof EMPTY_PROPS {
    return this.oldAsyncProps || this.oldProps || EMPTY_PROPS;
  }

  resetOldProps() {
    this.oldAsyncProps = null;
    this.oldProps = this.component.props;
  }

  // Checks if a prop is overridden
  hasAsyncProp(propName: keyof T): boolean {
    return propName in this.asyncProps;
  }

  // Returns value of an overriden prop
  getAsyncProp(propName: keyof T): any {
    const asyncProp = this.asyncProps[propName];
    return asyncProp && asyncProp.resolvedValue;
  }

  isAsyncPropLoading(propName: keyof T): boolean {
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

  // Without changing the original prop value, swap out the data resolution under the hood
  reloadAsyncProp(propName: keyof T, value: any) {
    this._watchPromise(propName, Promise.resolve(value));
  }

  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  setAsyncProps(props: StatefulComponentProps<T>) {
    // NOTE: prop param and default values are only support for testing
    const resolvedValues = props[ASYNC_RESOLVED] || {};
    const originalValues = props[ASYNC_ORIGINAL] || props;
    const defaultValues = props[ASYNC_DEFAULTS] || {};

    // TODO - use async props from the layer's prop types
    for (const propName in resolvedValues) {
      const value = resolvedValues[propName];
      this._createAsyncPropData(propName, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
      // Use transformed value
      resolvedValues[propName] = this.getAsyncProp(propName);
    }

    for (const propName in originalValues) {
      const value = originalValues[propName];
      // Makes sure a record exists for this prop
      this._createAsyncPropData(propName, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
    }
  }

  /* Placeholder methods for subclassing */

  protected _fetch(propName: keyof T, url: string): any {
    return url;
  }

  protected _onResolve(propName: keyof T, value: any) {}

  protected _onError(propName: keyof T, error: Error) {}

  // Intercept strings (URLs) and Promises and activates loading and prop rewriting
  private _updateAsyncProp(propName: keyof T, value: any) {
    if (!this._didAsyncInputValueChange(propName, value)) {
      return;
    }

    // interpret value string as url and start a new load tracked by a promise
    if (typeof value === 'string') {
      value = this._fetch(propName, value);
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

  // Whenever async props are changing, we need to make a copy of oldProps
  // otherwise the prop rewriting will affect the value both in props and oldProps.
  // While the copy is relatively expensive, this only happens on load completion.
  private _freezeAsyncOldProps() {
    if (!this.oldAsyncProps && this.oldProps) {
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

  // Checks if an input value actually changed (to avoid reloading/rewatching promises/urls)
  private _didAsyncInputValueChange(propName: keyof T, value: any): boolean {
    // @ts-ignore
    const asyncProp: AsyncPropState = this.asyncProps[propName];
    if (value === asyncProp.resolvedValue || value === asyncProp.lastValue) {
      return false;
    }
    asyncProp.lastValue = value;
    return true;
  }

  // Set normal, non-async value
  private _setPropValue(propName: keyof T, value: any) {
    // Save the current value before overwriting so that diffProps can access both
    this._freezeAsyncOldProps();

    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      value = this._postProcessValue(asyncProp, value);
      asyncProp.resolvedValue = value;
      asyncProp.pendingLoadCount++;
      asyncProp.resolvedLoadCount = asyncProp.pendingLoadCount;
    }
  }

  // Set a just resolved async value, calling onAsyncPropUpdates if value changes asynchronously
  private _setAsyncPropValue(propName: keyof T, value: any, loadCount: number) {
    // Only update if loadCount is larger or equal to resolvedLoadCount
    // otherwise a more recent load has already completed
    const asyncProp = this.asyncProps[propName];
    if (asyncProp && loadCount >= asyncProp.resolvedLoadCount && value !== undefined) {
      // Save the current value before overwriting so that diffProps can access both
      this._freezeAsyncOldProps();

      asyncProp.resolvedValue = value;
      asyncProp.resolvedLoadCount = loadCount;

      // Call callback to inform listener
      this.onAsyncPropUpdated(propName, value);
    }
  }

  // Tracks a promise, sets the prop when loaded, handles load count
  private _watchPromise(propName: keyof T, promise: Promise<any>) {
    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      asyncProp.pendingLoadCount++;
      const loadCount = asyncProp.pendingLoadCount;
      promise
        .then(data => {
          data = this._postProcessValue(asyncProp, data);
          this._setAsyncPropValue(propName, data, loadCount);
          this._onResolve(propName, data);
        })
        .catch(error => {
          this._onError(propName, error);
        });
    }
  }

  private async _resolveAsyncIterable(propName: keyof T, iterable: AsyncIterable<any>) {
    if (propName !== 'data') {
      // we only support data as async iterable
      this._setPropValue(propName, iterable);
      return;
    }

    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      return;
    }

    asyncProp.pendingLoadCount++;
    const loadCount = asyncProp.pendingLoadCount;
    let data = [];
    let count = 0;

    for await (const chunk of iterable) {
      // @ts-expect-error
      const {dataTransform} = this.component.props;
      if (dataTransform) {
        data = dataTransform(chunk, data);
      } else {
        data = data.concat(chunk);
      }

      // Used by the default _dataDiff function
      Object.defineProperty(data, '__diff', {
        enumerable: false,
        value: [{startRow: count, endRow: data.length}]
      });

      count = data.length;
      this._setAsyncPropValue(propName, data, loadCount);
    }

    this._onResolve(propName, data);
  }

  // Give the app a chance to post process the loaded data
  private _postProcessValue(asyncProp, value: any) {
    const propType = asyncProp.type;
    if (propType) {
      if (propType.release) {
        propType.release(asyncProp.resolvedValue, propType, this.component);
      }
      if (propType.transform) {
        return propType.transform(value, propType, this.component);
      }
    }
    return value;
  }

  // Creating an asyncProp record if needed
  private _createAsyncPropData(propName, defaultValue) {
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      // @ts-expect-error
      const propTypes = this.component && this.component.constructor._propTypes;
      // assert(defaultValue !== undefined);
      this.asyncProps[propName] = {
        type: propTypes && propTypes[propName],
        lastValue: null, // Supplied prop value (can be url/promise, not visible to layer)
        resolvedValue: defaultValue, // Resolved prop value (valid data, can be "shown" to layer)
        pendingLoadCount: 0, // How many loads have been issued
        resolvedLoadCount: 0 // Latest resolved load, (earlier loads will be ignored)
      };
    }
  }
}
