import * as React from 'react';
import {createElement} from 'react';
import {View} from '@deck.gl/core';
import {inheritsFrom} from './inherits-from';
import evaluateChildren, {isComponent} from './evaluate-children';

import type {Deck, DeckProps, Viewport} from '@deck.gl/core';
import type {EventManager} from 'mjolnir.js';

export type DeckGLContextValue = {
  viewport: Viewport;
  container: HTMLElement;
  eventManager: EventManager;
  onViewStateChange: DeckProps['onViewStateChange'];
};

// Iterate over views and reposition children associated with views
// TODO - Can we supply a similar function for the non-React case?
export default function positionChildrenUnderViews({
  children,
  deck,
  ContextProvider
}: {
  children: React.ReactNode[];
  deck?: Deck;
  ContextProvider?: React.Context<DeckGLContextValue>['Provider'];
}): React.ReactNode[] {
  // @ts-expect-error accessing protected property
  const {viewManager} = deck || {};

  if (!viewManager || !viewManager.views.length) {
    return [];
  }

  const views: Record<
    string,
    {
      viewport: Viewport;
      children: React.ReactNode[];
    }
  > = {};
  const defaultViewId = (viewManager.views[0] as View).id;

  // Sort children by view id
  for (const child of children) {
    // Unless child is a View, position / render as part of the default view
    let viewId = defaultViewId;
    let viewChildren = child;

    if (isComponent(child) && inheritsFrom(child.type, View)) {
      viewId = child.props.id || defaultViewId;
      viewChildren = child.props.children;
    }

    const viewport = viewManager.getViewport(viewId) as Viewport;
    const viewState = viewManager.getViewState(viewId);

    // Drop (auto-hide) elements with viewId that are not matched by any current view
    if (viewport) {
      viewState.padding = viewport.padding;
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
      const contextValue: DeckGLContextValue = {
        viewport,
        // @ts-expect-error accessing protected property
        container: deck.canvas.offsetParent,
        // @ts-expect-error accessing protected property
        eventManager: deck.eventManager,
        onViewStateChange: params => {
          params.viewId = viewId;
          // @ts-expect-error accessing protected method
          deck._onViewStateChange(params);
        }
      };
      return createElement(ContextProvider, {key, value: contextValue}, viewElement);
    }

    return viewElement;
  });
}
