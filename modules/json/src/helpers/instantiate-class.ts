// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import { JSONConfiguration } from '../json-configuration';
import{ convertFunctions } from './convert-functions';

/**
 * Attempt to instantiate a class, either as a class or as a React component
 */
export function instantiateClass(type, props, configuration: JSONConfiguration) {
  // Find the class
  const Class = configuration.config.classes[type];
  const Component = configuration.config.reactComponents[type];

  // Check that the class is in the configuration.
  if (!Class && !Component) {
    const {log} = configuration.config; // eslint-disable-line
    if (log) {
      const stringProps = JSON.stringify(props, null, 0).slice(0, 40);
      log.warn(`JSON converter: No registered class of type ${type}(${stringProps}...)  `);
    }
    return null;
  }

  if (Class) {
    return instantiateJavaScriptClass(Class, props, configuration);
  }

  return instantiateReactComponent(Component, props, configuration);
}

function instantiateJavaScriptClass(Class, props, configuration: JSONConfiguration) {
  if (configuration.preProcessClassProps) {
    props = configuration.preProcessClassProps(Class, props);
  }
  props = convertFunctions(props, configuration);
  return new Class(props);
}

function instantiateReactComponent(Component, props, configuration: JSONConfiguration) {
  const {React} = configuration.config;
  const {children = []} = props;
  delete props.children;
  if (configuration.preProcessClassProps) {
    props = configuration.preProcessClassProps(Component, props);
  }

  props = convertFunctions(props, configuration);

  return React.createElement(Component, props, children);
}
