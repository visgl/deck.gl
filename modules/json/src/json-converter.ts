// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {JSONConfiguration, JSONConfigurationProps} from './json-configuration';
import {FUNCTION_IDENTIFIER, CONSTANT_IDENTIFIER, FUNCTION_KEY} from './syntactic-sugar';
import {instantiateClass} from './helpers/instantiate-class';
import {executeFunction} from './helpers/execute-function';
import {parseJSON} from './helpers/parse-json';

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export type JSONConverterProps = {
  configuration: JSONConfiguration | JSONConfigurationProps;
  onJSONChange: () => void;
};

/**
 * Converts JSON to "props" by "hydrating" classes, resolving enums and functions etc.
 *
 * Lightly processes `json` props, transform string values, and extract `views` and `layers`
 * @see https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
 *
 * NOTES:
 * - This is intended to provide minimal necessary processing required to support
 *   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
 * - Optionally, error checking could be applied, but ideally should leverage
 *   non-JSON specific mechanisms like prop types.
 */
export class JSONConverter {
  log = console; // eslint-disable-line
  configuration!: JSONConfiguration;
  onJSONChange: () => void = () => {};
  json: unknown = null;
  convertedJson: unknown = null;

  constructor(props) {
    this.setProps(props);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {}

  setProps(props: JSONConverterProps | JSONConfiguration) {
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

  mergeConfiguration(config: JSONConfiguration) {
    this.configuration.merge(config);
  }

  convert(json: unknown): unknown {
    // Use shallow equality to ensure we only convert same json once
    if (!json || json === this.json) {
      return this.convertedJson;
    }
    // Save json for shallow diffing
    this.json = json;

    // Accept JSON strings by parsing them
    const parsedJSON = parseJSON(json);
    if (!isObject(parsedJSON)) {
      throw new Error('JSONConverter: expected an object');
    }

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

function convertJSON(json: Record<string, unknown>, configuration: JSONConfiguration) {
  // Fixup configuration
  configuration = new JSONConfiguration(configuration.config);
  return convertJSONRecursively(json, '', configuration);
}

/** Converts JSON to props ("hydrating" classes, resolving enums and functions etc). */
function convertJSONRecursively(json: unknown, key, configuration) {
  if (Array.isArray(json)) {
    return json.map((element, i) => convertJSONRecursively(element, String(i), configuration));
  }

  if (isObject(json)) {
    // If object.type is in configuration, instantiate
    if (isClassInstance(json, configuration)) {
      return convertClassInstance(json, configuration);
    }

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

/** Returns true if an object has a `type` field */
function isClassInstance(json: Record<string, unknown>, configuration: JSONConfiguration) {
  const {typeKey} = configuration.config;
  const isClass = isObject(json) && Boolean(json[typeKey]);
  return isClass;
}

function convertClassInstance(json: Record<string, unknown>, configuration: JSONConfiguration) {
  // Extract the class type field
  const {typeKey} = configuration.config;
  const type = json[typeKey];

  // Prepare a props object and ensure all values have been converted
  let props = {...json};
  delete props[typeKey];

  props = convertPlainObject(props, configuration);

  return instantiateClass(type, props, configuration);
}

/** Plain JS object, embed functions. */
function convertFunctionObject(json, configuration: JSONConfiguration) {
  // Extract the target function field
  const {functionKey} = configuration.config;
  const targetFunction = json[functionKey];

  // Prepare a props object and ensure all values have been converted
  let props = {...json};
  delete props[functionKey];

  props = convertPlainObject(props, configuration);

  return executeFunction(targetFunction, props, configuration);
}

/** Plain JS object, convert each key and return. */
function convertPlainObject(json: unknown, configuration: JSONConfiguration) {
  if (!isObject(json)) {
    throw new Error('convertPlainObject: expected an object');
  }

  const result = {};
  for (const [key, value] of Object.entries(json)) {
    result[key] = convertJSONRecursively(value, key, configuration);
  }
  return result;
}

/** Convert one string value in an object
 * @todo We could also support string syntax for hydrating other types, like regexps... But no current use case
 */
function convertString(string: string, key: string, configuration: JSONConfiguration) {
  // Here the JSON value is supposed to be treated as a function
  if (string.startsWith(FUNCTION_IDENTIFIER) && configuration.convertFunction) {
    string = string.replace(FUNCTION_IDENTIFIER, '');
    return configuration.convertFunction(string, configuration);
  }
  if (string.startsWith(CONSTANT_IDENTIFIER)) {
    string = string.replace(CONSTANT_IDENTIFIER, '');
    if (configuration.config.constants[string]) {
      return configuration.config.constants[string];
    }
    // enum
    const [enumVarName, enumValName] = string.split('.');
    return configuration.config.enumerations[enumVarName][enumValName];
  }
  return string;
}
