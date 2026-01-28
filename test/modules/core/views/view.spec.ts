// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {
  View,
  Viewport,
  MapView,
  OrbitView,
  OrthographicView,
  FirstPersonView,
  _GlobeView as GlobeView
} from 'deck.gl';
import {equals} from '@math.gl/core';

test('View#imports', () => {
  expect(View, 'View import ok').toBeTruthy();
});

test('View#clone', () => {
  const view = new MapView({
    id: 'test-view',
    latitude: 0,
    longitude: 0,
    zoom: 1
  });
  const identicalClone = view.clone({});
  expect(
    identicalClone instanceof MapView,
    'identical clone is an instance of MapView'
  ).toBeTruthy();
  expect(identicalClone !== view, 'identical clone is a new instance').toBeTruthy();
  expect(identicalClone.equals(view), 'identical clone.equals() is true').toBeTruthy();

  const clone = view.clone({
    id: 'cloned-view',
    zoom: 5
  });
  expect(clone.id, 'modified clone id is overridden').toBe('cloned-view');
  expect(clone.props.zoom, 'modified clone prop zoom is overridden').toBe(5);
  expect(clone.props.latitude, 'other props are preserved').toBe(view.props.latitude);
  expect(clone.props.longitude, 'other props are preserved').toBe(view.props.longitude);
});

test('View#equals', () => {
  const mapView1 = new MapView({
    id: 'default-view',
    latitude: 0,
    longitude: 0,
    zoom: 11,
    position: [0, 0]
  });
  const mapView2 = new MapView({
    id: 'default-view',
    latitude: 0,
    longitude: 0,
    zoom: 11,
    position: [0, 0]
  });
  const mapView3 = new MapView({
    id: 'default-view',
    latitude: 0,
    longitude: 0,
    zoom: 11,
    position: [0, 1]
  });
  const mapView4 = new View({
    id: 'default-view',
    latitude: 0,
    longitude: 0,
    zoom: 11,
    position: [0, 0]
  });

  expect(mapView1.equals(mapView2), 'Identical view props').toBeTruthy();
  expect(mapView1.equals(mapView3), 'Different view props').toBeFalsy();
  expect(mapView1.equals(mapView4), 'Different type').toBeFalsy();
});

test('MapView', () => {
  const view = new MapView();
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 12,
      width: 200,
      height: 200
    }
  });
  expect(viewport instanceof Viewport, 'Mapview.makeViewport returns valid viewport').toBeTruthy();
  expect(viewport.id, 'Viewport has correct id').toBe(view.id);
  expect(
    viewport.width === 100 && viewport.height === 100,
    'Viewport has correct size'
  ).toBeTruthy();
  expect(viewport.zoom, 'Viewport has correct parameters').toBe(12);
});

test('FirstPersonView', () => {
  const view = new FirstPersonView();
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      longitude: -122.4,
      latitude: 37.8,
      bearing: 90,
      width: 200,
      height: 200
    }
  });
  expect(viewport instanceof Viewport, 'Mapview.makeViewport returns valid viewport').toBeTruthy();
  expect(viewport.id, 'Viewport has correct id').toBe(view.id);
  expect(
    viewport.width === 100 && viewport.height === 100,
    'Viewport has correct size'
  ).toBeTruthy();
  expect(viewport.zoom, 'Viewport zoom is populated').toBeTruthy();
});

test('GlobeView', () => {
  const view = new GlobeView();
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 12,
      width: 200,
      height: 200
    }
  });
  expect(viewport instanceof Viewport, 'Mapview.makeViewport returns valid viewport').toBeTruthy();
  expect(viewport.id, 'Viewport has correct id').toBe(view.id);
  expect(
    viewport.width === 100 && viewport.height === 100,
    'Viewport has correct size'
  ).toBeTruthy();
  expect(viewport.zoom, 'Viewport has correct parameters').toBe(12);
});

test('OrbitView', () => {
  const view = new OrbitView({id: '3d-view'});
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      target: [0, 1, 0],
      zoom: 1,
      rotationOrbit: 45,
      rotationX: -30,
      width: 200,
      height: 200
    }
  });
  expect(
    viewport instanceof Viewport,
    'OrbitView.makeViewport returns valid viewport'
  ).toBeTruthy();
  expect(viewport.id, 'Viewport has correct id').toBe(view.id);
  expect(
    viewport.width === 100 && viewport.height === 100,
    'Viewport has correct size'
  ).toBeTruthy();
  expect(viewport.zoom, 'Viewport has correct parameters').toBe(1);
});

// eslint-disable-next-line complexity
test('OrbitView#project', () => {
  let view = new OrbitView({id: '3d-view', orbitAxis: 'Z'});
  let viewport;
  let p;
  let center;

  viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      target: [1, 2, 3],
      zoom: 1,
      rotationOrbit: 0,
      rotationX: 0
    }
  });
  center = viewport.project([1, 2, 3]);
  expect(
    equals(center[0], 50) && equals(center[1], 50),
    'target is at viewport center'
  ).toBeTruthy();

  viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      target: [0, 0, 0],
      zoom: 1,
      rotationOrbit: 0,
      rotationX: 0
    }
  });
  center = viewport.project([0, 0, 0]);
  p = viewport.project([0, 0, 1]);
  expect(equals(p[0], 50) && p[1] < 50 && equals(p[2], center[2]), 'z axis points up').toBeTruthy();
  p = viewport.project([0, 1, 0]);
  expect(
    equals(p[0], 50) && equals(p[1], 50) && p[2] > center[2],
    'y axis points away'
  ).toBeTruthy();
  p = viewport.project([1, 0, 0]);
  expect(p[0] > 50 && p[1] === 50 && p[2] === center[2], 'x axis points right').toBeTruthy();

  view = new OrbitView({id: '3d-view', orbitAxis: 'Y'});
  viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      target: [0, 0, 0],
      zoom: 1,
      rotationOrbit: 0,
      rotationX: 0
    }
  });

  center = viewport.project([0, 0, 0]);
  p = viewport.project([0, 0, 1]);
  expect(
    equals(p[0], 50) && equals(p[1], 50) && p[2] < center[2],
    'z axis points forward'
  ).toBeTruthy();
  p = viewport.project([0, 1, 0]);
  expect(equals(p[0], 50) && p[1] < 50 && equals(p[2], center[2]), 'y axis points up').toBeTruthy();
  p = viewport.project([1, 0, 0]);
  expect(
    p[0] > 50 && equals(p[1], 50) && equals(p[2], center[2]),
    'x axis points right'
  ).toBeTruthy();
});

test('OrthographicView', () => {
  const view = new OrthographicView({id: '2d-view'});
  let viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      target: [0, 1, 0],
      zoom: 9,
      width: 200,
      height: 200
    }
  });
  expect(
    viewport instanceof Viewport,
    'OrthographicView.makeViewport returns valid viewport'
  ).toBeTruthy();
  expect(viewport.id, 'Viewport has correct id').toBe(view.id);
  expect(
    viewport.width === 100 && viewport.height === 100,
    'Viewport has correct size'
  ).toBeTruthy();
  expect(viewport.zoom, 'Viewport has correct parameters').toBe(9);

  viewport = view.makeViewport({
    width: 400,
    height: 300,
    viewState: {
      target: [50, 100, 0],
      zoom: [1, 3]
    }
  });
  const center = viewport.project([50, 100, 0]);
  expect(
    equals(center[0], 200) && equals(center[1], 150),
    'target is at viewport center'
  ).toBeTruthy();
  const p = viewport.project([40, 90, 0]);
  expect(
    equals(center[0] - p[0], 20) && equals(center[1] - p[1], 80),
    'independent scales'
  ).toBeTruthy();
});

test('OrthographicView#padding', () => {
  const view = new OrthographicView({id: '2d-view', padding: {bottom: '50%', left: '100%'}});
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {
      target: [0, 1, 0],
      zoom: 4
    }
  });
  const center = viewport.project([0, 1]);
  expect(
    equals(center, [viewport.width, viewport.height / 4]),
    'viewport center is offset'
  ).toBeTruthy();
});
