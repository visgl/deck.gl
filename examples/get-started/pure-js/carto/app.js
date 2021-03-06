import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {
  CartoSQLLayer,
  CartoBQTilerLayer,
  CartoLayer,
  setDefaultCredentials,
  BASEMAP,
  colorBins
} from '@deck.gl/carto';

import { H3HexagonLayer} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1
};

// const INITIAL_VIEW_STATE =  {
//   longitude: -122.4,
//   latitude: 37.74,
//   zoom: 11,
//   maxZoom: 20,
//   pitch: 30,
//   bearing: 0
// };

setDefaultCredentials({
  username: 'carto',
  apiKey: 'caa6158db8ba3550a16ea2b3505da92374ec92ec',
  //accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcnRvIiwiY29ubmVjdGlvbl9pZCI6ImRldi1zbm93Zmxha2UiLCJuYW1lIjoiSldUIHRlc3RpbmciLCJyZWdpb24iOiJ1cyIsInByaXZhY3kiOiJwdWJsaWMiLCJzY29wZXMiOlsic3FsIiwibWFwcyIsInRva2Vuczp3cml0ZSIsInRva2VuczpyZWFkIiwidXNlcjpyZWFkIl0sImFsbG93ZWRVcmxzIjpbImh0dHBzOi8vYXBwMS5jYXJ0by5jb20iXSwiaWF0IjoxNjE0OTc0MzIyLCJleHAiOjE2MTQ5Nzc5MjJ9.-SwG7ghhQatJJ0Au8mm17cX9rLEq3yjopX0GMAYqwdo',
  mapsUrl: 'http://localhost:8282/user/{user}'
});

// Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
const map = new mapboxgl.Map({
  container: 'map',
  style: BASEMAP.VOYAGER,
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom
});

// Set the default visible layer
let visibleLayer = 'airports';

// Create Deck.GL map
export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    // Synchronize Deck.gl view with Mapbox
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  }
});

// Add event listener to radio buttons
document.getElementsByName('layer-visibility').forEach(e => {
  e.addEventListener('click', () => {
    visibleLayer = e.value;
    render();
  });
});

render();

// Function to render the layers. Will be invoked any time visibility changes.
function render() {
  const layers = [
    // new CartoSQLLayer({
    //   id: 'airports',
    //   data: 'SELECT cartodb_id, the_geom_webmercator, scalerank FROM ne_10m_airports',
    //   visible: visibleLayer === 'airports',
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: f => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // }),
    // new CartoBQTilerLayer({
    //   id: 'osm_buildings',
    //   data: 'cartodb-gcp-backend-data-team.alasarr.beijing_data_tileset',
    //   visible: visibleLayer === 'building',
    //   getFillColor: colorBins({
    //     attr: 'aggregated_total',
    //     domain: [10, 100, 1e3, 1e4, 1e5, 1e6],
    //     colors: 'Temps'
    //   }),
    //   pointRadiusMinPixels: 2,
    //   stroked: false
    // })

    // new CartoLayer({
    //   id: 'osm_buildings',
    //   connection: 'bigquery',
    //   data: 'cartodb-gcp-backend-data-team.alasarr.beijing_data_tileset',
    //   type: 'tileset',
    //   getFillColor: colorBins({
    //     attr: 'aggregated_total',
    //     domain: [10, 100, 1e3, 1e4, 1e5, 1e6],
    //     colors: 'Temps'
    //   }),
    //   pointRadiusMinPixels: 2,
    //   stroked: false
    // }),

    // new CartoLayer({
    //   id: 'bigquery_geojson',
    //   connection: 'bigquery',
    //   data: 'cartodb-gcp-backend-data-team.alasarr.airports',
    //   type: 'table',
    //   getFillColor: [255, 0, 0],
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: 10,
    // //   getFillColor: [200, 0, 80, 180],
    // //   autoHighlight: true,
    // //   highlightColor: [0, 0, 128, 128],
    // //   pickable: true
    //   stroked: false,
    // })

    // new CartoLayer({
    //   id: 'bigquery_h3',
    //   connection: 'bigquery',
    //   data: 'cartodb-gcp-backend-data-team.alasarr.here_pois_h3_sf',
    //   type: 'table',
    //   subLayer: H3HexagonLayer,
    //   filled: true,
    //   extruded: false,
    //   getFillColor: colorBins({
    //     attr: 'n',
    //     domain: [100, 400, 700, 1000, 1500, 2000],
    //     colors: 'Temps'
    //   }),
    //   getHexagon: d => d.h3,
    //   wireframe: false
    // })

    // new CartoLayer({
    //   id: 'carto_table',
    //   connection: 'carto',
    //   data: 'airports',
    //   type: 'table',
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: 15,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })


    // new CartoLayer({
    //   id: 'carto_table',
    //   connection: 'carto',
    //   data: 'usa_county',
    //   type: 'table',
    //   filled: true,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })

    
    // new CartoLayer({
    //   id: 'carto_table',
    //   connection: 'snowflake',
    //   data: 'alasarr.airports',
    //   type: 'table',
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: 15,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })

    // new CartoLayer({
    //   id: 'snowflake_query',
    //   connection: 'snowflake',
    //   data: `select * from alass`,
    //   type: 'sql',
    //   filled: true,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })


    // new CartoLayer({
    //   id: 'redshift_query',
    //   connection: 'redshift',
    //   data: 'airports',
    //   type: 'table',
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: f => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })


    // new CartoLayer({
    //   id: 'redshift_query',
    //   connection: 'redshift',
    //   data: 'select * from airports',
    //   type: 'sql',
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: f => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })

  ];
  // update layers in deck.gl.
  deck.setProps({layers});



}
