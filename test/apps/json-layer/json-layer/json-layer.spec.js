import test from 'tape-catch';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';
import {JSONLayer} from '@deck.gl/json';
import {configuration, JSON_DATA} from '../../../../test/modules/json/deck-json-converter.spec';

test('JSONLayer#import', t => {
  t.ok(JSONLayer, 'JSONLayer imported');
  t.end();
});

test('JSONLayer#create', t => {
  const jsonLayer = new JSONLayer({data: JSON_DATA.layers});
  t.ok(jsonLayer, 'JSONLayer created');
  t.end();
});

test('JSONLayer#lifecycle', t => {
  testLayer({
    Layer: JSONLayer,
    testCases: [
      {
        title: 'empty',
        props: {
          data: JSON_DATA.layers
        }
      },
      {
        title: 'string data',
        updateProps: {
          configuration
        },
        onAfterUpdate: ({subLayers}) => {
          t.is(subLayers.length, 2, 'Sublayers rendered');
          t.is(typeof subLayers[0].props.getPosition, 'function', 'Accessor populated');
          t.is(typeof subLayers[1].props.getPosition, 'function', 'Accessor populated');
          t.is(typeof subLayers[1].props.billboard, 'boolean', 'Accessor populated');
        }
      },
      {
        title: 'array data',
        updateProps: {data: JSON.stringify(JSON_DATA.layers)},
        onAfterUpdate: ({subLayers}) => {
          t.is(subLayers.length, 2, 'Sublayers rendered');
        }
      }
    ],
    onError: t.notOk
  });

  t.end();
});

test('JSONLayer#fetch', t => {
  // polyfill/hijack fetch
  /* global global, window */
  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  const data = {
    'data.json': JSON.stringify([{position: [-122.45, 37.8], text: 'Hello World'}]),
    'data.csv': `lon,lat,text
-122.45,37.78,"Hello World"
`
  };
  _global.fetch = url =>
    Promise.resolve({
      text: () => data[url]
    });

  const jsonLayer = new JSONLayer({
    configuration,
    data: [
      {
        type: 'TextLayer',
        id: 'text-layer-1',
        data: 'data.json'
      },
      {
        type: 'TextLayer',
        id: 'text-layer-2',
        data: 'data.csv',
        getPosition: d => [d.lon, d.lat],
        getText: d => d.text
      }
    ]
  });

  testInitializeLayer({layer: jsonLayer, onError: t.notOk});

  // Wait for fetch to resolve
  _global.setTimeout(() => {
    const subLayers = jsonLayer.renderLayers();

    t.deepEqual(
      subLayers[0].props.data,
      [{position: [-122.45, 37.8], text: 'Hello World'}],
      'JSON parsed successfully'
    );
    t.deepEqual(
      subLayers[1].props.data,
      [[-122.45, 37.78, 'Hello World']],
      'CSV parsed successfully'
    );

    t.end();
  }, 0);

  // restore fetcch
  _global.fetch = fetch;
});
