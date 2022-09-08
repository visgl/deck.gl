// This attempts to execute a function
export function executeFunction(targetFunction, props, configuration) {
  // Find the function
  const matchedFunction = configuration.functions[targetFunction];

  // Check that the function is in the configuration.
  if (!matchedFunction) {
    const {log} = configuration; // eslint-disable-line
    if (log) {
      const stringProps = JSON.stringify(props, null, 0).slice(0, 40);
      log.warn(`JSON converter: No registered function ${targetFunction}(${stringProps}...)  `);
    }
    return null;
  }

  return matchedFunction(props);
}
