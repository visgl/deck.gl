import {PROP_SYMBOLS} from './constants';

const {COMPONENT} = PROP_SYMBOLS;

export function validateProps(props) {
  const propTypes = getPropTypes(props);

  for (const propName in propTypes) {
    const propType = propTypes[propName];
    const {validate} = propType;
    if (validate && !validate(props[propName], propType)) {
      throw new Error(`Invalid prop ${propName}: ${props[propName]}`);
    }
  }
}

// Returns an object with "change flags", either false or strings indicating reason for change
export function diffProps(props, oldProps) {
  // First check if any props have changed (ignore props that will be examined separately)
  const propsChangedReason = compareProps({
    newProps: props,
    oldProps,
    propTypes: getPropTypes(props),
    ignoreProps: {data: null, updateTriggers: null, extensions: null, transitions: null}
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
    updateTriggersChanged: updateTriggersChangedReason,
    extensionsChanged: diffExtensions(props, oldProps),
    transitionsChanged: diffTransitions(props, oldProps)
  };
}

function diffTransitions(props, oldProps) {
  if (!props.transitions) {
    return null;
  }
  const result = {};
  const propTypes = getPropTypes(props);

  for (const key in props.transitions) {
    const propType = propTypes[key];
    const type = propType && propType.type;
    const isTransitionable = type === 'number' || type === 'color' || type === 'array';
    if (isTransitionable && comparePropValues(props[key], oldProps[key], propType)) {
      result[key] = true;
    }
  }
  return result;
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
/*
 * Note: for better performance, this function assumes that both oldProps and newProps
   inherit the same prototype (defaultProps). That is, if neither object contains own
   property <key>, assume `oldProps.<key>` and `newProps.<key>` are equal.
 */
export function compareProps({
  newProps,
  oldProps,
  ignoreProps = {},
  propTypes = {},
  triggerName = 'props'
} = {}) {
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

  // Compare explicitly defined new props against old/default values
  for (const key of Object.keys(newProps)) {
    if (!(key in ignoreProps)) {
      if (!(key in oldProps)) {
        return `${triggerName}.${key} added`;
      }
      const changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);
      if (changed) {
        return `${triggerName}.${key} ${changed}`;
      }
    }
  }

  // Test if any old props have been dropped
  for (const key of Object.keys(oldProps)) {
    if (!(key in ignoreProps)) {
      if (!(key in newProps)) {
        return `${triggerName}.${key} dropped`;
      }
      if (!Object.hasOwnProperty.call(newProps, key)) {
        // Compare dropped old prop against default value
        const changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);
        if (changed) {
          return `${triggerName}.${key} ${changed}`;
        }
      }
    }
  }

  return null;
}
/* eslint-enable max-statements, max-depth, complexity */

// HELPERS
function comparePropValues(newProp, oldProp, propType) {
  // If prop type has an equal function, invoke it
  let equal = propType && propType.equal;
  if (equal && !equal(newProp, oldProp, propType)) {
    return 'changed deeply';
  }

  if (!equal) {
    // If object has an equals function, invoke it
    equal = newProp && oldProp && newProp.equals;
    if (equal && !equal.call(newProp, oldProp)) {
      return 'changed deeply';
    }
  }

  if (!equal && oldProp !== newProp) {
    return 'changed shallowly';
  }

  return null;
}

// The comparison of the data prop requires special handling
// the dataComparator should be used if supplied
function diffDataProps(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  let dataChanged = null;
  // Support optional app defined comparison of data
  const {dataComparator, _dataDiff} = props;
  if (dataComparator) {
    if (!dataComparator(props.data, oldProps.data)) {
      dataChanged = 'Data comparator detected a change';
    }
    // Otherwise, do a shallow equal on props
  } else if (props.data !== oldProps.data) {
    dataChanged = 'A new data container was supplied';
  }
  if (dataChanged && _dataDiff) {
    dataChanged = _dataDiff(props.data, oldProps.data) || dataChanged;
  }

  return dataChanged;
}

// Checks if any update triggers have changed
// also calls callback to invalidate attributes accordingly.
function diffUpdateTriggers(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  // If the 'all' updateTrigger fires, ignore testing others
  if ('all' in props.updateTriggers) {
    const diffReason = diffUpdateTrigger(props, oldProps, 'all');
    if (diffReason) {
      return {all: true};
    }
  }

  const triggerChanged = {};
  let reason = false;
  // If the 'all' updateTrigger didn't fire, need to check all others
  for (const triggerName in props.updateTriggers) {
    if (triggerName !== 'all') {
      const diffReason = diffUpdateTrigger(props, oldProps, triggerName);
      if (diffReason) {
        triggerChanged[triggerName] = true;
        reason = triggerChanged;
      }
    }
  }

  return reason;
}

// Returns true if any extensions have changed
function diffExtensions(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  const oldExtensions = oldProps.extensions;
  const {extensions} = props;

  if (extensions === oldExtensions) {
    return false;
  }
  if (extensions.length !== oldExtensions.length) {
    return true;
  }
  for (let i = 0; i < extensions.length; i++) {
    if (!extensions[i].equals(oldExtensions[i])) {
      return true;
    }
  }
  return false;
}

function diffUpdateTrigger(props, oldProps, triggerName) {
  let newTriggers = props.updateTriggers[triggerName];
  newTriggers = newTriggers === undefined || newTriggers === null ? {} : newTriggers;
  let oldTriggers = oldProps.updateTriggers[triggerName];
  oldTriggers = oldTriggers === undefined || oldTriggers === null ? {} : oldTriggers;
  const diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName
  });
  return diffReason;
}

function getPropTypes(props) {
  const layer = props[COMPONENT];
  const LayerType = layer && layer.constructor;
  return LayerType ? LayerType._propTypes : {};
}
