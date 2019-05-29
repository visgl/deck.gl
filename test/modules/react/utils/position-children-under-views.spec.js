import test from 'tape-catch';
import React, {createElement} from 'react';
import positionChildrenUnderViews from '@deck.gl/react/utils/position-children-under-views';
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

test('positionChildrenUnderViews#before initialization', t => {
  let children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: null
  });
  t.is(children.length, 0, 'Should not fail if deck is not initialized');

  children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {}
  });
  t.is(children.length, 0, 'Should not fail if deck is not initialized');

  children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {viewManager: {views: []}}
  });
  t.is(children.length, 0, 'Should not fail if deck has no view');

  t.end();
});

test('positionChildrenUnderViews', t => {
  const children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {viewManager: dummyViewManager}
  });
  t.is(children.length, 4, 'Returns wrapped children');

  t.notOk(children[0], 'Invisible view');
  t.ok(children[1].key && children[2].key && children[3].key, 'Wrapper components have keys');
  t.is(children[1].props.style.left, 0, 'Wrapper component has x position');
  t.is(children[2].props.style.left, 400, 'Wrapper component has x position');
  t.is(children[2].props.style.zIndex, 1, 'Wrapper component has z-index');
  t.is(children[3].props.style.zIndex, 2, 'Wrapper component has z-index');

  let wrappedChild = children[1].props.children;
  t.is(wrappedChild.props.id, 'function-under-view', 'function child preserves id');
  t.is(wrappedChild.props.width, 400, 'function child has width');
  t.is(wrappedChild.props.viewState, TEST_VIEW_STATES.map, 'function child has viewState');

  wrappedChild = children[2].props.children;
  t.is(wrappedChild.props.id, 'element-under-view', 'element child preserves id');
  t.is(wrappedChild.props.width, 400, 'element child has width');
  t.is(wrappedChild.props.viewState, TEST_VIEW_STATES.ortho, 'element child has viewState');

  wrappedChild = children[3].props.children;
  t.is(wrappedChild.props.id, 'element-without-view', 'element child preserves id');
  t.is(wrappedChild.props.width, 400, 'element child has width');
  t.is(wrappedChild.props.viewState, TEST_VIEW_STATES.map, 'element child has viewState');

  t.end();
});

test('positionChildrenUnderViews#ContextProvider', t => {
  const context = React.createContext();

  const children = positionChildrenUnderViews({
    children: TEST_CHILDREN,
    deck: {
      viewManager: dummyViewManager,
      canvas: {}
    },
    ContextProvider: context.Provider
  });

  t.notOk(children[0], 'Invisible view');

  let wrappedChild = children[1].props.children;
  t.is(wrappedChild.type, context.Provider, 'child is wrapped in ContextProvider');
  t.is(wrappedChild.props.value.viewport, TEST_VIEWPORTS.map, 'Context has viewport');

  wrappedChild = children[2].props.children;
  t.is(wrappedChild.type, context.Provider, 'child is wrapped in ContextProvider');
  t.is(wrappedChild.props.value.viewport, TEST_VIEWPORTS.ortho, 'Context has viewport');
  t.end();
});
