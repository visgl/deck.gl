import maplibregl from 'maplibre-gl';
import {Deck} from '@deck.gl/core';
import {CartoLayer, setDefaultCredentials, BASEMAP, MAP_TYPES} from '@deck.gl/carto';

setDefaultCredentials({
  apiBaseUrl: 'https://gcp-us-east1-11.dev.api.carto.com',
  accessToken: 'XXX'
});

// Add basemap for context.
const map = new maplibregl.Map({container: 'map', style: BASEMAP.VOYAGER, interactive: false});

new Deck({
  canvas: 'deck-canvas',

  initialViewState: {latitude: 55.5, longitude: 12, zoom: 7},
  controller: true,

  ...(map && {
    mapStyle: BASEMAP.VOYAGER,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    }
  }),

  layers: [
    new CartoLayer({
      connection: 'deb-bigquery',
      type: MAP_TYPES.RASTER,
      data: 'cartodb-data-engineering-team.jarroyo_raster.hillshade1x1_quadbin_2',
      formatTiles: 'binary',
      tileSize: 64,
      getFillColor: ({properties}) => {
        const {band_1} = properties;
        return [band_1, 0, -100 * band_1, band_1 ? 255 : 0];
      },
      opacity: map ? 0.5 : 1
      // coverage: 0.8
      // stroked: true
      // extruded: true,
      // getElevation: ({properties}) => {
      //   return 100 * properties.band_1;
      // }
    })
  ]
});
