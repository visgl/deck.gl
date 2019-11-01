// NOTE - This is sniffing for deck.gl prop types
// TODO - We may want to do something similar for React `prop-types`
// TODO - We need something similar for non-deck, non-React classes
// TODO - The deck prop types system could potentially be exported as a general prop types package....

export function getPropTypes(Class) {
  let propTypes = Class && Class._propTypes && Class._propTypes;
  // HACK: Trigger generation of propTypes
  if (!propTypes && Class && Class.defaultProps) {
    new Class({}); // eslint-disable-line no-new
    propTypes = Class && Class._propTypes && Class._propTypes;
  }
  return propTypes;
}

export function isFunctionProp(propTypes, propName) {
  const propType = propTypes && propTypes[propName];
  if (!propType) {
    // TODO - simple heuristic if prop types are not avaialable
    return propName.startsWith('get');
  }

  const type = typeof propType === 'object' && propType.type;
  switch (type) {
    case 'accessor':
    case 'function':
      return true;
    default:
      return false;
  }
}
