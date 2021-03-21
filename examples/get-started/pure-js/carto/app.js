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
  // username: 'carto',
  // apiKey: 'caa6158db8ba3550a16ea2b3505da92374ec92ec',
  accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InU5Umd1M3ZnZ2JYUndWaUYyTm5mNyJ9.eyJpc3MiOiJodHRwczovL2NhcnRvLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwODgyNDc2NDM3Mjk1ODU0MjY5NyIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODI4MiIsImlhdCI6MTYxNjM0NjIwMywiZXhwIjoxNjE2NDMyNjAzLCJhenAiOiJKRDZiUkFVYTJsYjhDVlBOSnVOVTFmZ1lGWVF5b01yRSIsInBlcm1pc3Npb25zIjpbXX0.t1I8pinWqbh3VbYHT39SiBT8JQPqO4CujsfsEx7hbbtY2BV-r5LlggC7DYJNbB-cYw3yrG6qi15FPbzJyeXtsZM90Il9JkICQwGkVFZ4ECgEmOXXOvACnfDSE9QW2EJ0dKdOO7OsBfPhSDBC-IpqGbFXFhnO8Pix_YN_CBk9JA8TagdXavpSquaBu1M552e9M7XJHRlqexrvHSGaE9MARnlvCeF886ipZboUG1fgJO9wL6_fJ8kispup4rqSvhJXebN9Rbt9j2mIbajJAyBKN06Uk1vfaGaqf2WBY1zs06zmAixBJz5VsA7S9BKq-yjhlWXEJvLKbj3mgK08AtcxuA',
  mapsUrl: 'http://localhost:8282'
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
      provider: 'snowflake',
      data: 'select * from alasarr.airports',
      type: 'sql',
      connection: 'dev-snowflake',
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
