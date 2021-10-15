import {getMap, setDefaultCredentials, API_VERSIONS} from '@deck.gl/carto';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

const map = new google.maps.Map(document.getElementById('map'), {
  mapId: 'fae05836df2dc8bb',
  gestureHandling: 'greedy',
  center: {lat: 40, lng: -120},
  zoom: 3
});

setDefaultCredentials({
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com'
});

async function createMap() {
  //const {layers} = await getMap({id: 'e787df8e-7459-46ea-ade3-55462a44131a'});
  const {layers} = await getMap({id: 'ae3ab696-3992-4d46-bdd2-b137ef9715d6'});
  const overlay = new GoogleMapsOverlay({layers});
  overlay.setMap(map);
}

createMap();
