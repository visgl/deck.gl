import {applyPropOverrides} from '../lib/seer-integration';
import log from '../utils/log';
import {parsePropTypes} from './prop-types';

export const EMPTY_ARRAY = Object.freeze([]);

// Create a property object
export function createProps() {
  const component = this; // eslint-disable-line

  // Get default prop object (a prototype chain for now)
  const {defaultProps} = getPropsPrototypeAndTypes(component.constructor);

  // Create a new prop object with  default props object in prototype chain
  const newProps = Object.create(defaultProps, {
    _component: {
      enumerable: false,
      value: component
    },
    _asyncProps: {
      enumerable: false,
      value: {}
    }
  });

  // "Copy" all sync props
  for (let i = 0; i < arguments.length; ++i) {
    Object.assign(newProps, arguments[i]);
  }
  newProps.data = newProps.data || EMPTY_ARRAY;

  // SEER: Apply any overrides from the seer debug extension if it is active
  applyPropOverrides(newProps);

  // Props must be immutable
  Object.freeze(newProps);

  return newProps;
}

// Return precalculated defaultProps and propType objects if available
// build them if needed
function getPropsPrototypeAndTypes(componentClass) {
  const props = getOwnProperty(componentClass, '_mergedDefaultProps');
  if (props) {
    return {
      defaultProps: props,
      propTypes: getOwnProperty(componentClass, '_propTypes')
    };
  }

  return createPropsPrototypeAndPropTypes(componentClass);
}

// Build defaultProps and propType objects by walking component prototype chain
function createPropsPrototypeAndPropTypes(componentClass) {
  const parent = componentClass.prototype;
  if (!parent) {
    return {
      defaultProps: {}
    };
  }

  const parentClass = Object.getPrototypeOf(componentClass);
  const parentPropDefs = (parent && getPropsPrototypeAndTypes(parentClass)) || null;

  // Parse propTypes from Component.defaultProps
  const componentDefaultProps = getOwnProperty(componentClass, 'defaultProps') || {};
  const componentPropDefs = parsePropTypes(componentDefaultProps);

  // Create a merged type object
  const propTypes = Object.assign(
    {},
    parentPropDefs && parentPropDefs.propTypes,
    componentPropDefs.propTypes
  );

  // Create any necessary property descriptors and create the default prop object
  // Assign merged default props
  const defaultProps = createPropsPrototype(
    componentPropDefs.defaultProps,
    parentPropDefs && parentPropDefs.defaultProps,
    propTypes,
    componentClass
  );

  // Store the precalculated props
  componentClass._mergedDefaultProps = defaultProps;
  componentClass._propTypes = propTypes;

  return {propTypes, defaultProps};
}

function createPropsPrototype(props, parentProps, propTypes, componentClass) {
  const defaultProps = Object.create(null);

  Object.assign(defaultProps, parentProps, props);

  const descriptors = {};

  const id = getComponentName(componentClass);
  delete props.id;

  Object.assign(descriptors, {
    id: {
      configurable: false,
      writable: true,
      value: id
    }
  });

  Object.defineProperties(defaultProps, descriptors);

  return defaultProps;
}

// HELPER METHODS

// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop) && object[prop];
}

function getComponentName(componentClass) {
  const componentName =
    getOwnProperty(componentClass, 'layerName') || getOwnProperty(componentClass, 'componentName');
  if (!componentName) {
    log.once(0, `${componentClass.name}.componentName not specified`);
  }
  return componentName || componentClass.name;
}
