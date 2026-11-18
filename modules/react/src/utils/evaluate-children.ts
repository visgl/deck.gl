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
      // Only the basemap canvas belongs below Deck; HTML controls stay above it.
      return cloneElement(children, {
        ...childProps,
        style: MAP_STYLE,
        onLoad: event => {
          const canvasContainer = event.target.getCanvasContainer();
          Object.assign(canvasContainer.style, {position: 'absolute', inset: 0, zIndex: -1});
          // Keep the entire map below Deck until its canvas is ready.
          event.target.getContainer().style.zIndex = 'auto';
          children.props.onLoad?.(event);
        }
      });
    }
    if (needsDeckGLViewProps(children)) {
      return cloneElement(children, childProps);
    }
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
