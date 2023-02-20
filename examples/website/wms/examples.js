export const LOADERS_URI = 'https://raw.githubusercontent.com/visgl/loaders.gl/master';

export const INITIAL_CATEGORY_NAME = 'WMS';
export const INITIAL_EXAMPLE_NAME = 'Terrestris(OpenStreetMap)';

export const INITIAL_MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 9,
  minZoom: 1,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

export const EXAMPLES = {
  WMS: {
    'Terrestris(OpenStreetMap)': {
      service: `https://ows.terrestris.de/osm/service`,
      serviceType: 'wms',
      layers: ['OSM-WMS'],
      viewState: {...VIEW_STATE}
    },
    'Canadian Weather': {
      service: 'https://geo.weather.gc.ca/geomet',
      serviceType: 'wms',
      layers: ['GDPS.ETA_TT'], // 'RDPS.CONV_KINDEX.PT3H'],
      viewState: {...VIEW_STATE, longitude: -100, latitude: 55, zoom: 3},
      opacity: 0.5
    }
  }
};
