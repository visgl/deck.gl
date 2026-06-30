// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {
  createMap3DEditorState,
  getMap3DEditorInsertIndex,
  normalizeMap3DCoordinate
} from '../../../modules/google-maps/src/map-3d-editor-state';

const PATH = [
  {lng: -73.985, lat: 40.758, altitude: 0},
  {lng: -73.98, lat: 40.764, altitude: 0},
  {lng: -73.975, lat: 40.766, altitude: 0}
];

test('Map3D editor state appends and deletes active geometry', () => {
  const editor = createMap3DEditorState({path: PATH, points: [], polygon: []});

  editor.setMode('point');
  let snapshot = editor.appendPosition({lng: -73.99, lat: 40.75, altitude: 12});

  expect(snapshot.points).toEqual([{lng: -73.99, lat: 40.75, altitude: 12}]);
  expect(snapshot.selected).toEqual({type: 'point', index: 0});

  const deleted = editor.deleteSelected();
  expect(deleted.changed).toBe(true);
  expect(deleted.snapshot.points).toEqual([]);
});

test('Map3D editor state inserts path vertices at nearest segment', () => {
  const editor = createMap3DEditorState({path: PATH, points: [], polygon: []});
  const inserted = editor.insertPathVertex({lng: -73.982, lat: 40.762, altitude: 0});

  expect(inserted.path).toHaveLength(4);
  expect(inserted.path[1]).toEqual({lng: -73.982, lat: 40.762, altitude: 0});
  expect(inserted.selected).toEqual({type: 'path', index: 1});
});

test('Map3D editor state moves selected vertices', () => {
  const editor = createMap3DEditorState({path: PATH, points: [], polygon: []});

  expect(editor.moveSelected({lng: -73.99, lat: 40.75, altitude: 0}).changed).toBe(false);

  editor.select({type: 'path', index: 1});
  const moved = editor.moveSelected({lng: -73.99, lat: 40.75, altitude: 4});

  expect(moved.changed).toBe(true);
  expect(moved.snapshot.path[1]).toEqual({lng: -73.99, lat: 40.75, altitude: 4});
  expect(moved.snapshot.selected).toEqual({type: 'path', index: 1});
});

test('Map3D editor state serializes GeoJSON features', () => {
  const editor = createMap3DEditorState({
    path: PATH,
    points: [{lng: -73.99, lat: 40.75, altitude: 2}],
    polygon: [
      {lng: -73.98, lat: 40.76, altitude: 0},
      {lng: -73.97, lat: 40.76, altitude: 0},
      {lng: -73.97, lat: 40.77, altitude: 0}
    ]
  });

  const {geojson} = editor.getSnapshot();
  expect(geojson.features.map(feature => feature.geometry.type)).toEqual([
    'LineString',
    'Polygon',
    'Point'
  ]);
  expect(geojson.features[1].geometry.coordinates[0][0]).toEqual([-73.98, 40.76, 0]);
  expect(geojson.features[1].geometry.coordinates[0].at(-1)).toEqual([-73.98, 40.76, 0]);
});

test('Map3D editor state normalizes LatLngAltitude-like values', () => {
  expect(
    normalizeMap3DCoordinate({
      toJSON: () => ({lat: 40.7, lng: -73.9, altitude: 15})
    })
  ).toEqual({lat: 40.7, lng: -73.9, altitude: 15});
  expect(normalizeMap3DCoordinate({lat: () => 40.8, lng: () => -74})).toEqual({
    lat: 40.8,
    lng: -74,
    altitude: 0
  });
  expect(normalizeMap3DCoordinate({lat: Number.NaN, lng: -74})).toBeNull();
});

test('Map3D editor state computes insert index for short paths', () => {
  expect(getMap3DEditorInsertIndex([], {lng: 0, lat: 0, altitude: 0})).toBe(0);
  expect(getMap3DEditorInsertIndex([PATH[0]], {lng: 0, lat: 0, altitude: 0})).toBe(1);
});
