import {fetchMap, setDefaultCredentials} from '@deck.gl/carto';
import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';

// // Simplest instantiation
// const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
// fetchMap({cartoMapId}).then(map => new Deck(map));

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
// const apiBaseUrl = 'https://gcp-us-east1-05.dev.api.carto.com';
setDefaultCredentials({apiBaseUrl});

async function createMap(cartoMapId) {
  const deck = new Deck({canvas: 'deck-canvas'});
  const mapConfiguration = {cartoMapId};

  // Auto-refresh (optional)
  const autoRefresh = false;
  if (autoRefresh) {
    // Autorefresh the data every 5 seconds
    mapConfiguration.autoRefresh = 5;
    mapConfiguration.onNewData = ({layers}) => {
      deck.setProps({layers});
    };
  }

  // Get map info from CARTO and update deck
  const {initialViewState, mapStyle, layers} = await fetchMap(mapConfiguration);
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
  // Spatial index layers
  '202252d8-5647-424a-9317-9e392be59d65', // dynamic spatial index
  '907ee05f-b05c-4784-8226-c59e34773be5', // dynamic tiling
  '433b5f7e-af50-4da3-8803-26dfe58972d8', // dynamic tiling ana
  'ab8cc16b-e6b2-409a-8e0a-39ad6f6dfc12', // dynamic tiling snowflake
  'a42992e9-df58-451e-ad71-d7e91fe4a0df', // No aggregationExp provided

  // Aggregation layers
  'd91a6a6f-0290-4b22-b9cc-fa174cb31a23', // Grid
  '4b34fd92-7890-4bab-8601-008aefebc359', // hex bin
  'b45bb22f-6b2e-4a35-8d46-c8272251f450', // heatmap

  // Layers
  'b874e2d9-7896-4a9e-a0ba-42bdaf8730f5', // Points with altitude column
  '86094c6b-16f7-44fa-aca9-c3dc0617c362', // SF extruded hex
  '420acda4-088f-448b-82f4-dcaaaf18d5a1', // Points with multiple labels
  'ff6ac53f-741a-49fb-b615-d040bc5a96b8', // NYC extruded buildings
  'ba2ef0ba-e7bb-4a9a-a2a0-e8ade556b3d2', // Blended Texas tilesets
  '20c51f51-dedb-4cc2-b0c0-151137977a19', // Europe railways
  '3b47f2df-b4af-4505-a586-c4ac0ded4e14', // Dense point tileset
  'ae3ab696-3992-4d46-bdd2-b137ef9715d6', // Cordoba colored buildings
  '968c03bd-375c-4ec1-92e4-a4caef6efbfb', // Galapagos contours
  '7537fa69-ce7b-4242-9db1-2de8c8526808', // SF point layer
  '6a447e5b-9bb8-41f0-99aa-2e081371b7da', // Minnesota huge circles
  'eb6fa89b-d8d1-4431-ab40-73b0c4b290bd', // Galapagos colored
  '12119dd2-0ddb-4fd2-b48a-15a1b7511e52', // Overlapping empty circles
  '3c892452-3806-4ebf-821b-a76f4562dd0c', // points and lines
  '21cc8261-e626-4778-a78b-76fe8b808214', // markers tilesets
  '4e8f215f-97b4-4f4e-8b53-465c3908c317', // markers points
  '27de26b4-b94f-4e94-b291-41d1a21d3d02' // HexColumn color
];
const params = new URLSearchParams(location.search.slice(1));
const id = params.has('id') ? params.get('id') : examples[0];

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
    window.location = `?id=${e}`;
  };
  document.body.appendChild(btn);
}

const mapContainer = document.getElementById('container');
mapContainer.style.height = 'calc(50% - 26px)';
mapContainer.style.margin = '5px';

createMap(id);
