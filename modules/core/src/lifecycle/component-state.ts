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
import {
  COMPONENT_SYMBOL,
  PROP_TYPES_SYMBOL,
  ASYNC_ORIGINAL_SYMBOL,
  ASYNC_RESOLVED_SYMBOL,
  ASYNC_DEFAULTS_SYMBOL
} from './constants';
import type Component from './component';
import {PropType} from './prop-types';

const EMPTY_PROPS = Object.freeze({});

/** Internal state of an async prop */
type AsyncPropState = {
  /** The prop type definition from component.defaultProps, if exists */
  type: PropType | null;
  /** Supplied prop value (can be url/promise, not visible to the component) */
  lastValue: any;
  /** Resolved prop value (valid data, can be "shown" to the component) */
  resolvedValue: any;
  /** How many loads have been issued */
  pendingLoadCount: number;
  /** Latest resolved load, (earlier loads will be ignored) */
  resolvedLoadCount: number;
};

export default class ComponentState<ComponentT extends Component> {
  /** The component that this state instance belongs to. `null` if this state has been finalized. */
  component: ComponentT | null;
  onAsyncPropUpdated: (propName: string, value: any) => void;

  private asyncProps: Partial<Record<string, AsyncPropState>>;
  private oldProps: ComponentT['props'] | null;
  private oldAsyncProps: ComponentT['props'] | null;

  constructor(component: ComponentT) {
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
        asyncProp.type.release(
          asyncProp.resolvedValue,
          asyncProp.type,
          this.component as Component
        );
      }
    }
    this.asyncProps = {};
    this.component = null;
    this.resetOldProps();
  }

  /* Layer-facing props API */

  getOldProps(): ComponentT['props'] | typeof EMPTY_PROPS {
    return this.oldAsyncProps || this.oldProps || EMPTY_PROPS;
  }

  resetOldProps() {
    this.oldAsyncProps = null;
    this.oldProps = this.component ? this.component.props : null;
  }

  // Checks if a prop is overridden
  hasAsyncProp(propName: string): boolean {
    return propName in this.asyncProps;
  }

  // Returns value of an overriden prop
  getAsyncProp(propName: string): any {
    const asyncProp = this.asyncProps[propName];
    return asyncProp && asyncProp.resolvedValue;
  }

  isAsyncPropLoading(propName?: string): boolean {
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
  reloadAsyncProp(propName: string, value: any) {
    this._watchPromise(propName, Promise.resolve(value));
  }

  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  setAsyncProps(props: ComponentT['props']) {
    this.component = (props[COMPONENT_SYMBOL] as ComponentT) || this.component;

    // NOTE: prop param and default values are only support for testing
    const resolvedValues = props[ASYNC_RESOLVED_SYMBOL] || {};
    const originalValues = props[ASYNC_ORIGINAL_SYMBOL] || props;
    const defaultValues = props[ASYNC_DEFAULTS_SYMBOL] || {};

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

  protected _fetch(propName: string, url: string): any {
    return null;
  }

  protected _onResolve(propName: string, value: any) {} // eslint-disable-line @typescript-eslint/no-empty-function

  protected _onError(propName: string, error: Error) {} // eslint-disable-line @typescript-eslint/no-empty-function

  // Intercept strings (URLs) and Promises and activates loading and prop rewriting
  private _updateAsyncProp(propName: string, value: any) {
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
      this._resolveAsyncIterable(propName, value); // eslint-disable-line @typescript-eslint/no-floating-promises
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
  private _didAsyncInputValueChange(propName: string, value: any): boolean {
    // @ts-ignore
    const asyncProp: AsyncPropState = this.asyncProps[propName];
    if (value === asyncProp.resolvedValue || value === asyncProp.lastValue) {
      return false;
    }
    asyncProp.lastValue = value;
    return true;
  }

  // Set normal, non-async value
  private _setPropValue(propName: string, value: any) {
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
  private _setAsyncPropValue(propName: string, value: any, loadCount: number) {
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
  private _watchPromise(propName: string, promise: Promise<any>) {
    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      asyncProp.pendingLoadCount++;
      const loadCount = asyncProp.pendingLoadCount;
      promise
        .then(data => {
          if (!this.component) {
            // This component state has been finalized
            return;
          }
          data = this._postProcessValue(asyncProp, data);
          this._setAsyncPropValue(propName, data, loadCount);
          this._onResolve(propName, data);
        })
        .catch(error => {
          this._onError(propName, error);
        });
    }
  }

  private async _resolveAsyncIterable(
    propName: string,
    iterable: AsyncIterable<any>
  ): Promise<void> {
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
    let data: any[] = [];
    let count = 0;

    for await (const chunk of iterable) {
      if (!this.component) {
        // This component state has been finalized
        return;
      }

      // @ts-expect-error (2339) dataTransform is not decared in base component props
      const {dataTransform} = this.component.props;
      if (dataTransform) {
        data = dataTransform(chunk, data) as any[];
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
  private _postProcessValue(asyncProp: AsyncPropState, value: any) {
    const propType = asyncProp.type;
    if (propType && this.component) {
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
  private _createAsyncPropData(propName: string, defaultValue: any) {
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      const propTypes = this.component && this.component.props[PROP_TYPES_SYMBOL];
      // assert(defaultValue !== undefined);
      this.asyncProps[propName] = {
        type: propTypes && propTypes[propName],
        lastValue: null,
        resolvedValue: defaultValue,
        pendingLoadCount: 0,
        resolvedLoadCount: 0
      };
    }
  }
}
