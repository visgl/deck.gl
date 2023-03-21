import {fetchMap, setDefaultCredentials} from '@deck.gl/carto';
import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';

// // Simplest instantiation
// const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
// fetchMap({cartoMapId}).then(map => new Deck(map));

// const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const apiBaseUrl = 'https://gcp-us-east1-20.dev.api.carto.com';
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
  'd8dc690f-ba79-4286-aa7a-5e7d58ff8dc0' // Label test
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
