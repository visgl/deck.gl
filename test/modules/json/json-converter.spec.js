import test from 'tape-catch';
import {Deck} from '@deck.gl/core';
import {_JSONConverter as JSONConverter} from '@deck.gl/json';

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';

const configuration = {
  // a map of all layers that should be exposes as JSONLayers
  layers: Object.assign({}, require('@deck.gl/layers')),
  // Any non-standard views
  views: {},
  // Enumerations that should be available to JSON parser
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL
  }
};

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

  const deckProps = jsonConverter.convertJsonToDeckProps(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');
  t.end();
});

test('JSONConverter#render', t => {
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');

  const deckProps = jsonConverter.convertJsonToDeckProps(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');

  const jsonDeck = new Deck(deckProps);
  t.ok(jsonDeck, 'JSONConverter created');
  jsonDeck.finalize();
  t.end();
});
