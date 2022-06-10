import * as React from 'react';
import {createElement} from 'react';
import {inheritsFrom} from './inherits-from';
import {Layer, View} from '@deck.gl/core';
import {isComponent} from './evaluate-children';
import type {LayersList} from '@deck.gl/core';

// recursively wrap render callbacks in `View`
function wrapInView(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'function') {
    // React.Children does not traverse functions.
    // All render callbacks must be protected under a <View>
    // @ts-expect-error View is not a ReactJSXElement constructor. Only used as a temporary wrapper and will be removed in extractJSXLayers
    return createElement(View, {}, node);
  }
  if (Array.isArray(node)) {
    return node.map(wrapInView);
  }
  if (isComponent(node)) {
    if (node.type === React.Fragment) {
      return wrapInView(node.props.children);
    }
    if (inheritsFrom(node.type, View)) {
      return node;
    }
  }
  return node;
}

// extracts any deck.gl layers masquerading as react elements from props.children
export default function extractJSXLayers({
  children,
  layers = [],
  views = null
}: {
  children?: React.ReactNode;
  layers?: LayersList;
  views?: View | View[] | null;
}): {
  children: React.ReactNode[];
  layers: LayersList;
  views: View | View[] | null;
} {
  const reactChildren: React.ReactNode[] = []; // extract real react elements (i.e. not deck.gl layers)
  const jsxLayers: LayersList = []; // extracted layer from react children, will add to deck.gl layer array
  const jsxViews: Record<string, View> = {};

  // React.children
  React.Children.forEach(wrapInView(children), reactElement => {
    if (isComponent(reactElement)) {
      // For some reason Children.forEach doesn't filter out `null`s
      const ElementType = reactElement.type;
      if (inheritsFrom(ElementType, Layer)) {
        const layer = createLayer(ElementType, reactElement.props);
        jsxLayers.push(layer);
      } else {
        reactChildren.push(reactElement);
      }

      // empty id => default view
      if (inheritsFrom(ElementType, View) && ElementType !== View && reactElement.props.id) {
        // @ts-ignore Cannot instantiate an abstract class (View)
        const view = new ElementType(reactElement.props);
        jsxViews[view.id] = view;
      }
    } else if (reactElement) {
      reactChildren.push(reactElement);
    }
  });

  // Avoid modifying views if no JSX views were found
  if (Object.keys(jsxViews).length > 0) {
    // If a view is specified in both views prop and JSX, use the one in views
    if (Array.isArray(views)) {
      views.forEach(view => {
        jsxViews[view.id] = view;
      });
    } else if (views) {
      jsxViews[views.id] = views;
    }
    views = Object.values(jsxViews);
  }

  // Avoid modifying layers array if no JSX layers were found
  layers = jsxLayers.length > 0 ? [...jsxLayers, ...layers] : layers;

  return {layers, children: reactChildren, views};
}

function createLayer(LayerType: typeof Layer, reactProps: any): Layer {
  const props = {};
  // Layer.defaultProps is treated as ReactElement.defaultProps and merged into react props
  // Remove them
  const defaultProps = LayerType.defaultProps || {};
  for (const key in reactProps) {
    if (defaultProps[key] !== reactProps[key]) {
      props[key] = reactProps[key];
    }
  }
  // @ts-ignore Cannot instantiate an abstract class (Layer)
  return new LayerType(props);
}
