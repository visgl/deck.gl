// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import React, {createElement} from 'react';
import positionChildrenUnderViews from '@deck.gl/react/utils/position-children-under-views';
import {DeckGlContext} from '@deck.gl/react/utils/deckgl-context';
import {MapView, OrthographicView, View} from '@deck.gl/core';

const TEST_VIEW_STATES = {
  map: {longitude: -122, latitude: 38, zoom: 12},
  ortho: {target: [2, 1, 0], zoom: 3}
};
const TEST_VIEWS = {
  map: new MapView({id: 'map', width: '50%'}),
  ortho: new OrthographicView({id: 'ortho', x: '50%', width: '50%'})
};
const TEST_VIEWPORTS = {
  map: TEST_VIEWS.map.makeViewport({width: 800, height: 500, viewState: TEST_VIEW_STATES.map}),
  ortho: TEST_VIEWS.ortho.makeViewport({width: 800, height: 500, viewState: TEST_VIEW_STATES.ortho})
};

const dummyViewManager = {
  views: Object.values(TEST_VIEWS),
  getViewport: id => TEST_VIEWPORTS[id],
  getViewState: id => TEST_VIEW_STATES[id]
};

const TEST_CHILDREN = [
  createElement(View, {id: 'none'}, createElement('div', {id: 'element-without-view'})),
  createElement(View, null, props =>
    createElement('div', Object.assign({id: 'function-under-view'}, props))
  ),
  createElement(
    OrthographicView,
    {id: 'ortho'},
    createElement('div', {id: 'element-under-view', style: {zIndex: 1}})
  ),
  createElement('div', {id: 'element-without-view', style: {zIndex: 2}})
];

test('positionChildrenUnderViews#before initialization', () => {
  let children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: null
  });
  expect(children.length, 'Should not fail if deck is not initialized').toBe(0);

  children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {}
  });
  expect(children.length, 'Should not fail if deck is not initialized').toBe(0);

  children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {viewManager: {views: []}}
  });
  expect(children.length, 'Should not fail if deck has no view').toBe(0);
});

test('positionChildrenUnderViews', () => {
  const children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {viewManager: dummyViewManager, canvas: document.createElement('canvas')}
  });
  expect(children.length, 'Returns wrapped children').toBe(2);

  expect(children[0].key, 'Child has deck context').toBe('view-map-context');
  expect(children[0].type, 'view is wrapped in DeckGlContext.Provider').toBe(
    DeckGlContext.Provider
  );
  expect(children[1].key, 'Child has deck context').toBe('view-ortho-context');
  expect(children[1].type, 'view is wrapped in DeckGlContext.Provider').toBe(
    DeckGlContext.Provider
  );

  // check first view
  let wrappedView = children[0].props.children;
  expect(wrappedView.key, 'Has map view').toBe('view-map');
  expect(wrappedView.props.style.left, 'Wrapper component has x position').toBe(0);

  // check first view's children
  let wrappedChild = wrappedView.props.children;
  expect(wrappedChild.length, 'Returns wrapped children').toBe(2);
  expect(wrappedChild[0].props.id, 'function child preserves id').toBe('function-under-view');
  expect(wrappedChild[0].props.width, 'function child has width').toBe(400);
  expect(wrappedChild[0].props.viewState, 'function child has viewState').toBe(
    TEST_VIEW_STATES.map
  );
  expect(wrappedChild[1].props.id, 'element child preserves id').toBe('element-without-view');

  // check second view
  wrappedView = children[1].props.children;
  expect(wrappedView.key, 'Has ortho view').toBe('view-ortho');
  expect(wrappedView.props.style.left, 'Wrapper component has x position').toBe(400);

  // check second view's child
  wrappedChild = wrappedView.props.children;
  expect(wrappedChild.props.id, 'element child preserves id').toBe('element-under-view');
});

test('positionChildrenUnderViews#override ContextProvider', () => {
  const context = React.createContext();

  const children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {
      viewManager: dummyViewManager,
      canvas: {}
    },
    ContextProvider: context.Provider
  });

  expect(children.length, 'Returns wrapped children').toBe(2);

  expect(children[0].key, 'Child has deck context').toBe('view-map-context');
  expect(children[0].type, 'child is wrapped in ContextProvider').toBe(context.Provider);
  expect(children[0].props.value.viewport, 'Context has viewport').toBe(TEST_VIEWPORTS.map);

  expect(children[1].key, 'Child has deck context').toBe('view-ortho-context');
  expect(children[1].type, 'child is wrapped in ContextProvider').toBe(context.Provider);
  expect(children[1].props.value.viewport, 'Context has viewport').toBe(TEST_VIEWPORTS.ortho);
});
