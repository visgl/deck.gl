// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {resolveLayerGroups} from '@deck.gl/mapbox/resolve-layer-groups';

import MockMapboxMap from './mapbox-gl-mock/map';

test('MapboxOverlay#resolveLayerGroups - basic group creation', async t => {
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

  t.ok(map.getLayer(groupId), 'Group layer exists');
  t.notOk(map.getLayer('poi'), 'Individual layer poi not added to map');
  t.notOk(map.getLayer('connection'), 'Individual layer connection not added to map');

  const expectedOrder = ['water', groupId, 'park', 'building'];
  t.deepEqual(map.style._order, expectedOrder, 'Group is positioned before park');

  t.end();
});

test('MapboxOverlay#resolveLayerGroups - multiple groups', async t => {
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

  t.ok(map.getLayer(group1), 'Group 1 exists (before park:top)');
  t.ok(map.getLayer(group2), 'Group 2 exists (slot top)');
  t.ok(map.getLayer(group3), 'Group 3 exists (before water)');
  t.ok(map.getLayer(group4), 'Group 4 exists (last)');

  t.notOk(map.getLayer('poi1'), 'Individual layer poi1 not added');
  t.notOk(map.getLayer('poi2'), 'Individual layer poi2 not added');
  t.notOk(map.getLayer('arc1'), 'Individual layer arc1 not added');
  t.notOk(map.getLayer('arc2'), 'Individual layer arc2 not added');

  const expectedOrder = [group3, 'water', group1, 'park', 'building', group2, group4];
  t.deepEqual(map.style._order, expectedOrder, 'Groups are positioned correctly');

  t.end();
});

test('MapboxOverlay#resolveLayerGroups - group removal', async t => {
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
  t.ok(map.getLayer(parkGroup), 'Park group exists after initial add');

  // Remove all layers
  resolveLayerGroups(map, layers1, []);
  t.notOk(map.getLayer(parkGroup), 'Park group removed when all layers removed');

  const expectedOrderAfterRemoval = ['water', 'park', 'building'];
  t.deepEqual(map.style._order, expectedOrderAfterRemoval, 'Map order restored to original');

  // Add different group
  const layers2 = [new ArcLayer({id: 'arc1', beforeId: 'water'})];

  resolveLayerGroups(map, [], layers2);

  const waterGroup = 'deck-layer-group-before:water';
  t.ok(map.getLayer(waterGroup), 'Water group exists');
  t.notOk(map.getLayer(parkGroup), 'Park group still does not exist');

  const expectedOrderFinal = [waterGroup, 'water', 'park', 'building'];
  t.deepEqual(map.style._order, expectedOrderFinal, 'New group positioned correctly');

  t.end();
});

test('MapboxOverlay#resolveLayerGroups - group reordering', async t => {
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
  t.ok(map.getLayer(buildingGroup), 'Building group exists');

  let expectedOrder = ['water', 'park', buildingGroup, 'building'];
  t.deepEqual(map.style._order, expectedOrder, 'Group positioned before building');

  // Update to different beforeId
  const layers2 = [new ScatterplotLayer({id: 'poi', beforeId: 'park'})];

  resolveLayerGroups(map, layers1, layers2);

  const parkGroup = 'deck-layer-group-before:park';
  t.ok(map.getLayer(parkGroup), 'Park group exists after update');
  t.notOk(map.getLayer(buildingGroup), 'Building group removed');

  expectedOrder = ['water', parkGroup, 'park', 'building'];
  t.deepEqual(map.style._order, expectedOrder, 'Group moved to before park');

  t.end();
});

test('MapboxOverlay#resolveLayerGroups - slot-based grouping', async t => {
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

  t.ok(bottomGroupLayer, 'Bottom group exists');
  t.ok(middleGroupLayer, 'Middle group exists');
  t.ok(topGroupLayer, 'Top group exists');

  // Verify slot property is set correctly
  // @ts-ignore accessing implementation
  const bottomImpl = bottomGroupLayer.implementation || bottomGroupLayer;
  // @ts-ignore accessing implementation
  const middleImpl = middleGroupLayer.implementation || middleGroupLayer;
  // @ts-ignore accessing implementation
  const topImpl = topGroupLayer.implementation || topGroupLayer;

  t.equal(bottomImpl.slot, 'bottom', 'Bottom group has correct slot');
  t.equal(middleImpl.slot, 'middle', 'Middle group has correct slot');
  t.equal(topImpl.slot, 'top', 'Top group has correct slot');

  t.end();
});

test('MapboxOverlay#resolveLayerGroups - style change handling', async t => {
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

  t.ok(map.getLayer(parkGroup), 'Park group exists initially');
  t.ok(map.getLayer(buildingGroup), 'Building group exists initially');

  const expectedOrderInitial = ['water', parkGroup, 'park', buildingGroup, 'building'];
  t.deepEqual(map.style._order, expectedOrderInitial, 'Groups positioned correctly initially');

  // Trigger style change
  map.setStyle({...MAP_STYLE});

  const DEFAULT_LAYERS = ['water', 'park', 'building'];
  t.deepEqual(map.style._order, DEFAULT_LAYERS, 'Style is reset');

  // Wait for style to load
  await sleep(10);

  // Restore layers (simulate what happens in _handleStyleChange)
  resolveLayerGroups(map, layers, layers);

  t.ok(map.getLayer(parkGroup), 'Park group restored after style change');
  t.ok(map.getLayer(buildingGroup), 'Building group restored after style change');
  t.deepEqual(map.style._order, expectedOrderInitial, 'Groups restored to correct positions');

  t.end();
});

/* global setTimeout */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
