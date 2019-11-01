import test from 'tape-catch';

import {JSONConfiguration} from '@deck.gl/json';
import configuration from './json-configuration-for-deck';

test('JSONConfiguration#import', t => {
  t.ok(JSONConfiguration, 'JSONConfiguration imported');
  t.end();
});

test('JSONConfiguration#create', t => {
  const jsonConverter = new JSONConfiguration({configuration});
  t.ok(jsonConverter, 'JSONConfiguration created');
  t.end();
});
