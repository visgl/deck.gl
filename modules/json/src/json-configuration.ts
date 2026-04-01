// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {TYPE_KEY, FUNCTION_KEY} from './syntactic-sugar';
// TODO - default parsing code should not be part of the configuration.
import {parseExpressionString} from './helpers/parse-expression-string';

const isObject = value => value && typeof value === 'object';

/**
 * Full `JSONConfiguration` input accepted by the constructor and `merge()`.
 */
export type JSONConfigurationProps = JSONConfigurationDataProps & {
  /** Optional override for accessor-string compilation. */
  convertFunction?: ConvertFunction;
  /** Optional hook for mutating props before class/component instantiation. */
  preProcessClassProps?: PreProcessClassProps;
  /** Optional hook for mutating the converted result before it is returned. */
  postProcessConvertedJson?: PostProcessConvertedJson;
};

/**
 * Serializable configuration entries consumed directly by the JSON conversion pipeline.
 */
type JSONConfigurationDataProps = {
  /** Logger used for non-fatal conversion warnings. */
  log?; // eslint-disable-line
  /** Key used to resolve class instances from JSON objects. */
  typeKey?: string;
  /** Key used to resolve callable functions from JSON objects. */
  functionKey?: string;
  /** Class catalog used to resolve `@@type` references. */
  classes?: Record<string, new (props: Record<string, unknown>) => unknown>;
  /** Enumeration catalog used to resolve `@@#GROUP.VALUE` references. */
  enumerations?: Record<string, any>;
  /** Constant catalog used to resolve `@@#CONSTANT` references. */
  constants?: Record<string, unknown>;
  /** Function catalog used to resolve `@@function` references. */
  functions?: Record<string, Function>;
  /** React runtime used when instantiating configured React components. */
  React?: {createElement: (Component, props, children) => any};
  /** React component catalog used to resolve `@@type` references. */
  reactComponents?: Record<string, Function>;
};

/**
 * Function used to compile `@@=` expression strings into accessors.
 */
type ConvertFunction = typeof parseExpressionString;
/**
 * Hook that can rewrite props before a configured class or component is instantiated.
 */
type PreProcessClassProps = (
  Class: unknown,
  props: Record<string, unknown>
) => Record<string, unknown>;
/**
 * Hook that can rewrite the fully converted JSON payload before it is returned.
 */
type PostProcessConvertedJson = (json: unknown) => unknown;

/**
 * Stores the catalogs and hooks used by `JSONConverter` to resolve JSON into runtime values.
 */
export class JSONConfiguration {
  /** Default values used when a configuration key is omitted. */
  static defaultProps: Required<JSONConfigurationDataProps> = {
    log: console, // eslint-disable-lin,
    typeKey: TYPE_KEY,
    functionKey: FUNCTION_KEY,
    classes: {},
    reactComponents: {},
    enumerations: {},
    constants: {},
    functions: {},
    React: undefined!
  };

  /** Normalized configuration catalogs consumed by the conversion helpers. */
  config: Required<JSONConfigurationDataProps> = {...JSONConfiguration.defaultProps};

  /** Hook used to compile `@@=` accessor strings into executable functions. */
  convertFunction: ConvertFunction = parseExpressionString;
  /** Hook used to rewrite props before class/component instantiation. */
  preProcessClassProps: PreProcessClassProps = (_Class, props) => props;
  /** Hook used to rewrite the converted JSON result before it is returned. */
  postProcessConvertedJson: PostProcessConvertedJson = json => json;

  /**
   * Creates a configuration from a single plain object.
   * @param configuration Configuration catalogs and hooks to register.
   */
  constructor(configuration: JSONConfigurationProps) {
    this.merge(configuration);
  }

  /**
   * Merges additional configuration catalogs and hooks into the current instance.
   * @param configuration Additional configuration values to merge.
   */
  merge(configuration: JSONConfigurationProps) {
    for (const key in configuration) {
      if (key in this.config) {
        const value = configuration[key];
        this.config[key] = isObject(this.config[key])
          ? Object.assign(this.config[key], value)
          : value;
      } else if (key === 'convertFunction' && configuration.convertFunction) {
        this.convertFunction = configuration.convertFunction;
      } else if (key === 'preProcessClassProps' && configuration.preProcessClassProps) {
        this.preProcessClassProps = configuration.preProcessClassProps;
      } else if (key === 'postProcessConvertedJson' && configuration.postProcessConvertedJson) {
        this.postProcessConvertedJson = configuration.postProcessConvertedJson;
      }
    }
  }

  /**
   * Returns a plain-object snapshot of the current configuration, including hooks.
   * @returns A complete configuration object suitable for cloning or re-use.
   */
  getProps(): JSONConfigurationProps {
    return {
      ...this.config,
      convertFunction: this.convertFunction,
      preProcessClassProps: this.preProcessClassProps,
      postProcessConvertedJson: this.postProcessConvertedJson
    };
  }
}
