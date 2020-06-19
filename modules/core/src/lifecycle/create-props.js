import log from '../utils/log';
import {isAsyncIterable} from '../utils/iterable-utils';
import {parsePropTypes} from './prop-types';
import {PROP_SYMBOLS} from './constants';

const {COMPONENT, ASYNC_ORIGINAL, ASYNC_RESOLVED, ASYNC_DEFAULTS} = PROP_SYMBOLS;

// Create a property object
export function createProps() {
  const component = this; // eslint-disable-line

  // Get default prop object (a prototype chain for now)
  const propsPrototype = getPropsPrototype(component.constructor);

  // Create a new prop object with default props object in prototype chain
  const propsInstance = Object.create(propsPrototype);

  // Props need a back pointer to the owning component
  propsInstance[COMPONENT] = component;
  // The supplied (original) values for those async props that are set to url strings or Promises.
  // In this case, the actual (i.e. resolved) values are looked up from component.internalState
  propsInstance[ASYNC_ORIGINAL] = {};
  // Note: the actual (resolved) values for props that are NOT set to urls or Promises.
  // in this case the values are served directly from this map
  propsInstance[ASYNC_RESOLVED] = {};

  // "Copy" all sync props
  for (let i = 0; i < arguments.length; ++i) {
    const props = arguments[i];
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

// Return precalculated defaultProps and propType objects if available
// build them if needed
function getPropsPrototype(componentClass) {
  const defaultProps = getOwnProperty(componentClass, '_mergedDefaultProps');
  if (!defaultProps) {
    createPropsPrototypeAndTypes(componentClass);
    return componentClass._mergedDefaultProps;
  }
  return defaultProps;
}

// Build defaultProps and propType objects by walking component prototype chain
function createPropsPrototypeAndTypes(componentClass) {
  const parent = componentClass.prototype;
  if (!parent) {
    return;
  }

  const parentClass = Object.getPrototypeOf(componentClass);
  const parentDefaultProps = getPropsPrototype(parentClass);

  // Parse propTypes from Component.defaultProps
  const componentDefaultProps = getOwnProperty(componentClass, 'defaultProps') || {};
  const componentPropDefs = parsePropTypes(componentDefaultProps);

  // Create any necessary property descriptors and create the default prop object
  // Assign merged default props
  const defaultProps = createPropsPrototype(
    componentPropDefs.defaultProps,
    parentDefaultProps,
    componentClass
  );

  // Create a merged type object
  const propTypes = Object.assign({}, parentClass._propTypes, componentPropDefs.propTypes);
  // Add getters/setters for async props
  addAsyncPropsToPropPrototype(defaultProps, propTypes);

  // Create a map for prop whose default value is a callback
  const deprecatedProps = Object.assign(
    {},
    parentClass._deprecatedProps,
    componentPropDefs.deprecatedProps
  );
  // Add setters for deprecated props
  addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps);

  // Store the precalculated props
  componentClass._mergedDefaultProps = defaultProps;
  componentClass._propTypes = propTypes;
  componentClass._deprecatedProps = deprecatedProps;
}

// Builds a pre-merged default props object that component props can inherit from
function createPropsPrototype(props, parentProps, componentClass) {
  const defaultProps = Object.create(null);

  Object.assign(defaultProps, parentProps, props);

  // Avoid freezing `id` prop
  const id = getComponentName(componentClass);
  delete props.id;

  Object.defineProperties(defaultProps, {
    // `id` is treated specially because layer might need to override it
    id: {
      writable: true,
      value: id
    }
  });

  return defaultProps;
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
    const {name, value} = propType;

    // Note: async is ES7 keyword, can't destructure
    if (propType.async) {
      defaultValues[name] = value;
      descriptors[name] = getDescriptorForAsyncProp(name, value);
    }
  }

  // Default "resolved" values for async props, returned if value not yet resolved/set.
  defaultProps[ASYNC_DEFAULTS] = defaultValues;
  // Shadowed object, just to make sure "early indexing" into the instance does not fail
  defaultProps[ASYNC_ORIGINAL] = {};

  Object.defineProperties(defaultProps, descriptors);
}

// Helper: Configures getter and setter for one async prop
function getDescriptorForAsyncProp(name) {
  return {
    enumerable: true,
    // Save the provided value for async props in a special map
    set(newValue) {
      if (
        typeof newValue === 'string' ||
        newValue instanceof Promise ||
        isAsyncIterable(newValue)
      ) {
        this[ASYNC_ORIGINAL][name] = newValue;
      } else {
        this[ASYNC_RESOLVED][name] = newValue;
      }
    },
    // Only the component's state knows the true value of async prop
    get() {
      if (this[ASYNC_RESOLVED]) {
        // Prop value isn't async, so just return it
        if (name in this[ASYNC_RESOLVED]) {
          const value = this[ASYNC_RESOLVED][name];

          return value || this[ASYNC_DEFAULTS][name];
        }

        if (name in this[ASYNC_ORIGINAL]) {
          // It's an async prop value: look into component state
          const state = this[COMPONENT] && this[COMPONENT].internalState;
          if (state && state.hasAsyncProp(name)) {
            return state.getAsyncProp(name) || this[ASYNC_DEFAULTS][name];
          }
        }
      }

      // the prop is not supplied, or
      // component not yet initialized/matched, return the component's default value for the prop
      return this[ASYNC_DEFAULTS][name];
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
  const componentName =
    getOwnProperty(componentClass, 'layerName') || getOwnProperty(componentClass, 'componentName');
  if (!componentName) {
    log.once(0, `${componentClass.name}.componentName not specified`)();
  }
  return componentName || componentClass.name;
}
