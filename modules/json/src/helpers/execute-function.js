// This attempts to execute a function
export function executeFunction(targetFunction, props, configuration) {
  // Find the function
  const Function = configuration.functions[targetFunction];

  // Check that the function is in the configuration.
  if (!Function) {
    const {log} = configuration; // eslint-disable-line
    const stringProps = JSON.stringify(props, null, 0).slice(0, 40);
    if (log) {
      log.warn(`JSON converter: No registered function ${targetFunction}(${stringProps}...)  `);
    }
    return null;
  }

  return Function(props);
}
