// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {createElement} from 'react';
import {View} from '@deck.gl/core';
import {inheritsFrom} from './inherits-from';
import evaluateChildren, {extractMaps, isComponent} from './evaluate-children';

import type {ViewOrViews} from '../deckgl';
import type {Deck, Viewport} from '@deck.gl/core';
import {DeckGlContext, type DeckGLContextValue} from './deckgl-context';

// Iterate over views and reposition children associated with views.
// `maps` go before the canvas and `children` after it, so that z-index free siblings of the canvas
// stack around it, while map controls (z-index: 2) can still rise above it.
// TODO - Can we supply a similar function for the non-React case?
export default function positionChildrenUnderViews<ViewsT extends ViewOrViews>({
  children,
  deck,
  ContextProvider = DeckGlContext.Provider
}: {
  children: React.ReactNode[];
  deck?: Deck<ViewsT>;
  ContextProvider?: React.Context<DeckGLContextValue>['Provider'];
}): {maps: React.ReactNode[]; children: React.ReactNode[]} {
  // @ts-expect-error accessing protected property
  const {viewManager} = deck || {};

  if (!viewManager || !viewManager.views.length) {
    return {maps: [], children: []};
  }

  const views: Record<
    string,
    {
      viewport: Viewport;
      maps: React.ReactNode[];
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
          maps: [],
          children: []
        };
      }
      views[viewId].children.push(extractMaps(viewChildren, views[viewId].maps));
    }
  }

  // Render views
  const maps: React.ReactNode[] = [];
  const wrappedChildren = Object.keys(views).map(viewId => {
    const {viewport, maps: viewMaps, children: viewChildren} = views[viewId];
    const {x, y, width, height} = viewport;
    const style = {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height
    };

    const contextValue: DeckGLContextValue = {
      deck,
      viewport,
      // @ts-expect-error accessing protected property
      container: deck.canvas.offsetParent,
      // @ts-expect-error accessing protected property
      eventManager: deck.eventManager,
      onViewStateChange: params => {
        params.viewId = viewId;
        // @ts-expect-error accessing protected method
        deck._onViewStateChange(params);
      },
      widgets: []
    };

    const wrapChildren = (key: string, elements: React.ReactNode[]) =>
      // If children is passed as an array, React will throw the "each element in a list needs
      // a key" warning. Sending each child as separate arguments removes this requirement.
      createElement(
        ContextProvider,
        {key: `${key}-context`, value: contextValue},
        createElement('div', {key, id: key, style}, ...elements)
      );

    if (viewMaps.length) {
      maps.push(wrapChildren(`view-${viewId}--map`, viewMaps));
    }
    return wrapChildren(`view-${viewId}`, viewChildren);
  });

  return {maps, children: wrappedChildren};
}
