// Converts a JSON payload to a deck.gl props object
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

import {instantiateClass} from './helpers/instantiate-class';
import JSONConfiguration from './json-configuration';
import assert from '../utils/assert';

// TODO - This can conflict with real props: Use non-valid JS key, e.g. `@type`?

const isObject = value => value && typeof value === 'object';

export default function convertJSON(json, configuration) {
  // Fixup configuration
  configuration = new JSONConfiguration(configuration);
  return convertJSONRecursively(json, '', configuration);
}

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
function convertJSONRecursively(json, key, configuration) {
  if (Array.isArray(json)) {
    return json.map((element, i) => convertJSONRecursively(element, String(i), configuration));
  }

  // If object.type is in configuration, instantitate
  if (isClassInstance(json, configuration)) {
    return convertClassInstance(json, configuration);
  }

  if (isObject(json)) {
    return convertPlainObject(json, configuration);
  }

  // Single value
  if (typeof json === 'string') {
    return convertString(json, key, configuration);
  }

  // Return unchanged (number, boolean, ...)
  return json;
}

// Returns true if an object has a `type` field
function isClassInstance(json, configuration) {
  const {typeKey} = configuration;
  return isObject(json) && Boolean(json[typeKey]);
}

function convertClassInstance(json, configuration) {
  // Extract the class type field
  const {typeKey} = configuration;
  const type = json[typeKey];

  // Prepare a props object and ensure all values have been converted
  let props = {...json};
  delete props[typeKey];

  props = convertPlainObject(props, configuration);

  return instantiateClass(type, props, configuration);
}

// Plain JS object, convert each key and return.
function convertPlainObject(json, configuration) {
  assert(isObject(json));

  const result = {};
  for (const key in json) {
    const value = json[key];
    result[key] = convertJSONRecursively(value, key, configuration);
  }
  return result;
}

// Convert one string value in an object
// TODO - hard to convert without type hint
// TODO - Define a syntax for functions so we don't need to sniff types?
// if (json.indexOf('@@: ') === 0)
// if (typeHint === function)
// parseExpressionString(propValue, configuration, isAccessor);

// TODO - We could also support string syntax for hydrating other types, like regexps...
// But no current use case
function convertString(json, key, configuration) {
  if (configuration.enumerations[json]) {
    // TODO - look up
    return json;
  }
  if (configuration.convertFunction) {
    return configuration.convertFunction(json, key, configuration);
  }
  return json;
}
