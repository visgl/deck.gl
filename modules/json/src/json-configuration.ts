// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {TYPE_KEY, FUNCTION_KEY} from './syntactic-sugar';
// TODO - default parsing code should not be part of the configuration.
import {parseExpressionString} from './helpers/parse-expression-string';

const isObject = value => value && typeof value === 'object';

export type JSONConfigurationProps = {
  typeKey?: string;
  functionKey?: string;
  log?; // eslint-disable-line
  classes?: Record<string, any>;
  reactComponents?: Record<string, any>;
  enumerations?: Record<string, any>;
  constants: Record<string, any>;
  functions: Record<string, any>;
  React: Record<string, any>;
};

export class JSONConfiguration {
  static defaultProps: Required<JSONConfigurationProps> = {
    typeKey: TYPE_KEY,
    functionKey: FUNCTION_KEY,
    log: console, // eslint-disable-lin,
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

  constructor(...configurations: JSONConfigurationProps[]) {
    for (const configuration of configurations) {
      this.merge(configuration);
    }
  }

  merge(configuration) {
    for (const key in configuration) {
      switch (key) {
        default:
          // Store configuration as root fields (this.classes, ...)
          if (key in this.config) {
            const value = configuration[key];
            this[key] = isObject(this.config[key]) ? Object.assign(this.config[key], value) : value;
          }
      }
    }
  }
}
