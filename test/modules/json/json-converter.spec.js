import test from 'tape-catch';

import {makeSpy} from '@probe.gl/test-utils';
import {_JSONConverter as JSONConverter, _JSONLayer as JSONLayer} from '@deck.gl/json';

import {log} from '@deck.gl/core';

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';

export const configuration = {
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

export const JSON_DATA = {
  initialViewState: {
    longitude: -122.45,
    latitude: 37.8,
    zoom: 12
  },
  mapStyle: {},
  views: [
    {
      type: 'MapView',
      height: '50%',
      controller: true
    },
    {
      type: 'FirstPersonView',
      y: '50%',
      height: '50%'
    }
  ],
  layers: [
    {
      type: 'ScatterplotLayer',
      data: [{position: [-122.45, 37.8]}],
      getPosition: 'position',
      getColor: [255, 0, 0, 255],
      getRadius: 1000
    },
    {
      type: 'TextLayer',
      data: [[-122.45, 37.8]],
      getPosition: '-',
      elevationRange: [0, 3000],
      getText: d => 'Hello World',
      billboard: false
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

  t.is(deckProps.views.length, 2, 'JSONConverter converted views');

  const layer = deckProps.layers[0];
  t.is(layer && layer.constructor, JSONLayer, 'JSONConverter created JSONLayer');
  t.is(layer.props.data.length, 2, 'JSONLayer has data');

  t.end();
});

test('JSONConverter#badConvert', t => {
  makeSpy(log, 'warn');
  const jsonConverter = new JSONConverter({configuration});
  t.ok(jsonConverter, 'JSONConverter created');
  const badData = JSON.parse(JSON.stringify(JSON_DATA));
  badData.layers[0].type = 'InvalidLayer';
  jsonConverter.convertJsonToDeckProps(badData);
  t.ok(log.warn.called, 'should produce a warning message if the layer type is invalid');
  log.warn.restore();
  t.end();
});
