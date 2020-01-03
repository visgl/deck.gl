import {cloneElement} from 'react';

const MAP_STYLE = {position: 'absolute', zIndex: -1};

export default function evaluateChildren(children, childProps) {
  if (!children) {
    return children;
  }
  if (typeof children === 'function') {
    return children(childProps);
  }
  if (Array.isArray(children)) {
    return children.map(child => evaluateChildren(child, childProps));
  }

  // Special treatment for react-map-gl's Map component
  // to support shorthand use case <DeckGL><StaticMap /></DeckGL>
  if (isReactMap(children)) {
    // Place map under the canvas
    childProps.style = MAP_STYLE;
    return cloneElement(children, childProps);
  }
  if (needsDeckGLViewProps(children)) {
    return cloneElement(children, childProps);
  }
  return children;
}

function isReactMap(child) {
  const componentClass = child && child.type;
  const componentProps = componentClass && componentClass.defaultProps;
  return componentProps && componentProps.mapStyle;
}

function needsDeckGLViewProps(child) {
  const componentClass = child && child.type;
  return componentClass && componentClass.deckGLViewProps;
}
