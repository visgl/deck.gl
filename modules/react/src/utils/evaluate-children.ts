// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {cloneElement} from 'react';

// No z-index: it would make the map a stacking context and trap its controls under the canvas
const MAP_STYLE = {position: 'absolute'};

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
      childProps.style = MAP_STYLE;
      return cloneElement(children, childProps);
    }
    if (needsDeckGLViewProps(children)) {
      return cloneElement(children, childProps);
    }
  }

  return children;
}

/** Moves the maps found by `evaluateChildren` to `maps`, which are rendered before the canvas */
export function extractMaps(children: React.ReactNode, maps: React.ReactNode[]): React.ReactNode {
  if (Array.isArray(children)) {
    return children.map(child => extractMaps(child, maps));
  }
  if (isComponent(children) && children.props.style === MAP_STYLE) {
    maps.push(children);
    return null;
  }
  return children;
}

export function isComponent(
  child: React.ReactNode
): child is React.ReactElement<Record<string, any>> {
  return React.isValidElement(child);
}

function isReactMap(child: React.ReactElement<Record<string, any>>): boolean {
  return child.props?.mapStyle;
}

function needsDeckGLViewProps(child: React.ReactElement<Record<string, any>>): boolean {
  const componentClass = child.type;
  // @ts-expect-error deckGLViewProps is a custom hack defined on the constructor (nebula.gl)
  return componentClass && componentClass.deckGLViewProps;
}
