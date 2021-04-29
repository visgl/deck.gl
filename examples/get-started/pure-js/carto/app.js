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
  // username: 'public',
  // apiKey: 'default_public',
  accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRVNGNZTHAwaThjYnVMNkd0LTE0diJ9.eyJodHRwOi8vakNXbkhLNkUySzJhT3k5akx5M083Wk1waHFHTzlCUEwuYXBwL2VtYWlsIjoiYXBlcmV6QGNhcnRvZGIuY29tIiwiaHR0cDovL2pDV25ISzZFMksyYU95OWpMeTNPN1pNcGhxR085QlBMLmFwcC9hY2NvdW50X2lkIjoiYWNfbXhqZnhuZmoiLCJpc3MiOiJodHRwczovL2NhcnRvLXByb2R1Y3Rpb24udXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA4MzQ5MzYzOTQzMTA1OTg5NDkwIiwiYXVkIjpbImNhcnRvLWNsb3VkLW5hdGl2ZS1hcGkiLCJodHRwczovL2NhcnRvLXByb2R1Y3Rpb24udXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYxOTY4MDc2MSwiZXhwIjoxNjE5NzY3MTYxLCJhenAiOiJqQ1duSEs2RTJLMmFPeTlqTHkzTzdaTXBocUdPOUJQTCIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDpjdXJyZW50X3VzZXIgdXBkYXRlOmN1cnJlbnRfdXNlciByZWFkOmNvbm5lY3Rpb25zIHdyaXRlOmNvbm5lY3Rpb25zIHJlYWQ6bWFwcyB3cml0ZTptYXBzIHJlYWQ6YWNjb3VudCBhZG1pbjphY2NvdW50IiwicGVybWlzc2lvbnMiOlsiYWRtaW46YWNjb3VudCIsInJlYWQ6YWNjb3VudCIsInJlYWQ6YXBwcyIsInJlYWQ6Y29ubmVjdGlvbnMiLCJyZWFkOmN1cnJlbnRfdXNlciIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJ1cGRhdGU6Y3VycmVudF91c2VyIiwid3JpdGU6YXBwcyIsIndyaXRlOmNvbm5lY3Rpb25zIiwid3JpdGU6bWFwcyJdfQ.rOEHWHBwSawHx4HyIzAPNP1KEKfPpGC9wg9s0TGOeaxGG-BXd9ACFs9UziHaDsL-bEcABGazFap5BsLh7VflTtymagf3HWGZW2IyifPZ5o2rX3JQbXl2p7ZW93Nxqh-KcEYmwtfr_E6hC3YJMLjImrLzKJmg641eTh_JLyLy8V8XZXHPAeFVc5LNdR89pu6ZGq1s2qiY_78I0JPfMlfd2QqSHZpWsVgQYHd6kjir-pTOrw_yCTGakh0fyuuU_opP0vlL7bBFakJZkggf3sZoixl5Vu_cfu7Gli4LOEZBv0IbDvbTtXh_TRiuQ9O0xDEswFh_MmY4sZKjAUkft9yBJg',
  mapsUrl: 'https://maps-gcp-us-east1.app.carto.com'
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
    //   provider: 'snowflake',
    //   data: 'alasarr.airports',
    //   type: 'table',
    //   connection: 'dev-snowflake',
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: 15,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })

    new CartoLayer({
      id: 'carto_table',
      mode: 'carto-cloud-native',
      provider: 'snowflake',
      data: 'points_10k',
      type: 'table',
      connection: 'snowflake',
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getRadius: 15,
      getFillColor: [200, 0, 80, 180],
      autoHighlight: true,
      highlightColor: [0, 0, 128, 128],
      pickable: true
    })

    // new CartoLayer({
    //   id: 'carto_table',
    //   // provider: 'snowflake',
    //   mode: 'carto',
    //   data: 'SELECT * FROM populated_places',
    //   type: 'sql',
    //   // connection: 'snowflake',
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: 15,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // })

    // new CartoSQLLayer({
    //   id: 'carto_table',
    //   // provider: 'snowflake',
    //   data: 'SELECT * FROM populated_places',
    //   // connection: 'snowflake',
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