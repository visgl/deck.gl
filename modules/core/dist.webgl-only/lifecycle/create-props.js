// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import log from "../utils/log.js";
import { isAsyncIterable } from "../utils/iterable-utils.js";
import { parsePropTypes } from "./prop-types.js";
import { COMPONENT_SYMBOL, PROP_TYPES_SYMBOL, DEPRECATED_PROPS_SYMBOL, ASYNC_ORIGINAL_SYMBOL, ASYNC_RESOLVED_SYMBOL, ASYNC_DEFAULTS_SYMBOL } from "./constants.js";
import Component from "./component.js";
// Create a property object
export function createProps(component, propObjects) {
    // Resolve extension value
    let extensions;
    for (let i = propObjects.length - 1; i >= 0; i--) {
        const props = propObjects[i];
        if ('extensions' in props) {
            // @ts-expect-error TS(2339) extensions not defined
            extensions = props.extensions;
        }
    }
    // Create a new prop object with empty default props object
    const propsPrototype = getPropsPrototype(component.constructor, extensions);
    // The true default props object will be found later
    const propsInstance = Object.create(propsPrototype);
    // Props need a back pointer to the owning component
    propsInstance[COMPONENT_SYMBOL] = component;
    // The supplied (original) values for those async props that are set to url strings or Promises.
    // In this case, the actual (i.e. resolved) values are looked up from component.internalState
    propsInstance[ASYNC_ORIGINAL_SYMBOL] = {};
    // Note: the actual (resolved) values for props that are NOT set to urls or Promises.
    // in this case the values are served directly from this map
    propsInstance[ASYNC_RESOLVED_SYMBOL] = {};
    // "Copy" all sync props
    for (let i = 0; i < propObjects.length; ++i) {
        const props = propObjects[i];
        // Do not use Object.assign here to avoid Symbols in props overwriting our private fields
        // This might happen if one of the arguments is another props instance
        for (const key in props) {
            propsInstance[key] = props[key];
        }
    }
    // Props must be immutable
    Object.freeze(propsInstance);
    return propsInstance;
}
const MergedDefaultPropsCacheKey = '_mergedDefaultProps';
// Return precalculated defaultProps and propType objects if available
// build them if needed
function getPropsPrototype(componentClass, extensions) {
    // Bail out if we're not looking at a component - for two reasons:
    // 1. There's no reason for an ancestor of component to have props
    // 2. If we don't bail out, we'll follow the prototype chain all the way back to the global
    // function prototype and add _mergedDefaultProps to it, which may break other frameworks
    // (e.g. the react-three-fiber reconciler)
    if (!(componentClass instanceof Component.constructor))
        return {};
    // A string that uniquely identifies the extensions involved
    let cacheKey = MergedDefaultPropsCacheKey;
    if (extensions) {
        for (const extension of extensions) {
            const ExtensionClass = extension.constructor;
            if (ExtensionClass) {
                cacheKey += `:${ExtensionClass.extensionName || ExtensionClass.name}`;
            }
        }
    }
    const defaultProps = getOwnProperty(componentClass, cacheKey);
    if (!defaultProps) {
        return (componentClass[cacheKey] = createPropsPrototypeAndTypes(componentClass, extensions || []));
    }
    return defaultProps;
}
// Build defaultProps and propType objects by walking component prototype chain
function createPropsPrototypeAndTypes(componentClass, extensions) {
    const parent = componentClass.prototype;
    if (!parent) {
        return null;
    }
    const parentClass = Object.getPrototypeOf(componentClass);
    const parentDefaultProps = getPropsPrototype(parentClass);
    // Parse propTypes from Component.defaultProps
    const componentDefaultProps = getOwnProperty(componentClass, 'defaultProps') || {};
    const componentPropDefs = parsePropTypes(componentDefaultProps);
    // Merged default props object. Order: parent, self, extensions
    const defaultProps = Object.assign(Object.create(null), parentDefaultProps, componentPropDefs.defaultProps);
    // Merged prop type definitions. Order: parent, self, extensions
    const propTypes = Object.assign(Object.create(null), parentDefaultProps?.[PROP_TYPES_SYMBOL], componentPropDefs.propTypes);
    // Merged deprecation list. Order: parent, self, extensions
    const deprecatedProps = Object.assign(Object.create(null), parentDefaultProps?.[DEPRECATED_PROPS_SYMBOL], componentPropDefs.deprecatedProps);
    for (const extension of extensions) {
        const extensionDefaultProps = getPropsPrototype(extension.constructor);
        if (extensionDefaultProps) {
            Object.assign(defaultProps, extensionDefaultProps);
            Object.assign(propTypes, extensionDefaultProps[PROP_TYPES_SYMBOL]);
            Object.assign(deprecatedProps, extensionDefaultProps[DEPRECATED_PROPS_SYMBOL]);
        }
    }
    // Create any necessary property descriptors and create the default prop object
    // Assign merged default props
    createPropsPrototype(defaultProps, componentClass);
    // Add getters/setters for async props
    addAsyncPropsToPropPrototype(defaultProps, propTypes);
    // Add setters for deprecated props
    addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps);
    // Store the precalculated props
    defaultProps[PROP_TYPES_SYMBOL] = propTypes;
    defaultProps[DEPRECATED_PROPS_SYMBOL] = deprecatedProps;
    // Backwards compatibility
    // TODO: remove access of hidden property from the rest of the code base
    if (extensions.length === 0 && !hasOwnProperty(componentClass, '_propTypes')) {
        componentClass._propTypes = propTypes;
    }
    return defaultProps;
}
// Builds a pre-merged default props object that component props can inherit from
function createPropsPrototype(defaultProps, componentClass) {
    // Avoid freezing `id` prop
    const id = getComponentName(componentClass);
    Object.defineProperties(defaultProps, {
        // `id` is treated specially because layer might need to override it
        id: {
            writable: true,
            value: id
        }
    });
}
function addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps) {
    for (const propName in deprecatedProps) {
        /* eslint-disable accessor-pairs */
        Object.defineProperty(defaultProps, propName, {
            enumerable: false,
            set(newValue) {
                const nameStr = `${this.id}: ${propName}`;
                for (const newPropName of deprecatedProps[propName]) {
                    if (!hasOwnProperty(this, newPropName)) {
                        this[newPropName] = newValue;
                    }
                }
                log.deprecated(nameStr, deprecatedProps[propName].join('/'))();
            }
        });
        /* eslint-enable accessor-pairs */
    }
}
// Create descriptors for overridable props
function addAsyncPropsToPropPrototype(defaultProps, propTypes) {
    const defaultValues = {};
    const descriptors = {};
    // Move async props into shadow values
    for (const propName in propTypes) {
        const propType = propTypes[propName];
        const { name, value } = propType;
        // Note: async is ES7 keyword, can't destructure
        if (propType.async) {
            defaultValues[name] = value;
            descriptors[name] = getDescriptorForAsyncProp(name);
        }
    }
    // Default "resolved" values for async props, returned if value not yet resolved/set.
    defaultProps[ASYNC_DEFAULTS_SYMBOL] = defaultValues;
    // Shadowed object, just to make sure "early indexing" into the instance does not fail
    defaultProps[ASYNC_ORIGINAL_SYMBOL] = {};
    Object.defineProperties(defaultProps, descriptors);
}
// Helper: Configures getter and setter for one async prop
function getDescriptorForAsyncProp(name) {
    return {
        enumerable: true,
        // Save the provided value for async props in a special map
        set(newValue) {
            if (typeof newValue === 'string' ||
                newValue instanceof Promise ||
                isAsyncIterable(newValue)) {
                this[ASYNC_ORIGINAL_SYMBOL][name] = newValue;
            }
            else {
                this[ASYNC_RESOLVED_SYMBOL][name] = newValue;
            }
        },
        // Only the component's state knows the true value of async prop
        get() {
            if (this[ASYNC_RESOLVED_SYMBOL]) {
                // Prop value isn't async, so just return it
                if (name in this[ASYNC_RESOLVED_SYMBOL]) {
                    const value = this[ASYNC_RESOLVED_SYMBOL][name];
                    return value || this[ASYNC_DEFAULTS_SYMBOL][name];
                }
                if (name in this[ASYNC_ORIGINAL_SYMBOL]) {
                    // It's an async prop value: look into component state
                    const state = this[COMPONENT_SYMBOL] && this[COMPONENT_SYMBOL].internalState;
                    if (state && state.hasAsyncProp(name)) {
                        return state.getAsyncProp(name) || this[ASYNC_DEFAULTS_SYMBOL][name];
                    }
                }
            }
            // the prop is not supplied, or
            // component not yet initialized/matched, return the component's default value for the prop
            return this[ASYNC_DEFAULTS_SYMBOL][name];
        }
    };
}
// HELPER METHODS
function hasOwnProperty(object, prop) {
    return Object.prototype.hasOwnProperty.call(object, prop);
}
// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
    return hasOwnProperty(object, prop) && object[prop];
}
function getComponentName(componentClass) {
    const componentName = componentClass.componentName;
    if (!componentName) {
        log.warn(`${componentClass.name}.componentName not specified`)();
    }
    return componentName || componentClass.name;
}
//# sourceMappingURL=create-props.js.map