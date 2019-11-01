import parseExpressionString from './parse-expression-string';
import {getPropTypes, isFunctionProp} from './deck-prop-types';

// Try to determine if any props are function valued
// and if so convert their string values to functions
export default function convertFunctions(Class, props, configuration) {
  const propTypes = getPropTypes(Class);

  // Use deck.gl prop types if available.
  return convertFunctionsUsingPropTypes(props, propTypes, configuration);
}

function convertFunctionsUsingPropTypes(props, propTypes, configuration) {
  const replacedProps = {};
  for (const propName in props) {
    let propValue = props[propName];

    // Parse string valued expressions
    const isFunction = isFunctionProp(propTypes, propName);

    // Parse string as "expression", return equivalent JavaScript function
    if (isFunction && typeof propValue === 'string') {
      const isAccessor = true;
      propValue = parseExpressionString(propValue, configuration, isAccessor);
    }

    // Invalid functions return null, show default value instead.
    if (propValue) {
      replacedProps[propName] = propValue;
    }
  }

  return replacedProps;
}
