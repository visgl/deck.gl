// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {makeSpy} from '@probe.gl/test-utils';

import {COORDINATE_SYSTEM} from '@deck.gl/core/lib/constants';
import {MapController} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import configuration, {log, calculateRadius} from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import COMPLEX_JSON from './data/complex-data.json';

import {OrbitView} from '@deck.gl/core';

test('JSONConverter#import', () => {
  expect(JSONConverter, 'JSONConverter imported').toBeTruthy();
});

test('JSONConverter#create', () => {
  const jsonConverter = new JSONConverter({configuration});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();
});

test('JSONConverter#convert', () => {
  const jsonConverter = new JSONConverter({configuration});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();

  let deckProps = jsonConverter.convert(JSON_DATA);
  expect(deckProps, 'JSONConverter converted correctly').toBeTruthy();
  expect(deckProps.views.length, 'JSONConverter converted views').toBe(2);
  expect(deckProps.controller, 'Should evaluate constants.').toBe(MapController);

  deckProps = jsonConverter.convert(COMPLEX_JSON);
  const pointCloudLayerProps = deckProps.layers[3].props;
  expect(pointCloudLayerProps.coordinateSystem, 'Should evaluate enums.').toBe(
    COORDINATE_SYSTEM.METER_OFFSETS
  );

  expect(deckProps.layers[0].props.getRadius, 'Should evaluate functions.').toEqual(
    calculateRadius({base: 10, exponent: 3})
  );
});

test('JSONConverter#merge', () => {
  const jsonConverter = new JSONConverter({configuration});
  jsonConverter.mergeConfiguration({
    classes: {OrbitView}
  });
  const deckProps = jsonConverter.convert({
    views: [{'@@type': 'OrbitView'}, {'@@type': 'NoSuchView'}]
  });
  expect(
    deckProps.views[0] instanceof OrbitView && deckProps.views[0].id,
    'JSONConverter added a new class to its configuration'
  ).toBeTruthy();
  expect(
    !deckProps.views[1],
    'JSONConverter does not add a class not in its configuration'
  ).toBeTruthy();
});

test('JSONConverter#badConvert', () => {
  const jsonConverter = new JSONConverter({configuration});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();
  const badData = JSON.parse(JSON.stringify(JSON_DATA));
  badData.layers[0]['@@type'] = 'InvalidLayer';
  makeSpy(log, 'warn');
  jsonConverter.convert(badData);
  expect(
    log.warn.called,
    'should produce a warning message if the layer type is invalid'
  ).toBeTruthy();
  log.warn.restore();
});

test('JSONConverter#handleTypeAsKey', () => {
  const jsonConverter = new JSONConverter({configuration});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();
  const complexData = JSON.parse(JSON.stringify(COMPLEX_JSON));
  const deckProps = jsonConverter.convert(complexData);
  expect(deckProps.layers.length, 4).toBeTruthy();
  expect(
    deckProps.layers[0].id === 'ScatterplotLayer',
    'should have a ScatterplotLayer at index 0'
  ).toBeTruthy();
  expect(deckProps.layers[1].id === 'TextLayer', 'should have a TextLayer at index 1').toBeTruthy();
  expect(
    deckProps.layers[2].id === 'GeoJsonLayer',
    'should have a GeoJsonLayer at index 2'
  ).toBeTruthy();
  expect(
    deckProps.layers[3].id === 'PointCloudLayer',
    'should have a PointCloudLayer at index 3'
  ).toBeTruthy();
  expect(deckProps.layers[2].props.data.features[0].type === 'Feature').toBeTruthy();
});
