import test from 'tape-catch';
import {View, Viewport, MapView, OrbitView, OrthographicView} from 'deck.gl';

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

test('View#makeViewport', t => {
  let viewport;

  viewport = new MapView({id: 'map-view'}).makeViewport({
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
  t.is(viewport.id, 'map-view', 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 12, 'Viewport has correct parameters');

  viewport = new OrbitView({id: '3d-view'}).makeViewport({
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
  t.is(viewport.id, '3d-view', 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 1, 'Viewport has correct parameters');

  viewport = new OrthographicView({id: '2d-view'}).makeViewport({
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
  t.is(viewport.id, '2d-view', 'Viewport has correct id');
  t.ok(viewport.width === 100 && viewport.height === 100, 'Viewport has correct size');
  t.is(viewport.zoom, 9, 'Viewport has correct parameters');

  t.end();
});
