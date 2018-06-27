import React, {createElement} from 'react';
import {inheritsFrom} from './inherits-from';
import {Layer, View} from '@deck.gl/core';

// recursively wrap render callbacks in `View`
function wrapInView(node) {
  if (!node) {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(wrapInView);
  }
  if (inheritsFrom(node.type, View)) {
    return node;
  }
  return createElement(View, {id: 'default-view'}, node);
}

// extracts any deck.gl layers masquerading as react elements from props.children
export default function extractJSXLayers(children, layers) {
  const reactChildren = []; // extract real react elements (i.e. not deck.gl layers)
  const jsxLayers = []; // extracted layer from react children, will add to deck.gl layer array

  // React.children
  React.Children.forEach(wrapInView(children), reactElement => {
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
  layers = jsxLayers.length > 0 ? [...jsxLayers, ...layers] : layers;

  return {layers, children: reactChildren};
}
