// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {TYPE_KEY, FUNCTION_KEY} from './syntactic-sugar';
// TODO - default parsing code should not be part of the configuration.
import {parseExpressionString} from './helpers/parse-expression-string';

const isObject = value => value && typeof value === 'object';

export type JSONConfigurationProps = {
  log?; // eslint-disable-line
  typeKey?: string;
  functionKey?: string;
  classes?: Record<string, new (props: Record<string, unknown>) => unknown>;
  enumerations?: Record<string, any>;
  constants: Record<string, unknown>;
  functions: Record<string, Function>;
  React?: {createElement: (Component, props, children) => any};
  reactComponents?: Record<string, Function>;
};

export class JSONConfiguration {
  static defaultProps: Required<JSONConfigurationProps> = {
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

  config: Required<JSONConfigurationProps> = {...JSONConfiguration.defaultProps};

  // TODO - this needs to be simpler, function conversion should be built in
  convertFunction = parseExpressionString;
  preProcessClassProps = (Class, props) => props;
  postProcessConvertedJson = json => json;

  constructor(configuration: JSONConfigurationProps) {
    this.merge(configuration);
  }

  merge(configuration: JSONConfigurationProps) {
    for (const key in configuration) {
      switch (key) {
        default:
          // Store configuration as root fields (this.classes, ...)
          if (key in this.config) {
            const value = configuration[key];
            this.config[key] = isObject(this.config[key])
              ? Object.assign(this.config[key], value)
              : value;
          }
      }
    }
  }
}
