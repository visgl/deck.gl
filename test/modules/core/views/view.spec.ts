import test from 'tape-promise/tape';
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

test('View#imports', t => {
  t.ok(View, 'View import ok');
  t.end();
});

test('View#equals', t => {
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

  t.ok(mapView1.equals(mapView2), 'Identical view props');
  t.notOk(mapView1.equals(mapView3), 'Different view props');
  t.notOk(mapView1.equals(mapView4), 'Different type');

  t.end();
});

test('MapView', t => {
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
  t.ok(viewport instanceof Viewport, 'Mapview.makeViewport returns valid viewport');
  t.is(viewport.id, view.id, 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 12, 'Viewport has correct parameters');

  t.end();
});

test('FirstPersonView', t => {
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
  t.ok(viewport instanceof Viewport, 'Mapview.makeViewport returns valid viewport');
  t.is(viewport.id, view.id, 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.ok(viewport.zoom, 'Viewport zoom is populated');

  t.end();
});

test('GlobeView', t => {
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
  t.ok(viewport instanceof Viewport, 'Mapview.makeViewport returns valid viewport');
  t.is(viewport.id, view.id, 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 12, 'Viewport has correct parameters');

  t.end();
});

test('OrbitView', t => {
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
  t.ok(viewport instanceof Viewport, 'OrbitView.makeViewport returns valid viewport');
  t.is(viewport.id, view.id, 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 1, 'Viewport has correct parameters');

  t.end();
});

// eslint-disable-next-line complexity
test('OrbitView#project', t => {
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
  t.ok(equals(center[0], 50) && equals(center[1], 50), 'target is at viewport center');

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
  t.ok(equals(p[0], 50) && p[1] < 50 && equals(p[2], center[2]), 'z axis points up');
  p = viewport.project([0, 1, 0]);
  t.ok(equals(p[0], 50) && equals(p[1], 50) && p[2] > center[2], 'y axis points away');
  p = viewport.project([1, 0, 0]);
  t.ok(p[0] > 50 && p[1] === 50 && p[2] === center[2], 'x axis points right');

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
  t.ok(equals(p[0], 50) && equals(p[1], 50) && p[2] < center[2], 'z axis points forward');
  p = viewport.project([0, 1, 0]);
  t.ok(equals(p[0], 50) && p[1] < 50 && equals(p[2], center[2]), 'y axis points up');
  p = viewport.project([1, 0, 0]);
  t.ok(p[0] > 50 && equals(p[1], 50) && equals(p[2], center[2]), 'x axis points right');

  t.end();
});

test('OrthographicView', t => {
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
  t.ok(viewport instanceof Viewport, 'OrthographicView.makeViewport returns valid viewport');
  t.is(viewport.id, view.id, 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 9, 'Viewport has correct parameters');

  viewport = view.makeViewport({
    width: 400,
    height: 300,
    viewState: {
      target: [50, 100, 0],
      zoom: [1, 3]
    }
  });
  const center = viewport.project([50, 100, 0]);
  t.ok(equals(center[0], 200) && equals(center[1], 150), 'target is at viewport center');
  const p = viewport.project([40, 90, 0]);
  t.ok(equals(center[0] - p[0], 20) && equals(center[1] - p[1], 80), 'independent scales');

  t.end();
});

test('OrthographicView#padding', t => {
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
  t.ok(equals(center, [viewport.width, viewport.height / 4]), 'viewport center is offset');

  t.end();
});
