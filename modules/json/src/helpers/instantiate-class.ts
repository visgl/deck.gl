// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {JSONConfiguration} from '../json-configuration';
import {convertFunctions} from './convert-functions';

/**
 * Constructor signature for configured class catalogs.
 */
type Constructor<T = unknown> = new (props: Record<string, unknown>) => T;

/**
 * Instantiates a configured class or React component from a JSON `@@type` reference.
 * @param type Catalog key resolved from JSON.
 * @param props Props to pass into the resolved target.
 * @param configuration Active conversion configuration.
 * @returns The instantiated class/component, or `null` if the type is not registered.
 */
export function instantiateClass(
  type: string,
  props: Record<string, unknown>,
  configuration: JSONConfiguration
): unknown {
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

/**
 * Instantiates a configured JavaScript class.
 * @param Class Resolved class constructor.
 * @param props Props passed to the constructor.
 * @param configuration Active conversion configuration.
 * @returns The instantiated class.
 */
function instantiateJavaScriptClass<T = unknown>(
  Class: Constructor<T>,
  props: Record<string, unknown>,
  configuration: JSONConfiguration
): unknown {
  if (configuration.preProcessClassProps) {
    props = configuration.preProcessClassProps(Class, props);
  }
  props = convertFunctions(props, configuration);
  return new Class(props);
}

/**
 * Instantiates a configured React component.
 * @param Component Resolved React component.
 * @param props Props passed to the component.
 * @param configuration Active conversion configuration.
 * @returns The created React element.
 */
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
