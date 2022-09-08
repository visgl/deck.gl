import convertFunctions from './convert-functions';

// This attempts to instantiate a class, either as a class or as a React component
export function instantiateClass(type, props, configuration) {
  // Find the class
  const Class = configuration.classes[type];
  const Component = configuration.reactComponents[type];

  // Check that the class is in the configuration.
  if (!Class && !Component) {
    const {log} = configuration; // eslint-disable-line
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

function instantiateJavaScriptClass(Class, props, configuration) {
  if (configuration.preProcessClassProps) {
    props = configuration.preProcessClassProps(Class, props, configuration);
  }
  props = convertFunctions(props, configuration);
  return new Class(props);
}

function instantiateReactComponent(Component, props, configuration) {
  const {React} = configuration;
  const {children = []} = props;
  delete props.children;
  if (configuration.preProcessClassProps) {
    props = configuration.preProcessClassProps(Component, props, configuration);
  }

  props = convertFunctions(props, configuration);

  return React.createElement(Component, props, children);
}
