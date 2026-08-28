// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { isAsyncIterable } from "../utils/iterable-utils.js";
import { COMPONENT_SYMBOL, PROP_TYPES_SYMBOL, ASYNC_ORIGINAL_SYMBOL, ASYNC_RESOLVED_SYMBOL, ASYNC_DEFAULTS_SYMBOL } from "./constants.js";
const EMPTY_PROPS = Object.freeze({});
export default class ComponentState {
    constructor(component) {
        this.component = component;
        this.asyncProps = {}; // Prop values that the layer sees
        this.onAsyncPropUpdated = () => { };
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
        this.asyncProps = {};
        this.component = null;
        this.resetOldProps();
    }
    /* Layer-facing props API */
    getOldProps() {
        return this.oldAsyncProps || this.oldProps || EMPTY_PROPS;
    }
    resetOldProps() {
        this.oldAsyncProps = null;
        this.oldProps = this.component ? this.component.props : null;
    }
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
            return Boolean(asyncProp &&
                asyncProp.pendingLoadCount > 0 &&
                asyncProp.pendingLoadCount !== asyncProp.resolvedLoadCount);
        }
        for (const key in this.asyncProps) {
            if (this.isAsyncPropLoading(key)) {
                return true;
            }
        }
        return false;
    }
    // Without changing the original prop value, swap out the data resolution under the hood
    reloadAsyncProp(propName, value) {
        this._watchPromise(propName, Promise.resolve(value));
    }
    // Updates all async/overridden props (when new props come in)
    // Checks if urls have changed, starts loading, or removes override
    setAsyncProps(props) {
        this.component = props[COMPONENT_SYMBOL] || this.component;
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
    _fetch(propName, url) {
        return null;
    }
    _onResolve(propName, value) { } // eslint-disable-line @typescript-eslint/no-empty-function
    _onError(propName, error) { } // eslint-disable-line @typescript-eslint/no-empty-function
    // Intercept strings (URLs) and Promises and activates loading and prop rewriting
    _updateAsyncProp(propName, value) {
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
    _freezeAsyncOldProps() {
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
    _didAsyncInputValueChange(propName, value) {
        // @ts-ignore
        const asyncProp = this.asyncProps[propName];
        if (value === asyncProp.resolvedValue || value === asyncProp.lastValue) {
            return false;
        }
        asyncProp.lastValue = value;
        return true;
    }
    // Set normal, non-async value
    _setPropValue(propName, value) {
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
    _setAsyncPropValue(propName, value, loadCount) {
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
    _watchPromise(propName, promise) {
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
    async _resolveAsyncIterable(propName, iterable) {
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
            if (!this.component) {
                // This component state has been finalized
                return;
            }
            // @ts-expect-error (2339) dataTransform is not decared in base component props
            const { dataTransform } = this.component.props;
            if (dataTransform) {
                data = dataTransform(chunk, data);
            }
            else {
                data = data.concat(chunk);
            }
            // Used by the default _dataDiff function
            Object.defineProperty(data, '__diff', {
                enumerable: false,
                value: [{ startRow: count, endRow: data.length }]
            });
            count = data.length;
            this._setAsyncPropValue(propName, data, loadCount);
        }
        this._onResolve(propName, data);
    }
    // Give the app a chance to post process the loaded data
    _postProcessValue(asyncProp, value) {
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
    _createAsyncPropData(propName, defaultValue) {
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
//# sourceMappingURL=component-state.js.map