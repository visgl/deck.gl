"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var Deck;module.link('@deck.gl/core',{Deck(v){Deck=v}},1);var JSONConverter;module.link('@deck.gl/json',{_JSONConverter(v){JSONConverter=v}},2);var COORDINATE_SYSTEM;module.link('@deck.gl/core',{COORDINATE_SYSTEM(v){COORDINATE_SYSTEM=v}},3);var GL;module.link('@luma.gl/constants',{default(v){GL=v}},4);






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
  if (typeof document === 'undefined') {
    t.comment('test only available in browser');
    t.end();
    return;
  }

  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');

  const deckProps = jsonConverter.convertJsonToDeckProps(JSON_DATA);
  t.ok(deckProps, 'JSONConverter converted correctly');

  const jsonDeck = new Deck(
    Object.assign(
      {
        onAfterRender: () => {
          t.ok(jsonDeck, 'JSONConverter rendered');
          jsonDeck.finalize();
          t.end();
        }
      },
      deckProps
    )
  );
});
