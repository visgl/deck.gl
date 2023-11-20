/* eslint-disable */
import test from 'tape-promise/tape';
import {WebMercatorViewport, _GlobeViewport as GlobeViewport, PolygonLayer} from 'deck.gl';
import {_SunLight as SunLight} from '@deck.gl/core';
import {vec3} from '@math.gl/core';

test('Sunlight#Constructor', t => {
  const sunLight = new SunLight({
    timestamp: new Date('2019-08-01 15:00:00 Z-7').getTime(),
    color: [255, 255, 255],
    intensity: 1.0
  });
  t.ok(sunLight, 'Sun light is ok');
  t.end();
});

test('Sunlight#getProjectedLight', t => {
  const testCases = [
    {
      title: 'Tropic of Cancer on Summer Solstice at noon',
      timestamp: new Date('2021-06-20 12:00:00Z').getTime(),
      viewport: new WebMercatorViewport({
        longitude: 0,
        latitude: 23.43655,
        zoom: 10
      }),
      // Sun should be pointing straight down
      expected: [0, 0, -1]
    },
    {
      title: 'Tropic of Capricorn on Summer Solstice at midnight',
      timestamp: new Date('2021-06-20 00:00:00Z').getTime(),
      viewport: new WebMercatorViewport({
        longitude: 0,
        latitude: -23.43655,
        zoom: 10
      }),
      // Sun should be pointing straight up
      expected: [0, 0, 1]
    },
    {
      title: 'Sunrise, Seattle',
      timestamp: new Date('2021-01-28 07:47:00Z-8').getTime(),
      viewport: new WebMercatorViewport({
        longitude: -122.3258,
        latitude: 47.6347,
        zoom: 10
      }),
      // Sun should be at horizon from the southeast
      expected: [-0.8871, 0.4616, 0]
    },
    {
      title: 'Sunset, Seattle',
      timestamp: new Date('2021-01-28 17:00:00Z-8').getTime(),
      viewport: new WebMercatorViewport({
        longitude: -122.3258,
        latitude: 47.6347,
        zoom: 10
      }),
      // Sun should be at horizon from the southwest
      expected: [0.8894, 0.457, 0]
    },
    {
      title: 'Equator on Spring Equinox at noon - Globe',
      timestamp: new Date('2021-03-20 12:00:00Z').getTime(),
      viewport: new GlobeViewport({
        longitude: -122.45,
        latitude: 37.78,
        zoom: 10
      }),
      // Sun should be pointing straight down at lon: 0, lat: 0
      expected: [0, 1, 0]
    },
    {
      title: 'Sunrise, London - Globe',
      timestamp: new Date('2021-01-28 07:43:00Z').getTime(),
      viewport: new GlobeViewport({
        longitude: -122.45,
        latitude: 37.78,
        zoom: 10
      }),
      // Sun should be at horizon from the southeast
      expected: [-0.8784, 0.3617, 0.3123]
    },
    {
      title: 'Sunset, London - Globe',
      timestamp: new Date('2021-01-28 16:43:00Z').getTime(),
      viewport: new GlobeViewport({
        longitude: -122.45,
        latitude: 37.78,
        zoom: 10
      }),
      // Sun should be at horizon from the southwest
      expected: [0.8773, 0.3659, 0.3107]
    }
  ];

  const sunLight = new SunLight({
    timestamp: 0,
    color: [255, 255, 255],
    intensity: 1.0
  });

  const layer = new PolygonLayer({});
  layer.context = {};

  for (const testCase of testCases) {
    sunLight.timestamp = testCase.timestamp;
    layer.context.viewport = testCase.viewport;
    const projectedLight = sunLight.getProjectedLight({layer});
    t.comment(projectedLight.direction.join(','));
    t.ok(vec3.angle(projectedLight.direction, testCase.expected) < 0.05, testCase.title);
  }

  t.end();
});
