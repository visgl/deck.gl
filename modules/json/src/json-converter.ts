// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

import assert from './utils/assert';
import JSONConfiguration from './json-configuration';
import {instantiateClass} from './helpers/instantiate-class';
import {executeFunction} from './helpers/execute-function';

import {FUNCTION_IDENTIFIER, CONSTANT_IDENTIFIER, FUNCTION_KEY} from './syntactic-sugar';
import parseJSON from './helpers/parse-json';

const isObject = value => value && typeof value === 'object';

export type JSONConverterProps = {
  configuration: JSONConfiguration | Record<string, any>;
  onJSONChange;
};

export default class JSONConverter {
  log = console; // eslint-disable-line
  configuration!: JSONConfiguration;
  onJSONChange = () => {};
  json = null;
  convertedJson = null;

  constructor(props) {
    this.setProps(props);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {}

  setProps(props: JSONConverterProps) {
    // HANDLE CONFIGURATION PROPS
    if ('configuration' in props) {
      // Accept object or `JSONConfiguration`
      this.configuration =
        props.configuration instanceof JSONConfiguration
          ? props.configuration
          : new JSONConfiguration(props.configuration);
    }

    if ('onJSONChange' in props) {
      this.onJSONChange = props.onJSONChange;
    }
  }

  mergeConfiguration(config) {
    this.configuration.merge(config);
  }

  convert(json) {
    // Use shallow equality to ensure we only convert same json once
    if (!json || json === this.json) {
      return this.convertedJson;
    }
    // Save json for shallow diffing
    this.json = json;

    // Accept JSON strings by parsing them
    const parsedJSON = parseJSON(json);

    // Convert the JSON
    let convertedJson = convertJSON(parsedJSON, this.configuration);

    convertedJson = this.configuration.postProcessConvertedJson(convertedJson);

    this.convertedJson = convertedJson;
    return convertedJson;
  }

  // DEPRECATED: Backwards compatibility
  convertJson(json) {
    return this.convert(json);
  }
}

function convertJSON(json, configuration) {
  // Fixup configuration
  configuration = new JSONConfiguration(configuration);
  return convertJSONRecursively(json, '', configuration);
}

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
function convertJSONRecursively(json, key, configuration) {
  if (Array.isArray(json)) {
    return json.map((element, i) => convertJSONRecursively(element, String(i), configuration));
  }

  // If object.type is in configuration, instantiate
  if (isClassInstance(json, configuration)) {
    return convertClassInstance(json, configuration);
  }

  if (isObject(json)) {
    // If object.function is in configuration, convert object to function
    if (FUNCTION_KEY in json) {
      return convertFunctionObject(json, configuration);
    }
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
  const isClass = isObject(json) && Boolean(json[typeKey]);
  return isClass;
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

// Plain JS object, embed functions.
function convertFunctionObject(json, configuration) {
  // Extract the target function field
  const {functionKey} = configuration;
  const targetFunction = json[functionKey];

  // Prepare a props object and ensure all values have been converted
  let props = {...json};
  delete props[functionKey];

  props = convertPlainObject(props, configuration);

  return executeFunction(targetFunction, props, configuration);
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
// TODO - We could also support string syntax for hydrating other types, like regexps...
// But no current use case
function convertString(string, key, configuration) {
  // Here the JSON value is supposed to be treated as a function
  if (string.startsWith(FUNCTION_IDENTIFIER) && configuration.convertFunction) {
    string = string.replace(FUNCTION_IDENTIFIER, '');
    return configuration.convertFunction(string, configuration);
  }
  if (string.startsWith(CONSTANT_IDENTIFIER)) {
    string = string.replace(CONSTANT_IDENTIFIER, '');
    if (configuration.constants[string]) {
      return configuration.constants[string];
    }
    // enum
    const [enumVarName, enumValName] = string.split('.');
    return configuration.enumerations[enumVarName][enumValName];
  }
  return string;
}
