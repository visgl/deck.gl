import {fetchMap, FetchMapOptions} from '@deck.gl/carto';
import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';

// // Simplest instantiation
// const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
// fetchMap({cartoMapId}).then(map => new Deck(map));

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
// const apiBaseUrl = 'https://gcp-us-east1-05.dev.api.carto.com';

async function createMap(cartoMapId: string) {
  const deck = new Deck({canvas: 'deck-canvas'});
  const options: FetchMapOptions = {apiBaseUrl, cartoMapId};

  // Auto-refresh (optional)
  const autoRefresh = false;
  if (autoRefresh) {
    // Autorefresh the data every 5 seconds
    options.autoRefresh = 5;
    options.onNewData = ({layers}) => {
      deck.setProps({layers});
    };
  }

  // Get map info from CARTO and update deck
  const {initialViewState, mapStyle, layers} = await fetchMap(options);
  deck.setProps({initialViewState, layers});

  // Mapbox basemap (optional)
  const {label} = mapStyle.visibleLayerGroups;
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}${
    label ? '' : '-nolabels'
  }-gl-style/style.json`;
  const map = new mapboxgl.Map({container: 'map', style: MAP_STYLE, interactive: false});
  deck.setProps({
    controller: true,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    }
  });
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
