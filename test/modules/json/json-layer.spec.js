import test from 'tape-catch';
import {_JSONLayer as JSONLayer} from '@deck.gl/json';

import {JSON_DATA} from './json-converter.spec';

test('JSONLayer#import', t => {
  t.ok(JSONLayer, 'JSONLayer imported');
  t.end();
});

test('JSONLayer#create', t => {
  const jsonLayer = new JSONLayer({data: JSON_DATA.layers});
  t.ok(jsonLayer, 'JSONLayer created');
  t.end();
});
