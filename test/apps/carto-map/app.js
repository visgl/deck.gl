import {getMap, setDefaultCredentials, API_VERSIONS} from '@deck.gl/carto';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

const id = 'ae3ab696-3992-4d46-bdd2-b137ef9715d6';

const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = '50%';
iframe.src = `https://gcp-us-east1.app.carto.com/map/${id}`;

document.body.appendChild(iframe);

const mapContainer = document.getElementById('map');
mapContainer.style.height = '50%';

setDefaultCredentials({
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com'
});

async function createMap() {
  const {mapState, layers} = await getMap({id});
  const overlay = new GoogleMapsOverlay({layers});

  const {latitude: lat, longitude: lng, zoom} = mapState;
  const map = new google.maps.Map(mapContainer, {
    mapId: '84591267f7b3a201',
    gestureHandling: 'greedy',
    center: {lat, lng},
    zoom: zoom + 1
  });
  overlay.setMap(map);
}

createMap();
