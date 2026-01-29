// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BASEMAP, _MapLibreBasemap as MapLibreBasemap} from '@deck.gl/carto';
import {test, expect} from 'vitest';
import {withMockFetchMapsV3} from '../mock-fetch';
import {KeplerMapConfig} from '@deck.gl/carto/api/types';
import {fetchBasemapProps} from '@deck.gl/carto';
import {CartoAPIError} from '@carto/api-client';

const mockedMapConfig: KeplerMapConfig = {
  mapState: {
    latitude: 33.3232,
    longitude: -122.0312,
    zoom: 5,
    pitch: 0,
    bearing: 0
  },
  mapStyle: {
    styleType: 'positron',
    visibleLayerGroups: {}
  },
  visState: {
    layers: []
  },
  layerBlending: undefined,
  interactionConfig: undefined
};
const mockedCartoStyle = {
  id: '1234',
  layers: [{id: 'background'}, {id: 'label'}, {id: 'road'}, {id: 'boundaries'}, {id: 'water'}]
};
async function responseFunc(url: string) {
  if (url === BASEMAP.VOYAGER) {
    return {
      json: async () => mockedCartoStyle
    };
  } else if (url === BASEMAP.DARK_MATTER) {
    throw new Error('connection error');
  } else {
    return {
      ok: false,
      json: async () => {
        throw new Error('fake error');
      }
    };
  }
}
test('fetchBasemapProps#carto - no filters', async t =>
  withMockFetchMapsV3(async calls => {
    expect(calls.length, '0 initial calls').toBe(0);

    const r = await fetchBasemapProps({config: mockedMapConfig});
    expect(calls.length, 'no style loaded, when there are no filters').toBe(0);
    expect(r, 'style is just positron URL').toEqual({
      type: 'maplibre',
      props: {
        style: BASEMAP.POSITRON,
        center: [-122.0312, 33.3232],
        zoom: 5,
        pitch: 0,
        bearing: 0
      },
      visibleLayerGroups: {},
      rawStyle: BASEMAP.POSITRON
    });
  }, responseFunc));

test('fetchBasemapProps#carto - with filters', async t =>
  withMockFetchMapsV3(async calls => {
    const visibleLayerGroups = {label: false, road: true, border: true, water: true};
    const r = await fetchBasemapProps({
      config: {
        ...mockedMapConfig,
        mapStyle: {
          styleType: 'voyager',
          visibleLayerGroups
        }
      }
    });
    expect(calls.length, 'should call fetch only once').toBe(1);
    expect(calls[0].url, 'should request voyager style').toBe(BASEMAP.VOYAGER);
    expect(r.type, 'proper basemap type is returned').toBe('maplibre');
    const r2 = r as MapLibreBasemap;
    expect(r2.rawStyle, 'raw style is returned').toBe(mockedCartoStyle);
    expect(r2.props.style, 'actual style is loaded with layers filtered-out').toEqual({
      ...mockedCartoStyle,
      layers: mockedCartoStyle.layers.filter(l => l.id !== 'label')
    });
    expect(r2.visibleLayerGroups, 'visibleLayerGroups are passed').toEqual(visibleLayerGroups);
  }, responseFunc));

test('fetchBasemapProps#custom', async t =>
  withMockFetchMapsV3(async calls => {
    const r = await fetchBasemapProps({
      config: {
        ...mockedMapConfig,
        mapStyle: {
          styleType: 'custom:uuid1234'
        },
        customBaseMaps: {
          customStyle: {
            id: 'custom:uuid1234',
            style: 'http://example.com/style.json',
            customAttribution: 'custom attribution'
          }
        }
      }
    });
    expect(calls.length, `shouldn't make any fetch requests`).toBe(0);
    expect(r, 'should return proper basemap settings').toEqual({
      type: 'maplibre',
      props: {
        style: 'http://example.com/style.json',
        center: [-122.0312, 33.3232],
        zoom: 5,
        pitch: 0,
        bearing: 0
      },
      attribution: 'custom attribution'
    });
  }, responseFunc));

test('fetchBasemapProps#google', async t =>
  withMockFetchMapsV3(async calls => {
    const r = await fetchBasemapProps({
      config: {
        ...mockedMapConfig,
        mapStyle: {
          styleType: 'google-voyager'
        }
      }
    });

    expect(calls.length, 'should fetch anything').toBe(0);
    expect(r, 'should return proper google map props').toEqual({
      type: 'google-maps',
      props: {
        mapTypeId: 'roadmap',
        mapId: '885caf1e15bb9ef2',
        center: {
          lat: 33.3232,
          lng: -122.0312
        },
        zoom: 6,
        tilt: 0,
        heading: 0
      }
    });
  }, responseFunc));

test('fetchBasemapProps#carto - error handling', async t =>
  withMockFetchMapsV3(async calls => {
    const expectedError = await fetchBasemapProps({
      config: {
        ...mockedMapConfig,
        mapStyle: {
          styleType: 'dark-matter',
          visibleLayerGroups: {label: false, road: true, border: true, water: true}
        }
      }
    }).catch(error => error);

    expect(calls.length, 'should call fetch only once').toBe(1);
    expect(calls[0].url, 'should request proper style URL').toBe(BASEMAP.DARK_MATTER);
    expect(expectedError instanceof CartoAPIError, 'error is CartoAPIError').toBeTruthy();
    expect(expectedError.errorContext.requestType, 'proper requestType in error').toBe(
      'Basemap style'
    );
  }, responseFunc));
