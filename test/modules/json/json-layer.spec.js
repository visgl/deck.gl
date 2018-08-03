import test from 'tape-catch';
import {JSONLayer} from '@deck.gl/json';

const JSON_DATA = [
  {
    type: 'ScatterplotLayer',
    data: [{position: [-122.45, 37.8]}],
    getColor: [255, 0, 0, 255],
    getRadius: 1000
  },
  {
    type: 'TextLayer',
    data: [{position: [-122.45, 37.8], text: 'Hello World'}]
  }
];

test('JSONLayer#import', t => {
  t.ok(JSONLayer, 'JSONLayer imported');
  t.end();
});

test('JSONLayer#create', t => {
  const jsonLayer = new JSONLayer({data: JSON_DATA});
  t.ok(jsonLayer, 'JSONLayer created');
  t.end();
});
