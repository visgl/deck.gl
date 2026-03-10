// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {resolveLayerGroups} from '@deck.gl/mapbox/resolve-layer-groups';

import MockMapboxMap from './mapbox-gl-mock/map';

test('MapboxOverlay#resolveLayerGroups - basic group creation', async () => {
  const MAP_STYLE = {
    layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });

  // Wait for style to load
  await sleep(10);

  const layers = [
    new ScatterplotLayer({id: 'poi', beforeId: 'park'}),
    new ArcLayer({id: 'connection', beforeId: 'park'})
  ];

  resolveLayerGroups(map, undefined, layers);

  const groupId = 'deck-layer-group-before:park';

  expect(map.getLayer(groupId), 'Group layer exists').toBeTruthy();
  expect(map.getLayer('poi'), 'Individual layer poi not added to map').toBeFalsy();
  expect(map.getLayer('connection'), 'Individual layer connection not added to map').toBeFalsy();

  const expectedOrder = ['water', groupId, 'park', 'building'];
  expect(map.style._order, 'Group is positioned before park').toEqual(expectedOrder);
});

test('MapboxOverlay#resolveLayerGroups - multiple groups', async () => {
  const MAP_STYLE = {
    layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });

  // Wait for style to load
  await sleep(10);

  const layers = [
    new ScatterplotLayer({id: 'poi1', beforeId: 'park'}),
    new ScatterplotLayer({id: 'poi2', slot: 'top'}),
    new ArcLayer({id: 'arc1', beforeId: 'water'}),
    new ArcLayer({id: 'arc2'}) // no beforeId/slot
  ];

  resolveLayerGroups(map, undefined, layers);

  const group1 = 'deck-layer-group-before:park';
  const group2 = 'deck-layer-group-slot:top';
  const group3 = 'deck-layer-group-before:water';
  const group4 = 'deck-layer-group-last';

  expect(map.getLayer(group1), 'Group 1 exists (before park:top)').toBeTruthy();
  expect(map.getLayer(group2), 'Group 2 exists (slot top)').toBeTruthy();
  expect(map.getLayer(group3), 'Group 3 exists (before water)').toBeTruthy();
  expect(map.getLayer(group4), 'Group 4 exists (last)').toBeTruthy();

  expect(map.getLayer('poi1'), 'Individual layer poi1 not added').toBeFalsy();
  expect(map.getLayer('poi2'), 'Individual layer poi2 not added').toBeFalsy();
  expect(map.getLayer('arc1'), 'Individual layer arc1 not added').toBeFalsy();
  expect(map.getLayer('arc2'), 'Individual layer arc2 not added').toBeFalsy();

  const expectedOrder = [group3, 'water', group1, 'park', 'building', group2, group4];
  expect(map.style._order, 'Groups are positioned correctly').toEqual(expectedOrder);
});

test('MapboxOverlay#resolveLayerGroups - group removal', async () => {
  const MAP_STYLE = {
    layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });

  // Wait for style to load
  await sleep(10);

  const layers1 = [
    new ScatterplotLayer({id: 'poi1', beforeId: 'park'}),
    new ScatterplotLayer({id: 'poi2', beforeId: 'park'})
  ];

  resolveLayerGroups(map, undefined, layers1);

  const parkGroup = 'deck-layer-group-before:park';
  expect(map.getLayer(parkGroup), 'Park group exists after initial add').toBeTruthy();

  // Remove all layers
  resolveLayerGroups(map, layers1, []);
  expect(map.getLayer(parkGroup), 'Park group removed when all layers removed').toBeFalsy();

  const expectedOrderAfterRemoval = ['water', 'park', 'building'];
  expect(map.style._order, 'Map order restored to original').toEqual(expectedOrderAfterRemoval);

  // Add different group
  const layers2 = [new ArcLayer({id: 'arc1', beforeId: 'water'})];

  resolveLayerGroups(map, [], layers2);

  const waterGroup = 'deck-layer-group-before:water';
  expect(map.getLayer(waterGroup), 'Water group exists').toBeTruthy();
  expect(map.getLayer(parkGroup), 'Park group still does not exist').toBeFalsy();

  const expectedOrderFinal = [waterGroup, 'water', 'park', 'building'];
  expect(map.style._order, 'New group positioned correctly').toEqual(expectedOrderFinal);
});

test('MapboxOverlay#resolveLayerGroups - group reordering', async () => {
  const MAP_STYLE = {
    layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });

  // Wait for style to load
  await sleep(10);

  const layers1 = [new ScatterplotLayer({id: 'poi', beforeId: 'building'})];

  resolveLayerGroups(map, undefined, layers1);

  const buildingGroup = 'deck-layer-group-before:building';
  expect(map.getLayer(buildingGroup), 'Building group exists').toBeTruthy();

  let expectedOrder = ['water', 'park', buildingGroup, 'building'];
  expect(map.style._order, 'Group positioned before building').toEqual(expectedOrder);

  // Update to different beforeId
  const layers2 = [new ScatterplotLayer({id: 'poi', beforeId: 'park'})];

  resolveLayerGroups(map, layers1, layers2);

  const parkGroup = 'deck-layer-group-before:park';
  expect(map.getLayer(parkGroup), 'Park group exists after update').toBeTruthy();
  expect(map.getLayer(buildingGroup), 'Building group removed').toBeFalsy();

  expectedOrder = ['water', parkGroup, 'park', 'building'];
  expect(map.style._order, 'Group moved to before park').toEqual(expectedOrder);
});

test('MapboxOverlay#resolveLayerGroups - slot-based grouping', async () => {
  const MAP_STYLE = {
    layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });

  // Wait for style to load
  await sleep(10);

  const layers = [
    new ScatterplotLayer({id: 'bottom-layer', slot: 'bottom'}),
    new ScatterplotLayer({id: 'middle-layer', slot: 'middle'}),
    new ScatterplotLayer({id: 'top-layer', slot: 'top'})
  ];

  resolveLayerGroups(map, undefined, layers);

  const bottomGroup = 'deck-layer-group-slot:bottom';
  const middleGroup = 'deck-layer-group-slot:middle';
  const topGroup = 'deck-layer-group-slot:top';

  const bottomGroupLayer = map.getLayer(bottomGroup);
  const middleGroupLayer = map.getLayer(middleGroup);
  const topGroupLayer = map.getLayer(topGroup);

  expect(bottomGroupLayer, 'Bottom group exists').toBeTruthy();
  expect(middleGroupLayer, 'Middle group exists').toBeTruthy();
  expect(topGroupLayer, 'Top group exists').toBeTruthy();

  // Verify slot property is set correctly
  // @ts-ignore accessing implementation
  const bottomImpl = bottomGroupLayer.implementation || bottomGroupLayer;
  // @ts-ignore accessing implementation
  const middleImpl = middleGroupLayer.implementation || middleGroupLayer;
  // @ts-ignore accessing implementation
  const topImpl = topGroupLayer.implementation || topGroupLayer;

  expect(bottomImpl.slot, 'Bottom group has correct slot').toBe('bottom');
  expect(middleImpl.slot, 'Middle group has correct slot').toBe('middle');
  expect(topImpl.slot, 'Top group has correct slot').toBe('top');
});

test('MapboxOverlay#resolveLayerGroups - style change handling', async () => {
  const MAP_STYLE = {
    layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });

  // Wait for style to load
  await sleep(10);

  const layers = [
    new ScatterplotLayer({id: 'poi', beforeId: 'park'}),
    new ArcLayer({id: 'connection', beforeId: 'building'})
  ];

  resolveLayerGroups(map, undefined, layers);

  const parkGroup = 'deck-layer-group-before:park';
  const buildingGroup = 'deck-layer-group-before:building';

  expect(map.getLayer(parkGroup), 'Park group exists initially').toBeTruthy();
  expect(map.getLayer(buildingGroup), 'Building group exists initially').toBeTruthy();

  const expectedOrderInitial = ['water', parkGroup, 'park', buildingGroup, 'building'];
  expect(map.style._order, 'Groups positioned correctly initially').toEqual(expectedOrderInitial);

  // Trigger style change
  map.setStyle({...MAP_STYLE});

  const DEFAULT_LAYERS = ['water', 'park', 'building'];
  expect(map.style._order, 'Style is reset').toEqual(DEFAULT_LAYERS);

  // Wait for style to load
  await sleep(10);

  // Restore layers (simulate what happens in _handleStyleChange)
  resolveLayerGroups(map, layers, layers);

  expect(map.getLayer(parkGroup), 'Park group restored after style change').toBeTruthy();
  expect(map.getLayer(buildingGroup), 'Building group restored after style change').toBeTruthy();
  expect(map.style._order, 'Groups restored to correct positions').toEqual(expectedOrderInitial);
});

/* global setTimeout */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
