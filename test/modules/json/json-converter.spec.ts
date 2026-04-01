// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {MapController} from '@deck.gl/core';
import {JSONConfiguration, JSONConverter} from '@deck.gl/json';
import {JSON_CONFIGURATION, log, calculateRadius} from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import COMPLEX_JSON from './data/complex-data.json';

import {OrbitView} from '@deck.gl/core';

test('JSONConverter#import', () => {
  expect(JSONConverter, 'JSONConverter imported').toBeTruthy();
});

test('JSONConverter#create', () => {
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();
});

test('JSONConverter#convert', () => {
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();

  let deckProps = jsonConverter.convert(JSON_DATA) as any;
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
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  jsonConverter.mergeConfiguration({classes: {OrbitView}});
  const deckProps = jsonConverter.convert({
    views: [{'@@type': 'OrbitView'}, {'@@type': 'NoSuchView'}]
  }) as any;
  expect(
    deckProps.views[0] instanceof OrbitView && deckProps.views[0].id,
    'JSONConverter added a new class to its configuration'
  ).toBeTruthy();
  expect(
    !deckProps.views[1],
    'JSONConverter does not add a class not in its configuration'
  ).toBeTruthy();
});

test('JSONConverter#mergeFunctions', () => {
  const jsonConverter = new JSONConverter({configuration: {}});
  jsonConverter.mergeConfiguration({
    functions: {
      buildValue: ({value}) => value * 2
    }
  });

  const deckProps = jsonConverter.convert({
    value: {
      '@@function': 'buildValue',
      value: 3
    }
  }) as any;

  expect(deckProps.value, 'JSONConverter should merge plain-object functions').toBe(6);
});

test('JSONConverter#badConvert', () => {
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();
  const badData = JSON.parse(JSON.stringify(JSON_DATA));
  badData.layers[0]['@@type'] = 'InvalidLayer';
  const warnSpy = vi.spyOn(log, 'warn');
  jsonConverter.convert(badData);
  expect(
    warnSpy,
    'should produce a warning message if the layer type is invalid'
  ).toHaveBeenCalled();
  warnSpy.mockRestore();
});

test('JSONConverter#handleTypeAsKey', () => {
  const jsonConverter = new JSONConverter({configuration: JSON_CONFIGURATION});
  expect(jsonConverter, 'JSONConverter created').toBeTruthy();
  const complexData = JSON.parse(JSON.stringify(COMPLEX_JSON));
  const deckProps = jsonConverter.convert(complexData) as any;
  expect(deckProps.layers.length, 'should have four layers').toBe(4);
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

test('JSONConverter#hookedConfiguration', () => {
  class TestClass {
    props: Record<string, unknown>;

    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  }

  const jsonConverter = new JSONConverter({
    configuration: {
      classes: {TestClass},
      convertFunction: value => row => `${value}:${row.suffix}`,
      preProcessClassProps: (_Class, props) => ({...props, id: 'preprocessed'}),
      postProcessConvertedJson: json => ({...json, tagged: true})
    }
  });

  const deckProps = jsonConverter.convert({
    item: {
      '@@type': 'TestClass',
      getValue: '@@=hello'
    }
  }) as any;

  expect(deckProps.tagged, 'postProcessConvertedJson should run').toBeTruthy();
  expect(deckProps.item.props.id, 'preProcessClassProps should run').toBe('preprocessed');
  expect(deckProps.item.props.getValue({suffix: 'world'}), 'convertFunction should run').toBe(
    'hello:world'
  );
});

test('JSONConverter#hooksSurviveMergeConfiguration', () => {
  class TestClass {
    props: Record<string, unknown>;

    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  }

  const jsonConverter = new JSONConverter({
    configuration: {
      classes: {TestClass},
      postProcessConvertedJson: json => ({...json, initial: true})
    }
  });

  jsonConverter.mergeConfiguration({
    preProcessClassProps: (_Class, props) => ({...props, merged: true}),
    postProcessConvertedJson: json => ({...json, mergedPostProcess: true})
  });

  const deckProps = jsonConverter.convert({
    item: {
      '@@type': 'TestClass'
    }
  }) as any;

  expect(deckProps.mergedPostProcess, 'merged postProcessConvertedJson should run').toBeTruthy();
  expect(deckProps.item.props.merged, 'merged preProcessClassProps should run').toBeTruthy();
});
