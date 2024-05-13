import {
  BASEMAP,
  fetchMap,
  FetchMapOptions,
  _GoogleBasemap as GoogleBasemap,
  _MapLibreBasemap as MapLibreBasemap
} from '@deck.gl/carto';
import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Loader} from '@googlemaps/js-api-loader';

import {_getStyleUrl} from '@deck.gl/carto';
import {FetchMapResult} from 'modules/carto/src/api/fetch-map';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {MapboxOverlay} from '@deck.gl/mapbox';

// // Simplest instantiation
// const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
// fetchMap({cartoMapId}).then(map => new Deck(map));

// Get proper API key to be able to render Google basemaps, otherwise we
// render on maplibre/positron style
const GOOGLE_MAPS_API_KEY = '';

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
// const apiBaseUrl = 'https://gcp-us-east1-05.dev.api.carto.com';

async function createMapWithDeckController(result: FetchMapResult) {
  const deck = new Deck({canvas: 'deck-canvas'});
  // Get map info from CARTO and update deck
  const {initialViewState, layers} = result;
  deck.setProps({initialViewState, layers});

  const basemap = result.basemap as MapLibreBasemap;
  const map = new mapboxgl.Map({
    container: 'map',
    ...basemap.props,
    interactive: false
  });
  deck.setProps({
    controller: true,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    }
  });
  return deck;
}

async function createMapWithMapboxOverlay(result: FetchMapResult) {
  document.getElementById('deck-canvas')!.style.display = 'none';

  const basemap = result.basemap as MapLibreBasemap;
  const map = new mapboxgl.Map({
    container: 'map',
    ...basemap?.props,
    style: basemap?.props.style || BASEMAP.POSITRON,
    interactive: true,
    attributionControl: false
  }).addControl(
    new mapboxgl.AttributionControl({
      customAttribution: basemap?.attribution
    })
  );

  const overlay = new MapboxOverlay({layers: result.layers});
  map.addControl(overlay);

  return overlay;
}

async function createMapWithGoogleMapsOverlay(result: FetchMapResult) {
  document.getElementById('deck-canvas')!.style.display = 'none';
  const loader = new Loader({apiKey: GOOGLE_MAPS_API_KEY});
  const googlemaps = await loader.importLibrary('maps');

  const basemap = result.basemap as GoogleBasemap;
  const map = new googlemaps.Map(document.getElementById('map')!, {
    ...basemap.props,
    isFractionalZoomEnabled: true,
    disableDefaultUI: true
  });

  const overlay = new GoogleMapsOverlay({layers: result.layers});
  overlay.setMap(map);

  return overlay;
}

async function createMap(cartoMapId: string) {
  const options: FetchMapOptions = {apiBaseUrl, cartoMapId};

  let deck: Deck | GoogleMapsOverlay | MapboxOverlay | undefined;

  // Auto-refresh (optional)
  const autoRefresh = false;
  if (autoRefresh) {
    // Autorefresh the data every 5 seconds
    options.autoRefresh = 5;
    options.onNewData = ({layers}) => {
      deck?.setProps({layers});
    };
  }

  // Get map info from CARTO and update deck
  const result = await fetchMap(options);

  if (GOOGLE_MAPS_API_KEY && result.basemap?.type === 'google-maps') {
    deck = await createMapWithGoogleMapsOverlay(result);
  } else {
    deck = await createMapWithMapboxOverlay(result);
    // deck = await createMapWithDeckController(result);
  }
}

// Helper UI for dev
const examples = [
  // These CARTO maps should live in the "Public" org (ac_lqe3zwgu) using the carto_dw, public_snowflake or public_redshift connection

  // Vector
  '3d72c6eb-9486-42ad-8b62-0f78dd9133eb', // Vector - Table - 500k points fires worldwide
  '8edfb83d-ede2-480d-bb56-42bba198d214', // Vector - Table - 6k lines Galapagos contour
  '542c40c5-2b15-46c7-933b-2586630af6ac', // Vector - Table - 35k points with multiple labels airports
  '84c3ad7a-1d46-4fce-a999-2812426c3015', // Vector - Table - 42k polygons NYC extruded buildings
  'b8abc46c-3c7f-489f-b16f-0664872ad82a', // Vector - Table - Snowflake - 74k bike accidents France
  'c638e42a-a305-4a48-8f7c-b9aa86b31be1', // Vector - Table - Redshift - 45 store points size based on revenue
  '4f5f8894-b895-460c-809d-769ae4e3fd30', // Vector - Tileset - 362M points COVID vaccination custom palette

  // H3
  '06e3898f-fd5e-40dd-bd33-5cd4104d29ee', // H3 - Table - 12M Spatial Features USA extruded
  '8046b5b7-dad4-4b0a-99f1-8e61490b01d4', // H3 — Tileset — 12M Spatial Features USA

  // Quadbin
  'abfce395-d9ec-48d4-85ad-45ec7705a921', // Quadbin - Table - 588k Spatial Features Spain
  '8ead73bb-aa1f-4bf6-91fc-52a50c682938' // Quadbin — Tileset 14M Spatial Features USA
];
const params = new URLSearchParams(location.search.slice(1));
const id = params.has('id') ? params.get('id')! : examples[0];

const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = 'calc(50% + 20px)';
iframe.src = `${apiBaseUrl.replace('api', 'app')}/map/${id}`;
document.body.appendChild(iframe);

for (const e of examples) {
  const btn = document.createElement('button');
  btn.innerHTML = e.slice(0, 4);
  btn.style.position = 'relative';
  btn.style.bottom = '80px';
  btn.style.padding = '8px 0px';
  btn.style.opacity = '0.8';
  btn.style.width = '40px';
  if (e === id) {
    btn.style.background = '#e3f6ff';
  }
  btn.onclick = () => {
    window.location.assign(`?id=${e}`);
  };
  document.body.appendChild(btn);
}

const mapContainer = document.getElementById('container')!;
mapContainer.style.height = 'calc(50% - 26px)';
mapContainer.style.margin = '5px';

createMap(id);
