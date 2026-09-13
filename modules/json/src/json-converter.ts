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

/**
 * Properties accepted by `JSONConverter`.
 */
export type JSONConverterProps = {
  /** Configuration catalogs and hooks used during conversion. */
  configuration: JSONConfiguration | JSONConfigurationProps;
  /** Optional callback fired when JSON input changes. */
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
  /** Logger used by downstream helpers for warnings. */
  log = console; // eslint-disable-line
  /** Active configuration used by the converter. */
  configuration!: JSONConfiguration;
  /** Callback invoked when the configured JSON input changes. */
  onJSONChange: () => void = () => {};
  /** Most recently converted JSON input. */
  json: unknown = null;
  /** Cached result for the most recently converted JSON input. */
  convertedJson: unknown = null;

  /**
   * Creates a converter for a configuration object or `JSONConfiguration` instance.
   * @param props Converter properties.
   */
  constructor(props) {
    this.setProps(props);
  }

  /** Releases resources held by the converter. Present for API symmetry. */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {}

  /**
   * Updates the active configuration and callbacks.
   * @param props Converter properties or an already-created configuration instance.
   */
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

  /**
   * Merges additional configuration into the current converter.
   * @param config Additional catalogs or hooks to merge.
   */
  mergeConfiguration(config: JSONConfiguration | JSONConfigurationProps) {
    this.configuration.merge(config instanceof JSONConfiguration ? config.getProps() : config);
  }

  /**
   * Converts a JSON object or JSON string into runtime props.
   * @param json JSON payload to convert.
   * @returns The converted runtime value.
   */
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

  /**
   * Backwards-compatible alias for `convert()`.
   * @param json JSON payload to convert.
   * @returns The converted runtime value.
   */
  convertJson(json) {
    return this.convert(json);
  }
}

/**
 * Clones the configuration before conversion so nested merges do not mutate the live converter state.
 * @param json Parsed JSON object to convert.
 * @param configuration Active configuration to clone.
 * @returns The converted runtime value.
 */
function convertJSON(json: Record<string, unknown>, configuration: JSONConfiguration) {
  // Fixup configuration
  configuration = new JSONConfiguration(configuration.getProps());
  return convertJSONRecursively(json, '', configuration);
}

/**
 * Recursively converts JSON values into runtime values using the provided configuration.
 * @param json JSON value to convert.
 * @param key Property key associated with the current value.
 * @param configuration Active conversion configuration.
 * @returns The converted runtime value.
 */
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

/**
 * Checks whether a JSON object should be instantiated as a configured class/component.
 * @param json JSON object under inspection.
 * @param configuration Active conversion configuration.
 * @returns `true` if the object contains the configured type key.
 */
function isClassInstance(json: Record<string, unknown>, configuration: JSONConfiguration) {
  const {typeKey} = configuration.config;
  const isClass = isObject(json) && Boolean(json[typeKey]);
  return isClass;
}

/**
 * Instantiates a configured class/component from a JSON object.
 * @param json JSON object describing the class instance.
 * @param configuration Active conversion configuration.
 * @returns The instantiated runtime value.
 */
function convertClassInstance(json: Record<string, unknown>, configuration: JSONConfiguration) {
  // Extract the class type field
  const {typeKey} = configuration.config;
  const type = json[typeKey];

  // Prepare a props object and ensure all values have been converted
  let props = {...json};
  delete props[typeKey];

  props = convertPlainObject(props, configuration);

  return instantiateClass(type as string, props, configuration);
}

/**
 * Executes a configured function from a JSON object.
 * @param json JSON object describing the function invocation.
 * @param configuration Active conversion configuration.
 * @returns The function result.
 */
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

/**
 * Recursively converts each property in a plain object.
 * @param json Plain object to convert.
 * @param configuration Active conversion configuration.
 * @returns A converted object with the same keys.
 */
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

/**
 * Converts a single string literal, handling configured function, constant, and enum syntax.
 * @param string String value to convert.
 * @param key Property key associated with the string value.
 * @param configuration Active conversion configuration.
 * @returns The converted runtime value or the original string.
 * @todo We could also support string syntax for hydrating other types, like regexps.
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
