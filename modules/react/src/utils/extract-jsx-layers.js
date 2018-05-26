import React from 'react';
import {inheritsFrom} from './inherits-from';
import {Layer} from '@deck.gl/core';

// extracts any deck.gl layers masquerading as react elements from props.children
export default function extractJSXLayers(children, layers) {
  const reactChildren = []; // extract real react elements (i.e. not deck.gl layers)
  const jsxLayers = []; // extracted layer from react children, will add to deck.gl layer array

  React.Children.forEach(children, reactElement => {
    if (reactElement) {
      // For some reason Children.forEach doesn't filter out `null`s
      const LayerType = reactElement.type;
      if (inheritsFrom(LayerType, Layer)) {
        const layer = new LayerType(reactElement.props);
        jsxLayers.push(layer);
      } else {
        reactChildren.push(reactElement);
      }
    }
  });

  // Avoid modifying layers array if no JSX layers were found
  layers = jsxLayers.length > 0 ? [...jsxLayers, ...layers] : layers

  return {layers, children: reactChildren};
}
