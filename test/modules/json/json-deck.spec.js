import test from 'tape-catch';
import {JSONDeck} from '@deck.gl/json';

const JSON_DATA = {
  initialViewState: {
    longitude: -122.45,
    latitude: 37.8,
    zoom: 12
  },
  layers: [
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
  ]
};

test('JSONDeck#import', t => {
  t.ok(JSONDeck, 'JSONDeck imported');
  t.end();
});

test('JSONDeck#create', t => {
  const jsonDeck = new JSONDeck({
    data: JSON_DATA,
    // HACK: Prevent animationLoop from starting
    _customRender: true
  });
  t.ok(jsonDeck, 'JSONDeck created');
  t.end();
});
