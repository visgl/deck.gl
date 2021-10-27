import {getMap, setDefaultCredentials, API_VERSIONS} from '@deck.gl/carto';
import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com'
});

async function createMap(mapId) {
  let deck;
  let map;
  const mapConfiguration = {mapId};

  // Auto-refresh is optional
  const autoRefresh = true;
  if (autoRefresh) {
    // Autorefresh the data every 5 seconds
    mapConfiguration.autoRefresh = 5;
    mapConfiguration.onNewData = ({layers}) => {
      deck.setProps({layers});
    };
  }

  const {mapState, mapStyle, layers} = await getMap(mapConfiguration);

  deck = new Deck({
    canvas: 'deck-canvas',
    initialViewState: mapState,
    controller: true,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    },
    layers
  });

  // Mapbox basemap
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}-gl-style/style.json`;

  map = new mapboxgl.Map({
    container: 'map',
    style: MAP_STYLE,
    interactive: false
  });
}

// Helper UI for dev
const examples = [
  '420acda4-088f-448b-82f4-dcaaaf18d5a1',
  'e787df8e-7459-46ea-ade3-55462a44131a',
  'ff6ac53f-741a-49fb-b615-d040bc5a96b8',
  'ba2ef0ba-e7bb-4a9a-a2a0-e8ade556b3d2',
  //'a8cafaa4-9d7f-4fe4-8959-94cd3979a1f4', H3 layer unsupported
  '20c51f51-dedb-4cc2-b0c0-151137977a19',
  '3b47f2df-b4af-4505-a586-c4ac0ded4e14',
  'ae3ab696-3992-4d46-bdd2-b137ef9715d6'
];
const params = new URLSearchParams(location.search.slice(1));
const id = params.has('id') ? params.get('id') : examples[0];

const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = 'calc(50% + 20px)';
iframe.src = `https://gcp-us-east1.app.carto.com/map/${id}`;
document.body.appendChild(iframe);

for (const e of examples) {
  const btn = document.createElement('button');
  btn.innerHTML = e.slice(0, 8);
  btn.style.position = 'relative';
  btn.style.bottom = '40px';
  btn.style.padding = '4px';
  btn.style.float = 'left';
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
