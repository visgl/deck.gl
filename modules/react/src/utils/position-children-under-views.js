import {createElement} from 'react';
import {View} from '@deck.gl/core';
import {inheritsFrom} from './inherits-from';
import evaluateChildren from './evaluate-children';

// Iterate over views and reposition children associated with views
// TODO - Can we supply a similar function for the non-React case?
export default function positionChildrenUnderViews({children, viewports, deck, ContextProvider}) {
  const {viewManager} = deck || {};

  if (!viewManager || !viewManager.views.length) {
    return [];
  }

  const views = {};
  const defaultViewId = viewManager.views[0].id;

  // Sort children by view id
  for (const child of children) {
    // Unless child is a View, position / render as part of the default view
    let viewId = defaultViewId;
    let viewChildren = child;

    if (inheritsFrom(child.type, View)) {
      viewId = child.props.id || defaultViewId;
      viewChildren = child.props.children;
    }

    const viewport = viewManager.getViewport(viewId);
    const viewState = viewManager.getViewState(viewId);

    // Drop (auto-hide) elements with viewId that are not matched by any current view
    if (viewport) {
      const {x, y, width, height} = viewport;
      // Resolve potentially relative dimensions using the deck.gl container size
      viewChildren = evaluateChildren(viewChildren, {
        x,
        y,
        width,
        height,
        viewport,
        viewState
      });

      if (!views[viewId]) {
        views[viewId] = {
          viewport,
          children: []
        };
      }
      views[viewId].children.push(viewChildren);
    }
  }

  // Render views
  return Object.keys(views).map(viewId => {
    const {viewport, children: viewChildren} = views[viewId];
    const {x, y, width, height} = viewport;
    const style = {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height
    };

    const key = `view-${viewId}`;
    // If children is passed as an array, React will throw the "each element in a list needs
    // a key" warning. Sending each child as separate arguments removes this requirement.
    const viewElement = createElement('div', {key, id: key, style}, ...viewChildren);

    if (ContextProvider) {
      const contextValue = {
        viewport,
        container: deck.canvas.offsetParent,
        eventManager: deck.eventManager,
        onViewStateChange: params => {
          params.viewId = viewId;
          deck._onViewStateChange(params);
        }
      };
      return createElement(ContextProvider, {key, value: contextValue}, viewElement);
    }

    return viewElement;
  });
}
