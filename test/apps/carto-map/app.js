import {getMap, setDefaultCredentials, API_VERSIONS} from '@deck.gl/carto';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com'
});

async function createMap(id) {
  const {mapState, layers} = await getMap({id});
  const overlay = new GoogleMapsOverlay({layers});
  window.layers = layers;
  window.props = layers[0].props;

  const {latitude: lat, longitude: lng, zoom} = mapState;
  const map = new google.maps.Map(mapContainer, {
    mapId: '84591267f7b3a201',
    gestureHandling: 'greedy',
    center: {lat, lng},
    zoom: zoom + 1
  });
  overlay.setMap(map);
}

// Helper UI for dev
const examples = [
  '420acda4-088f-448b-82f4-dcaaaf18d5a1',
  'e787df8e-7459-46ea-ade3-55462a44131a',
  'ff6ac53f-741a-49fb-b615-d040bc5a96b8',
  '20c51f51-dedb-4cc2-b0c0-151137977a19',
  '3b47f2df-b4af-4505-a586-c4ac0ded4e14',
  'ae3ab696-3992-4d46-bdd2-b137ef9715d6'
];
const params = new URLSearchParams(location.search.slice(1));
const id = params.has('id') ? params.get('id') : examples[0];

const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = 'calc(50% + 25px)';
iframe.src = `https://gcp-us-east1.app.carto.com/map/${id}`;

document.body.appendChild(iframe);
for (const e of examples) {
  const btn = document.createElement('button');
  btn.innerHTML = e.slice(0, 8);
  btn.style.position = 'relative';
  btn.style.bottom = '48px';
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

const mapContainer = document.getElementById('map');
mapContainer.style.height = 'calc(50% - 21px)';
mapContainer.style.margin = '5px';
createMap(id);
