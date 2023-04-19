import maplibregl from 'maplibre-gl';
import {Deck} from '@deck.gl/core';
import {CartoLayer, setDefaultCredentials, BASEMAP, MAP_TYPES} from '@deck.gl/carto';

setDefaultCredentials({
  accessToken: 'XXX'
});

// Add basemap for context.
const map = new maplibregl.Map({container: 'map', style: BASEMAP.VOYAGER, interactive: false});

new Deck({
  canvas: 'deck-canvas',

  initialViewState: {latitude: 50, longitude: 14.5, zoom: 10},
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
      connection: 'bigquery',
      type: MAP_TYPES.RASTER,
      data: 'cartobq.public_account.temperature_raster',
      formatTiles: 'binary',
      tileSize: 64,
      getFillColor: d => {
        const {band_1} = d.properties;
        return [10 * (band_1 - 20), 0, 300 - 5 * band_1];
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
