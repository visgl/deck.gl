import test from 'tape-catch';
import {makeSpy} from '@probe.gl/test-utils';

import {MapController} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import configuration, {log} from './json-configuration-for-deck';
import JSON_DATA from './data/deck-props.json';

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

  const deckProps = jsonConverter.convert(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');

  t.is(deckProps.views.length, 2, 'JSONConverter converted views');
  t.is(deckProps.controller, MapController, 'Should evaluate constants.');

  t.end();
});

test('JSONConverter#badConvert', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');
  const badData = JSON.parse(JSON.stringify(JSON_DATA));
  badData.layers[0].type = 'InvalidLayer';
  makeSpy(log, 'warn');
  jsonConverter.convert(badData);
  t.ok(log.warn.called, 'should produce a warning message if the layer type is invalid');
  log.warn.restore();
  t.end();
});
