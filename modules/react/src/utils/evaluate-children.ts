// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {cloneElement} from 'react';

const MAP_STYLE = {position: 'absolute', zIndex: -1};

export default function evaluateChildren(
  children: React.ReactNode | Function,
  childProps: any
): React.ReactNode {
  if (typeof children === 'function') {
    return children(childProps);
  }
  if (Array.isArray(children)) {
    return children.map(child => evaluateChildren(child, childProps));
  }
  if (isComponent(children)) {
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
  }

  return children;
}

export function isComponent(child: React.ReactNode): child is React.ReactElement {
  return (child && typeof child === 'object' && 'type' in child) || false;
}

function isReactMap(child: React.ReactElement): boolean {
  return child.props?.mapStyle;
}

function needsDeckGLViewProps(child: React.ReactElement): boolean {
  const componentClass = child.type;
  // @ts-expect-error deckGLViewProps is a custom hack defined on the constructor (nebula.gl)
  return componentClass && componentClass.deckGLViewProps;
}
