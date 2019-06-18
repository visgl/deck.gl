var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import log from '../utils/log';
import assert from 'assert';

// Returns an object with "change flags", either false or strings indicating reason for change
export function diffProps(props, oldProps) {
  // First check if any props have changed (ignore props that will be examined separately)
  var propsChangedReason = compareProps({
    newProps: props,
    oldProps: oldProps,
    ignoreProps: { data: null, updateTriggers: null }
  });

  // Now check if any data related props have changed
  var dataChangedReason = diffDataProps(props, oldProps);

  // Check update triggers to determine if any attributes need regeneration
  // Note - if data has changed, all attributes will need regeneration, so skip this step
  var updateTriggersChangedReason = false;
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
export function compareProps() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      newProps = _ref.newProps,
      oldProps = _ref.oldProps,
      _ref$ignoreProps = _ref.ignoreProps,
      ignoreProps = _ref$ignoreProps === undefined ? {} : _ref$ignoreProps,
      _ref$shallowComparePr = _ref.shallowCompareProps,
      shallowCompareProps = _ref$shallowComparePr === undefined ? {} : _ref$shallowComparePr,
      _ref$triggerName = _ref.triggerName,
      triggerName = _ref$triggerName === undefined ? 'props' : _ref$triggerName;

  assert(oldProps !== undefined && newProps !== undefined, 'compareProps args');

  // shallow equality => deep equality
  if (oldProps === newProps) {
    return null;
  }

  // TODO - do we need these checks? Should never happen...
  if ((typeof newProps === 'undefined' ? 'undefined' : _typeof(newProps)) !== 'object' || newProps === null) {
    return triggerName + ' changed shallowly';
  }

  if ((typeof oldProps === 'undefined' ? 'undefined' : _typeof(oldProps)) !== 'object' || oldProps === null) {
    return triggerName + ' changed shallowly';
  }

  // Test if new props different from old props
  for (var key in oldProps) {
    if (!(key in ignoreProps)) {
      if (!newProps.hasOwnProperty(key)) {
        return triggerName + '.' + key + ' dropped: ' + oldProps[key] + ' -> undefined';
      }

      // If object has an equals function, invoke it
      var equals = newProps[key] && oldProps[key] && newProps[key].equals;
      if (equals && !equals.call(newProps[key], oldProps[key])) {
        return triggerName + '.' + key + ' changed deeply: ' + oldProps[key] + ' -> ' + newProps[key];
      }

      // If both new and old value are functions, ignore differences
      if (key in shallowCompareProps) {
        var type = _typeof(newProps[key]);
        if (type === 'function' && typeof oldProps[key] === 'function') {
          equals = true;
        }
      }

      if (!equals && oldProps[key] !== newProps[key]) {
        return triggerName + '.' + key + ' changed shallowly: ' + oldProps[key] + ' -> ' + newProps[key];
      }
    }
  }

  // Test if any new props have been added
  for (var _key in newProps) {
    if (!(_key in ignoreProps)) {
      if (!oldProps.hasOwnProperty(_key)) {
        return triggerName + '.' + _key + ' added: undefined -> ' + newProps[_key];
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
  var dataComparator = props.dataComparator;

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
    var diffReason = diffUpdateTrigger(oldProps, props, 'all');
    if (diffReason) {
      return { all: true };
    }
  }

  var triggerChanged = {};
  var reason = false;
  // If the 'all' updateTrigger didn't fire, need to check all others
  for (var triggerName in props.updateTriggers) {
    if (triggerName !== 'all') {
      var _diffReason = diffUpdateTrigger(oldProps, props, triggerName);
      if (_diffReason) {
        triggerChanged[triggerName] = true;
        reason = triggerChanged;
      }
    }
  }

  return reason;
}

function diffUpdateTrigger(props, oldProps, triggerName) {
  var newTriggers = props.updateTriggers[triggerName] || {};
  var oldTriggers = oldProps.updateTriggers[triggerName] || {};
  var diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName: triggerName
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
  var mergedDefaultProps = getOwnProperty(layer.constructor, 'mergedDefaultProps');
  if (mergedDefaultProps) {
    return mergedDefaultProps;
  }
  return mergeDefaultProps(layer);
}

/*
 * Walk a prototype chain and merge all default props from any 'defaultProps' objects
 */
export function mergeDefaultProps(object) {
  var objectNameKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'layerName';

  var subClassConstructor = object.constructor;
  var objectName = getOwnProperty(subClassConstructor, objectNameKey);
  if (!objectName) {
    log.once(0, object.constructor.name + ' does not specify a ' + objectNameKey);
  }

  // Use the object's constructor name as default id prop.
  // Note that constructor names are substituted during minification and may not be "human readable"
  var mergedDefaultProps = {
    id: objectName || object.constructor.name
  };

  // Reverse shadowing
  // TODO - Rewrite to stop when mergedDefaultProps is available on parent?
  while (object) {
    var objectDefaultProps = getOwnProperty(object.constructor, 'defaultProps');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9wcm9wcy5qcyJdLCJuYW1lcyI6WyJsb2ciLCJhc3NlcnQiLCJkaWZmUHJvcHMiLCJwcm9wcyIsIm9sZFByb3BzIiwicHJvcHNDaGFuZ2VkUmVhc29uIiwiY29tcGFyZVByb3BzIiwibmV3UHJvcHMiLCJpZ25vcmVQcm9wcyIsImRhdGEiLCJ1cGRhdGVUcmlnZ2VycyIsImRhdGFDaGFuZ2VkUmVhc29uIiwiZGlmZkRhdGFQcm9wcyIsInVwZGF0ZVRyaWdnZXJzQ2hhbmdlZFJlYXNvbiIsImRpZmZVcGRhdGVUcmlnZ2VycyIsImRhdGFDaGFuZ2VkIiwicHJvcHNDaGFuZ2VkIiwidXBkYXRlVHJpZ2dlcnNDaGFuZ2VkIiwic2hhbGxvd0NvbXBhcmVQcm9wcyIsInRyaWdnZXJOYW1lIiwidW5kZWZpbmVkIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJlcXVhbHMiLCJjYWxsIiwidHlwZSIsImRhdGFDb21wYXJhdG9yIiwiZGlmZlJlYXNvbiIsImRpZmZVcGRhdGVUcmlnZ2VyIiwiYWxsIiwidHJpZ2dlckNoYW5nZWQiLCJyZWFzb24iLCJuZXdUcmlnZ2VycyIsIm9sZFRyaWdnZXJzIiwiZ2V0T3duUHJvcGVydHkiLCJvYmplY3QiLCJwcm9wIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiZ2V0RGVmYXVsdFByb3BzIiwibGF5ZXIiLCJtZXJnZWREZWZhdWx0UHJvcHMiLCJjb25zdHJ1Y3RvciIsIm1lcmdlRGVmYXVsdFByb3BzIiwib2JqZWN0TmFtZUtleSIsInN1YkNsYXNzQ29uc3RydWN0b3IiLCJvYmplY3ROYW1lIiwib25jZSIsIm5hbWUiLCJpZCIsIm9iamVjdERlZmF1bHRQcm9wcyIsImZyZWV6ZSIsImFzc2lnbiIsImdldFByb3RvdHlwZU9mIl0sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU9BLEdBQVAsTUFBZ0IsY0FBaEI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBO0FBQ0EsT0FBTyxTQUFTQyxTQUFU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a0JILEtBQWxCLENBQVA7QUFDRDs7QUFFRDs7O0FBR0EsT0FBTyxTQUFTRyxpQkFBVCxDQUEyQlIsTUFBM0IsRUFBZ0U7QUFBQSxNQUE3QlMsYUFBNkIsdUVBQWIsV0FBYTs7QUFDckUsTUFBTUMsc0JBQXNCVixPQUFPTyxXQUFuQztBQUNBLE1BQU1JLGFBQWFaLGVBQWVXLG1CQUFmLEVBQW9DRCxhQUFwQyxDQUFuQjtBQUNBLE1BQUksQ0FBQ0UsVUFBTCxFQUFpQjtBQUNmOUMsUUFBSStDLElBQUosQ0FBUyxDQUFULEVBQWVaLE9BQU9PLFdBQVAsQ0FBbUJNLElBQWxDLDRCQUE2REosYUFBN0Q7QUFDRDs7QUFFRDtBQUNBO0FBQ0EsTUFBSUgscUJBQXFCO0FBQ3ZCUSxRQUFJSCxjQUFjWCxPQUFPTyxXQUFQLENBQW1CTTtBQURkLEdBQXpCOztBQUlBO0FBQ0E7QUFDQSxTQUFPYixNQUFQLEVBQWU7QUFDYixRQUFNZSxxQkFBcUJoQixlQUFlQyxPQUFPTyxXQUF0QixFQUFtQyxjQUFuQyxDQUEzQjtBQUNBTCxXQUFPYyxNQUFQLENBQWNELGtCQUFkO0FBQ0EsUUFBSUEsa0JBQUosRUFBd0I7QUFDdEJULDJCQUFxQkosT0FBT2UsTUFBUCxDQUFjLEVBQWQsRUFBa0JGLGtCQUFsQixFQUFzQ1Qsa0JBQXRDLENBQXJCO0FBQ0Q7QUFDRE4sYUFBU0UsT0FBT2dCLGNBQVAsQ0FBc0JsQixNQUF0QixDQUFUO0FBQ0Q7O0FBRURFLFNBQU9jLE1BQVAsQ0FBY1Ysa0JBQWQ7O0FBRUE7QUFDQUksc0JBQW9CSixrQkFBcEIsR0FBeUNBLGtCQUF6Qzs7QUFFQXhDLFNBQU8wQyxpQkFBUDtBQUNBLFNBQU9GLGtCQUFQO0FBQ0QiLCJmaWxlIjoicHJvcHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9nIGZyb20gJy4uL3V0aWxzL2xvZyc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbi8vIFJldHVybnMgYW4gb2JqZWN0IHdpdGggXCJjaGFuZ2UgZmxhZ3NcIiwgZWl0aGVyIGZhbHNlIG9yIHN0cmluZ3MgaW5kaWNhdGluZyByZWFzb24gZm9yIGNoYW5nZVxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZQcm9wcyhwcm9wcywgb2xkUHJvcHMpIHtcbiAgLy8gRmlyc3QgY2hlY2sgaWYgYW55IHByb3BzIGhhdmUgY2hhbmdlZCAoaWdub3JlIHByb3BzIHRoYXQgd2lsbCBiZSBleGFtaW5lZCBzZXBhcmF0ZWx5KVxuICBjb25zdCBwcm9wc0NoYW5nZWRSZWFzb24gPSBjb21wYXJlUHJvcHMoe1xuICAgIG5ld1Byb3BzOiBwcm9wcyxcbiAgICBvbGRQcm9wcyxcbiAgICBpZ25vcmVQcm9wczoge2RhdGE6IG51bGwsIHVwZGF0ZVRyaWdnZXJzOiBudWxsfVxuICB9KTtcblxuICAvLyBOb3cgY2hlY2sgaWYgYW55IGRhdGEgcmVsYXRlZCBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgY29uc3QgZGF0YUNoYW5nZWRSZWFzb24gPSBkaWZmRGF0YVByb3BzKHByb3BzLCBvbGRQcm9wcyk7XG5cbiAgLy8gQ2hlY2sgdXBkYXRlIHRyaWdnZXJzIHRvIGRldGVybWluZSBpZiBhbnkgYXR0cmlidXRlcyBuZWVkIHJlZ2VuZXJhdGlvblxuICAvLyBOb3RlIC0gaWYgZGF0YSBoYXMgY2hhbmdlZCwgYWxsIGF0dHJpYnV0ZXMgd2lsbCBuZWVkIHJlZ2VuZXJhdGlvbiwgc28gc2tpcCB0aGlzIHN0ZXBcbiAgbGV0IHVwZGF0ZVRyaWdnZXJzQ2hhbmdlZFJlYXNvbiA9IGZhbHNlO1xuICBpZiAoIWRhdGFDaGFuZ2VkUmVhc29uKSB7XG4gICAgdXBkYXRlVHJpZ2dlcnNDaGFuZ2VkUmVhc29uID0gZGlmZlVwZGF0ZVRyaWdnZXJzKHByb3BzLCBvbGRQcm9wcyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRhdGFDaGFuZ2VkOiBkYXRhQ2hhbmdlZFJlYXNvbixcbiAgICBwcm9wc0NoYW5nZWQ6IHByb3BzQ2hhbmdlZFJlYXNvbixcbiAgICB1cGRhdGVUcmlnZ2Vyc0NoYW5nZWQ6IHVwZGF0ZVRyaWdnZXJzQ2hhbmdlZFJlYXNvblxuICB9O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGVxdWFsaXR5IGJ5IGl0ZXJhdGluZyB0aHJvdWdoIGtleXMgb24gYW4gb2JqZWN0IGFuZCByZXR1cm5pbmcgZmFsc2VcbiAqIHdoZW4gYW55IGtleSBoYXMgdmFsdWVzIHdoaWNoIGFyZSBub3Qgc3RyaWN0bHkgZXF1YWwgYmV0d2VlbiB0aGUgYXJndW1lbnRzLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdC5vbGRQcm9wcyAtIG9iamVjdCB3aXRoIG9sZCBrZXkvdmFsdWUgcGFpcnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHQubmV3UHJvcHMgLSBvYmplY3Qgd2l0aCBuZXcga2V5L3ZhbHVlIHBhaXJzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0Lmlnbm9yZVByb3BzPXt9IC0gb2JqZWN0LCBrZXlzIHRoYXQgc2hvdWxkIG5vdCBiZSBjb21wYXJlZFxuICogQHJldHVybnMge251bGx8U3RyaW5nfSAtIG51bGwgd2hlbiB2YWx1ZXMgb2YgYWxsIGtleXMgYXJlIHN0cmljdGx5IGVxdWFsLlxuICogICBpZiB1bmVxdWFsLCByZXR1cm5zIGEgc3RyaW5nIGV4cGxhaW5pbmcgd2hhdCBjaGFuZ2VkLlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cywgbWF4LWRlcHRoLCBjb21wbGV4aXR5ICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZVByb3BzKHtcbiAgbmV3UHJvcHMsIG9sZFByb3BzLCBpZ25vcmVQcm9wcyA9IHt9LCBzaGFsbG93Q29tcGFyZVByb3BzID0ge30sIHRyaWdnZXJOYW1lID0gJ3Byb3BzJ1xufSA9IHt9KSB7XG4gIGFzc2VydChvbGRQcm9wcyAhPT0gdW5kZWZpbmVkICYmIG5ld1Byb3BzICE9PSB1bmRlZmluZWQsICdjb21wYXJlUHJvcHMgYXJncycpO1xuXG4gIC8vIHNoYWxsb3cgZXF1YWxpdHkgPT4gZGVlcCBlcXVhbGl0eVxuICBpZiAob2xkUHJvcHMgPT09IG5ld1Byb3BzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBUT0RPIC0gZG8gd2UgbmVlZCB0aGVzZSBjaGVja3M/IFNob3VsZCBuZXZlciBoYXBwZW4uLi5cbiAgaWYgKHR5cGVvZiBuZXdQcm9wcyAhPT0gJ29iamVjdCcgfHwgbmV3UHJvcHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gYCR7dHJpZ2dlck5hbWV9IGNoYW5nZWQgc2hhbGxvd2x5YDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2xkUHJvcHMgIT09ICdvYmplY3QnIHx8IG9sZFByb3BzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGAke3RyaWdnZXJOYW1lfSBjaGFuZ2VkIHNoYWxsb3dseWA7XG4gIH1cblxuICAvLyBUZXN0IGlmIG5ldyBwcm9wcyBkaWZmZXJlbnQgZnJvbSBvbGQgcHJvcHNcbiAgZm9yIChjb25zdCBrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIShrZXkgaW4gaWdub3JlUHJvcHMpKSB7XG4gICAgICBpZiAoIW5ld1Byb3BzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGAke3RyaWdnZXJOYW1lfS4ke2tleX0gZHJvcHBlZDogJHtvbGRQcm9wc1trZXldfSAtPiB1bmRlZmluZWRgO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBvYmplY3QgaGFzIGFuIGVxdWFscyBmdW5jdGlvbiwgaW52b2tlIGl0XG4gICAgICBsZXQgZXF1YWxzID0gbmV3UHJvcHNba2V5XSAmJiBvbGRQcm9wc1trZXldICYmIG5ld1Byb3BzW2tleV0uZXF1YWxzO1xuICAgICAgaWYgKGVxdWFscyAmJiAhZXF1YWxzLmNhbGwobmV3UHJvcHNba2V5XSwgb2xkUHJvcHNba2V5XSkpIHtcbiAgICAgICAgcmV0dXJuIGAke3RyaWdnZXJOYW1lfS4ke2tleX0gY2hhbmdlZCBkZWVwbHk6ICR7b2xkUHJvcHNba2V5XX0gLT4gJHtuZXdQcm9wc1trZXldfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGJvdGggbmV3IGFuZCBvbGQgdmFsdWUgYXJlIGZ1bmN0aW9ucywgaWdub3JlIGRpZmZlcmVuY2VzXG4gICAgICBpZiAoa2V5IGluIHNoYWxsb3dDb21wYXJlUHJvcHMpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHR5cGVvZiBuZXdQcm9wc1trZXldO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2xkUHJvcHNba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGVxdWFscyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFlcXVhbHMgJiYgb2xkUHJvcHNba2V5XSAhPT0gbmV3UHJvcHNba2V5XSkge1xuICAgICAgICByZXR1cm4gYCR7dHJpZ2dlck5hbWV9LiR7a2V5fSBjaGFuZ2VkIHNoYWxsb3dseTogJHtvbGRQcm9wc1trZXldfSAtPiAke25ld1Byb3BzW2tleV19YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBUZXN0IGlmIGFueSBuZXcgcHJvcHMgaGF2ZSBiZWVuIGFkZGVkXG4gIGZvciAoY29uc3Qga2V5IGluIG5ld1Byb3BzKSB7XG4gICAgaWYgKCEoa2V5IGluIGlnbm9yZVByb3BzKSkge1xuICAgICAgaWYgKCFvbGRQcm9wcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJldHVybiBgJHt0cmlnZ2VyTmFtZX0uJHtrZXl9IGFkZGVkOiB1bmRlZmluZWQgLT4gJHtuZXdQcm9wc1trZXldfWA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzLCBtYXgtZGVwdGgsIGNvbXBsZXhpdHkgKi9cblxuLy8gSEVMUEVSU1xuXG4vLyBUaGUgY29tcGFyaXNvbiBvZiB0aGUgZGF0YSBwcm9wIHJlcXVpcmVzIHNwZWNpYWwgaGFuZGxpbmdcbi8vIHRoZSBkYXRhQ29tcGFyYXRvciBzaG91bGQgYmUgdXNlZCBpZiBzdXBwbGllZFxuZnVuY3Rpb24gZGlmZkRhdGFQcm9wcyhwcm9wcywgb2xkUHJvcHMpIHtcbiAgaWYgKG9sZFByb3BzID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdvbGRQcm9wcyBpcyBudWxsLCBpbml0aWFsIGRpZmYnO1xuICB9XG5cbiAgLy8gU3VwcG9ydCBvcHRpb25hbCBhcHAgZGVmaW5lZCBjb21wYXJpc29uIG9mIGRhdGFcbiAgY29uc3Qge2RhdGFDb21wYXJhdG9yfSA9IHByb3BzO1xuICBpZiAoZGF0YUNvbXBhcmF0b3IpIHtcbiAgICBpZiAoIWRhdGFDb21wYXJhdG9yKHByb3BzLmRhdGEsIG9sZFByb3BzLmRhdGEpKSB7XG4gICAgICByZXR1cm4gJ0RhdGEgY29tcGFyYXRvciBkZXRlY3RlZCBhIGNoYW5nZSc7XG4gICAgfVxuICAvLyBPdGhlcndpc2UsIGRvIGEgc2hhbGxvdyBlcXVhbCBvbiBwcm9wc1xuICB9IGVsc2UgaWYgKHByb3BzLmRhdGEgIT09IG9sZFByb3BzLmRhdGEpIHtcbiAgICByZXR1cm4gJ0EgbmV3IGRhdGEgY29udGFpbmVyIHdhcyBzdXBwbGllZCc7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gQ2hlY2tzIGlmIGFueSB1cGRhdGUgdHJpZ2dlcnMgaGF2ZSBjaGFuZ2VkXG4vLyBhbHNvIGNhbGxzIGNhbGxiYWNrIHRvIGludmFsaWRhdGUgYXR0cmlidXRlcyBhY2NvcmRpbmdseS5cbmZ1bmN0aW9uIGRpZmZVcGRhdGVUcmlnZ2Vycyhwcm9wcywgb2xkUHJvcHMpIHtcbiAgaWYgKG9sZFByb3BzID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdvbGRQcm9wcyBpcyBudWxsLCBpbml0aWFsIGRpZmYnO1xuICB9XG5cbiAgLy8gSWYgdGhlICdhbGwnIHVwZGF0ZVRyaWdnZXIgZmlyZXMsIGlnbm9yZSB0ZXN0aW5nIG90aGVyc1xuICBpZiAoJ2FsbCcgaW4gcHJvcHMudXBkYXRlVHJpZ2dlcnMpIHtcbiAgICBjb25zdCBkaWZmUmVhc29uID0gZGlmZlVwZGF0ZVRyaWdnZXIob2xkUHJvcHMsIHByb3BzLCAnYWxsJyk7XG4gICAgaWYgKGRpZmZSZWFzb24pIHtcbiAgICAgIHJldHVybiB7YWxsOiB0cnVlfTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0cmlnZ2VyQ2hhbmdlZCA9IHt9O1xuICBsZXQgcmVhc29uID0gZmFsc2U7XG4gIC8vIElmIHRoZSAnYWxsJyB1cGRhdGVUcmlnZ2VyIGRpZG4ndCBmaXJlLCBuZWVkIHRvIGNoZWNrIGFsbCBvdGhlcnNcbiAgZm9yIChjb25zdCB0cmlnZ2VyTmFtZSBpbiBwcm9wcy51cGRhdGVUcmlnZ2Vycykge1xuICAgIGlmICh0cmlnZ2VyTmFtZSAhPT0gJ2FsbCcpIHtcbiAgICAgIGNvbnN0IGRpZmZSZWFzb24gPSBkaWZmVXBkYXRlVHJpZ2dlcihvbGRQcm9wcywgcHJvcHMsIHRyaWdnZXJOYW1lKTtcbiAgICAgIGlmIChkaWZmUmVhc29uKSB7XG4gICAgICAgIHRyaWdnZXJDaGFuZ2VkW3RyaWdnZXJOYW1lXSA9IHRydWU7XG4gICAgICAgIHJlYXNvbiA9IHRyaWdnZXJDaGFuZ2VkO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZWFzb247XG59XG5cbmZ1bmN0aW9uIGRpZmZVcGRhdGVUcmlnZ2VyKHByb3BzLCBvbGRQcm9wcywgdHJpZ2dlck5hbWUpIHtcbiAgY29uc3QgbmV3VHJpZ2dlcnMgPSBwcm9wcy51cGRhdGVUcmlnZ2Vyc1t0cmlnZ2VyTmFtZV0gfHwge307XG4gIGNvbnN0IG9sZFRyaWdnZXJzID0gb2xkUHJvcHMudXBkYXRlVHJpZ2dlcnNbdHJpZ2dlck5hbWVdIHx8IHt9O1xuICBjb25zdCBkaWZmUmVhc29uID0gY29tcGFyZVByb3BzKHtcbiAgICBvbGRQcm9wczogb2xkVHJpZ2dlcnMsXG4gICAgbmV3UHJvcHM6IG5ld1RyaWdnZXJzLFxuICAgIHRyaWdnZXJOYW1lXG4gIH0pO1xuICByZXR1cm4gZGlmZlJlYXNvbjtcbn1cblxuLy8gQ29uc3RydWN0b3JzIGhhdmUgdGhlaXIgc3VwZXIgY2xhc3MgY29uc3RydWN0b3JzIGFzIHByb3RvdHlwZXNcbmZ1bmN0aW9uIGdldE93blByb3BlcnR5KG9iamVjdCwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcCkgJiYgb2JqZWN0W3Byb3BdO1xufVxuXG4vKlxuICogUmV0dXJuIG1lcmdlZCBkZWZhdWx0IHByb3BzIHN0b3JlZCBvbiBsYXllcnMgY29uc3RydWN0b3IsIGNyZWF0ZSB0aGVtIGlmIG5lZWRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKGxheWVyKSB7XG4gIC8vIFRPRE8gLSBnZXRPd25Qcm9wZXJ0eSBpcyB2ZXJ5IHNsb3csIHJlZHVjZXMgbGF5ZXIgY29uc3RydWN0aW9uIHNwZWVkIDN4XG4gIGNvbnN0IG1lcmdlZERlZmF1bHRQcm9wcyA9IGdldE93blByb3BlcnR5KGxheWVyLmNvbnN0cnVjdG9yLCAnbWVyZ2VkRGVmYXVsdFByb3BzJyk7XG4gIGlmIChtZXJnZWREZWZhdWx0UHJvcHMpIHtcbiAgICByZXR1cm4gbWVyZ2VkRGVmYXVsdFByb3BzO1xuICB9XG4gIHJldHVybiBtZXJnZURlZmF1bHRQcm9wcyhsYXllcik7XG59XG5cbi8qXG4gKiBXYWxrIGEgcHJvdG90eXBlIGNoYWluIGFuZCBtZXJnZSBhbGwgZGVmYXVsdCBwcm9wcyBmcm9tIGFueSAnZGVmYXVsdFByb3BzJyBvYmplY3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZURlZmF1bHRQcm9wcyhvYmplY3QsIG9iamVjdE5hbWVLZXkgPSAnbGF5ZXJOYW1lJykge1xuICBjb25zdCBzdWJDbGFzc0NvbnN0cnVjdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBjb25zdCBvYmplY3ROYW1lID0gZ2V0T3duUHJvcGVydHkoc3ViQ2xhc3NDb25zdHJ1Y3Rvciwgb2JqZWN0TmFtZUtleSk7XG4gIGlmICghb2JqZWN0TmFtZSkge1xuICAgIGxvZy5vbmNlKDAsIGAke29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfSBkb2VzIG5vdCBzcGVjaWZ5IGEgJHtvYmplY3ROYW1lS2V5fWApO1xuICB9XG5cbiAgLy8gVXNlIHRoZSBvYmplY3QncyBjb25zdHJ1Y3RvciBuYW1lIGFzIGRlZmF1bHQgaWQgcHJvcC5cbiAgLy8gTm90ZSB0aGF0IGNvbnN0cnVjdG9yIG5hbWVzIGFyZSBzdWJzdGl0dXRlZCBkdXJpbmcgbWluaWZpY2F0aW9uIGFuZCBtYXkgbm90IGJlIFwiaHVtYW4gcmVhZGFibGVcIlxuICBsZXQgbWVyZ2VkRGVmYXVsdFByb3BzID0ge1xuICAgIGlkOiBvYmplY3ROYW1lIHx8IG9iamVjdC5jb25zdHJ1Y3Rvci5uYW1lXG4gIH07XG5cbiAgLy8gUmV2ZXJzZSBzaGFkb3dpbmdcbiAgLy8gVE9ETyAtIFJld3JpdGUgdG8gc3RvcCB3aGVuIG1lcmdlZERlZmF1bHRQcm9wcyBpcyBhdmFpbGFibGUgb24gcGFyZW50P1xuICB3aGlsZSAob2JqZWN0KSB7XG4gICAgY29uc3Qgb2JqZWN0RGVmYXVsdFByb3BzID0gZ2V0T3duUHJvcGVydHkob2JqZWN0LmNvbnN0cnVjdG9yLCAnZGVmYXVsdFByb3BzJyk7XG4gICAgT2JqZWN0LmZyZWV6ZShvYmplY3REZWZhdWx0UHJvcHMpO1xuICAgIGlmIChvYmplY3REZWZhdWx0UHJvcHMpIHtcbiAgICAgIG1lcmdlZERlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIG9iamVjdERlZmF1bHRQcm9wcywgbWVyZ2VkRGVmYXVsdFByb3BzKTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG4gIH1cblxuICBPYmplY3QuZnJlZXplKG1lcmdlZERlZmF1bHRQcm9wcyk7XG5cbiAgLy8gU3RvcmUgZm9yIHF1aWNrIGxvb2t1cFxuICBzdWJDbGFzc0NvbnN0cnVjdG9yLm1lcmdlZERlZmF1bHRQcm9wcyA9IG1lcmdlZERlZmF1bHRQcm9wcztcblxuICBhc3NlcnQobWVyZ2VEZWZhdWx0UHJvcHMpO1xuICByZXR1cm4gbWVyZ2VkRGVmYXVsdFByb3BzO1xufVxuIl19