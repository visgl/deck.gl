import test from 'tape-catch';
import {makeSpy} from '@probe.gl/test-utils';

import {COORDINATE_SYSTEM} from '@deck.gl/core/lib/constants';
import {MapController} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import configuration, {log, calculateRadius} from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';
import COMPLEX_JSON from './data/complex-data.json';

import {OrbitView} from '@deck.gl/core';

test('JSONConverter#import', t => {
  t.ok(JSONConverter, 'JSONConverter imported');
  t.end();
});

test('JSONConverter#create', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');
  t.end();
});

test('JSONConverter#convert', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');

  let deckProps = jsonConverter.convert(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');
  t.is(deckProps.views.length, 2, 'JSONConverter converted views');
  t.is(deckProps.controller, MapController, 'Should evaluate constants.');

  deckProps = jsonConverter.convert(COMPLEX_JSON);
  const pointCloudLayerProps = deckProps.layers[3].props;
  t.is(
    pointCloudLayerProps.coordinateSystem,
    COORDINATE_SYSTEM.METER_OFFSETS,
    'Should evaluate enums.'
  );

  t.deepEqual(
    deckProps.layers[0].props.getRadius,
    calculateRadius({base: 10, exponent: 3}),
    'Should evaluate functions.'
  );

  t.end();
});

test('JSONConverter#merge', t => {
  const jsonConverter = new JSONConverter({configuration});
  jsonConverter.mergeConfiguration({
    classes: {OrbitView}
  });
  const deckProps = jsonConverter.convert({
    views: [{'@@type': 'OrbitView'}, {'@@type': 'NoSuchView'}]
  });
  t.ok(
    deckProps.views[0] instanceof OrbitView && deckProps.views[0].id,
    'JSONConverter added a new class to its configuration'
  );
  t.ok(!deckProps.views[1], 'JSONConverter does not add a class not in its configuration');

  t.end();
});

test('JSONConverter#badConvert', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');
  const badData = JSON.parse(JSON.stringify(JSON_DATA));
  badData.layers[0]['@@type'] = 'InvalidLayer';
  makeSpy(log, 'warn');
  jsonConverter.convert(badData);
  t.ok(log.warn.called, 'should produce a warning message if the layer type is invalid');
  log.warn.restore();
  t.end();
});

test('JSONConverter#handleTypeAsKey', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');
  const complexData = JSON.parse(JSON.stringify(COMPLEX_JSON));
  const deckProps = jsonConverter.convert(complexData);
  t.ok(deckProps.layers.length, 4, 'should have four layers');
  t.ok(deckProps.layers[0].id === 'ScatterplotLayer', 'should have a ScatterplotLayer at index 0');
  t.ok(deckProps.layers[1].id === 'TextLayer', 'should have a TextLayer at index 1');
  t.ok(deckProps.layers[2].id === 'GeoJsonLayer', 'should have a GeoJsonLayer at index 2');
  t.ok(deckProps.layers[3].id === 'PointCloudLayer', 'should have a PointCloudLayer at index 3');
  t.ok(deckProps.layers[2].props.data.features[0].type === 'Feature');
  t.end();
});
