/* eslint-disable no-unused-vars */
import test from 'tape-catch';
import React, {createElement, Fragment} from 'react';

import {View, MapView, FirstPersonView, ScatterplotLayer, LineLayer} from 'deck.gl';
import extractJSXLayers from '@deck.gl/react/utils/extract-jsx-layers';

const noop = () => {};
const mapView = new MapView({id: 'map', height: '50%'});
const firstPersonView = new FirstPersonView({id: '1st-person', y: '50%', height: '50%', fovy: 45});
const scatterplotLayer = new ScatterplotLayer({});
const lineLayer = new LineLayer({});

const reactMapView = createElement(MapView, {id: 'map'}, noop);
const reactLineLayer = createElement(LineLayer, {});

const TEST_CASES = [
  {
    input: {
      children: null,
      views: null,
      layers: []
    },
    output: {
      children: [],
      views: null,
      layers: []
    },
    title: 'empty children'
  },
  {
    input: {
      children: noop,
      views: null,
      layers: []
    },
    output: {
      children: [createElement(View, {}, noop)],
      views: null,
      layers: []
    },
    title: 'single render callback'
  },
  {
    input: {
      children: ['Text', [noop, null]],
      views: null,
      layers: []
    },
    output: {
      children: ['Text', createElement(View, {}, noop)],
      views: null,
      layers: []
    },
    title: 'nested children'
  },
  {
    input: {
      children: reactMapView,
      views: null,
      layers: []
    },
    output: {
      children: [reactMapView],
      views: [new MapView(reactMapView.props)],
      layers: []
    },
    title: 'JSX views'
  },
  {
    input: {
      children: reactMapView,
      views: mapView,
      layers: []
    },
    output: {
      children: [reactMapView],
      views: [mapView],
      layers: []
    },
    title: 'JSX views with views prop'
  },
  {
    input: {
      children: reactMapView,
      views: [mapView, firstPersonView],
      layers: []
    },
    output: {
      children: [reactMapView],
      views: [mapView, firstPersonView],
      layers: []
    },
    title: 'JSX views with views prop'
  },
  {
    input: {
      children: reactMapView,
      views: firstPersonView,
      layers: []
    },
    output: {
      children: [reactMapView],
      views: [new MapView(reactMapView.props), firstPersonView],
      layers: []
    },
    title: 'JSX views with views prop'
  },
  {
    input: {
      children: createElement(View, {id: 'not-map'}, noop),
      views: mapView,
      layers: []
    },
    output: {
      children: [createElement(View, {id: 'not-map'}, noop)],
      views: mapView,
      layers: []
    },
    title: 'JSX views with views prop'
  },
  {
    input: {
      children: reactLineLayer,
      views: null,
      layers: []
    },
    output: {
      children: [],
      views: null,
      layers: [lineLayer]
    },
    title: 'JSX layers'
  },
  {
    input: {
      children: reactLineLayer,
      views: null,
      layers: [scatterplotLayer]
    },
    output: {
      children: [],
      views: null,
      layers: [lineLayer, scatterplotLayer]
    },
    title: 'JSX layers with layers prop'
  },
  {
    input: {
      children: [reactMapView, createElement(Fragment, {}, reactLineLayer), noop],
      views: null,
      layers: []
    },
    output: {
      children: [reactMapView, createElement(View, {}, noop)],
      views: [new MapView(reactMapView.props)],
      layers: [lineLayer]
    },
    title: 'fragment with single child'
  },
  {
    input: {
      children: [createElement(Fragment, {}, reactMapView, reactLineLayer), noop],
      views: null,
      layers: []
    },
    output: {
      children: [reactMapView, createElement(View, {}, noop)],
      views: [new MapView(reactMapView.props)],
      layers: [lineLayer]
    },
    title: 'fragment with statically known children'
  },
  {
    input: {
      children: [createElement(Fragment, {}, [reactMapView, reactLineLayer]), noop],
      views: null,
      layers: []
    },
    output: {
      children: [reactMapView, createElement(View, {}, noop)],
      views: [new MapView(reactMapView.props)],
      layers: [lineLayer]
    },
    title: 'fragment with dynamic children'
  },
  {
    input: {
      children: [reactMapView, reactLineLayer, noop],
      views: null,
      layers: []
    },
    output: {
      children: [reactMapView, createElement(View, {}, noop)],
      views: [new MapView(reactMapView.props)],
      layers: [lineLayer]
    },
    title: 'mixed children'
  }
];

function deepCompareDeckObjects(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((ai, i) => deepCompareDeckObjects(ai, b[i]));
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  for (const key in a.props) {
    if (a.props[key] !== b.props[key]) {
      return false;
    }
  }
  return true;
}

test('React#extractJSXLayers', t => {
  for (const testCase of TEST_CASES) {
    t.comment(testCase.title);
    const result = extractJSXLayers(testCase.input);
    t.deepEqual(result.children, testCase.output.children, 'extracts React children');
    t.ok(deepCompareDeckObjects(result.views, testCase.output.views), 'extracts views');
    t.ok(deepCompareDeckObjects(result.layers, testCase.output.layers), 'extracts layers');
  }

  t.end();
});
