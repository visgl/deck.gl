// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// TODO - default parsing code should not be part of the configuration.
import parseExpressionString from './helpers/parse-expression-string';
import assert from './utils/assert';

import {TYPE_KEY, FUNCTION_KEY} from './syntactic-sugar';

const isObject = value => value && typeof value === 'object';

export default class JSONConfiguration {
  typeKey = TYPE_KEY;
  functionKey = FUNCTION_KEY;
  log = console; // eslint-disable-line
  classes = {};
  reactComponents = {};
  enumerations = {};
  constants = {};
  functions = {};
  React = null;
  // TODO - this needs to be simpler, function conversion should be built in
  convertFunction = parseExpressionString;
  preProcessClassProps = (Class, props) => props;
  postProcessConvertedJson = json => json;

  constructor(...configurations) {
    for (const configuration of configurations) {
      this.merge(configuration);
    }
  }

  merge(configuration) {
    for (const key in configuration) {
      switch (key) {
        // DEPRECATED = For backwards compatibility, add views and layers to classes;
        case 'layers':
        case 'views':
          Object.assign(this.classes, configuration[key]);
          break;
        default:
          // Store configuration as root fields (this.classes, ...)
          if (key in this) {
            const value = configuration[key];
            this[key] = isObject(this[key]) ? Object.assign(this[key], value) : value;
          }
      }
    }
  }

  validate(configuration) {
    assert(!this.typeKey || typeof this.typeKey === 'string');
    assert(isObject(this.classes));
    return true;
  }
}
