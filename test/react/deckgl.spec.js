/* eslint-disable no-unused-vars */
import test from 'tape-catch';
import React, {createElement} from 'react';
import utils from 'react-addons-test-utils';

import DeckGL from 'deck.gl/react';
import {Viewport, WebMercatorViewport} from 'deck.gl/lib/viewports';

const TEST_DATA = {
  mapState: {
    width: 793,
    height: 775,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    bearing: -44.48928121059271,
    pitch: 43.670797287818566
    // altitude: undefined
  }
};

test('Rendering DeckGL overlay without viewport params', t => {
  // TODO - should this work? A default WebMercatorViewport?
  const component = utils.renderIntoDocument(
    createElement(DeckGL, {width: 100, height: 100, layers: []})
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

test('Rendering DeckGL overlay with viewport params', t => {
  const component = utils.renderIntoDocument(
    createElement(DeckGL, Object.assign({}, TEST_DATA.mapState, {layers: []}))
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

test('Rendering DeckGL overlay with Viewport', t => {
  const viewport = new Viewport();
  const component = utils.renderIntoDocument(
    createElement(DeckGL, {width: 100, height: 100, viewport, layers: []})
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

test('Rendering DeckGL overlay with WebMercatorViewport', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  const component = utils.renderIntoDocument(
    createElement(DeckGL, {width: 100, height: 100, viewport, layers: []})
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});
