import {BASEMAP, CartoAPIError, fetchMap} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3} from '../mock-fetch';
import {KeplerMapConfig} from '@deck.gl/carto/api/types';
import {fetchBasemapProps} from '@deck.gl/carto';

const mockedMapConfig: KeplerMapConfig = {
  mapState: undefined,
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
  layers: [{id: 'label'}, {id: 'road'}, {id: 'boundaries'}, {id: 'water'}]
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
    t.equals(calls.length, 0, '0 initial calls');

    const r = await fetchBasemapProps({config: mockedMapConfig});
    t.equals(calls.length, 0, 'no style loaded, when there are no filters');
    t.deepEquals(
      r,
      {
        type: 'maplibre',
        style: BASEMAP.POSITRON,
        visibleLayerGroups: {},
        rawStyle: BASEMAP.POSITRON
      },
      'style is just positron URL'
    );
    t.end();
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
    t.equals(calls.length, 1, 'should call fetch only once');
    t.equals(calls[0].url, BASEMAP.VOYAGER, 'should request voyager style');
    t.equals(r.type, 'maplibre', 'proper basemap type is returned');
    t.equals(r.rawStyle, mockedCartoStyle, 'raw style is returned');
    t.deepEquals(
      r.style,
      {
        ...mockedCartoStyle,
        layers: mockedCartoStyle.layers.filter(l => l.id !== 'label')
      },
      'actual style is loaded with layers filtered-out'
    );
    t.deepEquals(r.visibleLayerGroups, visibleLayerGroups, 'visibleLayerGroups are passed');
    t.end();
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
    t.equals(calls.length, 0, `shouldn't make any fetch requests`);
    t.deepEquals(
      r,
      {type: 'maplibre', style: 'http://example.com/style.json', attribution: 'custom attribution'},
      'should return proper basemap settings'
    );
    t.end();
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

    t.equals(calls.length, 0, 'should fetch anything');
    t.deepEquals(
      r,
      {
        type: 'google-maps',
        options: {
          mapTypeId: 'roadmap',
          mapId: '885caf1e15bb9ef2'
        }
      },
      'should return proper google map options'
    );
    t.end();
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

    t.equals(calls.length, 1, 'should call fetch only once');
    t.equals(calls[0].url, BASEMAP.DARK_MATTER, 'should request proper style URL');
    t.true(expectedError instanceof CartoAPIError, 'error is CartoAPIError');
    t.equals(
      expectedError.errorContext.requestType,
      'Basemap style',
      'proper requestType in error'
    );
    t.end();
  }, responseFunc));
