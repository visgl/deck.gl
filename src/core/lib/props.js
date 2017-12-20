import log from '../utils/log';
import assert from 'assert';

// Returns an object with "change flags", either false or strings indicating reason for change
export function diffProps(props, oldProps) {
  // First check if any props have changed (ignore props that will be examined separately)
  const propsChangedReason = compareProps({
    newProps: props,
    oldProps,
    ignoreProps: {data: null, updateTriggers: null}
  });

  // Now check if any data related props have changed
  const dataChangedReason = diffDataProps(props, oldProps);

  // Check update triggers to determine if any attributes need regeneration
  // Note - if data has changed, all attributes will need regeneration, so skip this step
  let updateTriggersChangedReason = false;
  if (!dataChangedReason) {
    updateTriggersChangedReason = diffUpdateTriggers(props, oldProps);
  }

  return {
    dataChanged: dataChangedReason,
    propsChanged: propsChangedReason,
    updateTriggersChanged: updateTriggersChangedReason
  };
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * @param {Object} opt.oldProps - object with old key/value pairs
 * @param {Object} opt.newProps - object with new key/value pairs
 * @param {Object} opt.ignoreProps={} - object, keys that should not be compared
 * @returns {null|String} - null when values of all keys are strictly equal.
 *   if unequal, returns a string explaining what changed.
 */
/* eslint-disable max-statements, max-depth, complexity */
export function compareProps({
  newProps,
  oldProps,
  ignoreProps = {},
  shallowCompareProps = {},
  triggerName = 'props'
} = {}) {
  assert(oldProps !== undefined && newProps !== undefined, 'compareProps args');

  // shallow equality => deep equality
  if (oldProps === newProps) {
    return null;
  }

  // TODO - do we need these checks? Should never happen...
  if (typeof newProps !== 'object' || newProps === null) {
    return `${triggerName} changed shallowly`;
  }

  if (typeof oldProps !== 'object' || oldProps === null) {
    return `${triggerName} changed shallowly`;
  }

  // Test if new props different from old props
  for (const key in oldProps) {
    if (!(key in ignoreProps)) {
      if (!newProps.hasOwnProperty(key)) {
        return `${triggerName}.${key} dropped: ${oldProps[key]} -> undefined`;
      }

      // If object has an equals function, invoke it
      let equals = newProps[key] && oldProps[key] && newProps[key].equals;
      if (equals && !equals.call(newProps[key], oldProps[key])) {
        return `${triggerName}.${key} changed deeply: ${oldProps[key]} -> ${newProps[key]}`;
      }

      // If both new and old value are functions, ignore differences
      if (key in shallowCompareProps) {
        const type = typeof newProps[key];
        if (type === 'function' && typeof oldProps[key] === 'function') {
          equals = true;
        }
      }

      if (!equals && oldProps[key] !== newProps[key]) {
        return `${triggerName}.${key} changed shallowly: ${oldProps[key]} -> ${newProps[key]}`;
      }
    }
  }

  // Test if any new props have been added
  for (const key in newProps) {
    if (!(key in ignoreProps)) {
      if (!oldProps.hasOwnProperty(key)) {
        return `${triggerName}.${key} added: undefined -> ${newProps[key]}`;
      }
    }
  }

  return null;
}
/* eslint-enable max-statements, max-depth, complexity */

// HELPERS

// The comparison of the data prop requires special handling
// the dataComparator should be used if supplied
function diffDataProps(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  // Support optional app defined comparison of data
  const {dataComparator} = props;
  if (dataComparator) {
    if (!dataComparator(props.data, oldProps.data)) {
      return 'Data comparator detected a change';
    }
    // Otherwise, do a shallow equal on props
  } else if (props.data !== oldProps.data) {
    return 'A new data container was supplied';
  }

  return null;
}

// Checks if any update triggers have changed
// also calls callback to invalidate attributes accordingly.
function diffUpdateTriggers(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  // If the 'all' updateTrigger fires, ignore testing others
  if ('all' in props.updateTriggers) {
    const diffReason = diffUpdateTrigger(oldProps, props, 'all');
    if (diffReason) {
      return {all: true};
    }
  }

  const triggerChanged = {};
  let reason = false;
  // If the 'all' updateTrigger didn't fire, need to check all others
  for (const triggerName in props.updateTriggers) {
    if (triggerName !== 'all') {
      const diffReason = diffUpdateTrigger(oldProps, props, triggerName);
      if (diffReason) {
        triggerChanged[triggerName] = true;
        reason = triggerChanged;
      }
    }
  }

  return reason;
}

function diffUpdateTrigger(props, oldProps, triggerName) {
  const newTriggers = props.updateTriggers[triggerName] || {};
  const oldTriggers = oldProps.updateTriggers[triggerName] || {};
  const diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName
  });
  return diffReason;
}

// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop) && object[prop];
}

/*
 * Return merged default props stored on layers constructor, create them if needed
 */
export function getDefaultProps(layer) {
  // TODO - getOwnProperty is very slow, reduces layer construction speed 3x
  const mergedDefaultProps = getOwnProperty(layer.constructor, 'mergedDefaultProps');
  if (mergedDefaultProps) {
    return mergedDefaultProps;
  }
  return mergeDefaultProps(layer);
}

/*
 * Walk a prototype chain and merge all default props from any 'defaultProps' objects
 */
export function mergeDefaultProps(object, objectNameKey = 'layerName') {
  const subClassConstructor = object.constructor;
  const objectName = getOwnProperty(subClassConstructor, objectNameKey);
  if (!objectName) {
    log.once(0, `${object.constructor.name} does not specify a ${objectNameKey}`);
  }

  // Use the object's constructor name as default id prop.
  // Note that constructor names are substituted during minification and may not be "human readable"
  let mergedDefaultProps = {
    id: objectName || object.constructor.name
  };

  // Reverse shadowing
  // TODO - Rewrite to stop when mergedDefaultProps is available on parent?
  while (object) {
    const objectDefaultProps = getOwnProperty(object.constructor, 'defaultProps');
    Object.freeze(objectDefaultProps);
    if (objectDefaultProps) {
      mergedDefaultProps = Object.assign({}, objectDefaultProps, mergedDefaultProps);
    }
    object = Object.getPrototypeOf(object);
  }

  Object.freeze(mergedDefaultProps);

  // Store for quick lookup
  subClassConstructor.mergedDefaultProps = mergedDefaultProps;

  assert(mergeDefaultProps);
  return mergedDefaultProps;
}
