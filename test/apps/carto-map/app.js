import {CartoLayer, getMap, setDefaultCredentials, API_VERSIONS, MAP_TYPES} from '@deck.gl/carto';
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
  const cartoMap = await getMap({id: 'e787df8e-7459-46ea-ade3-55462a44131a'});
  console.log(cartoMap);

  const layer = new CartoLayer({
    id: 'retail',
    connection: 'bigquery',
    type: MAP_TYPES.TABLE,
    data: 'cartobq.public_account.retail_stores',
    credentials: {
      accessToken:
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfN3hoZnd5bWwiLCJqdGkiOiJiMTlmNTkyNyJ9.A0mFn-Lb5J50aw65BoaKLxjZDWKN_5zH7qYqQ29zsxg'
    },

    filled: true,
    stroked: false,
    pointType: 'circle',
    pointRadiusUnits: 'pixels',
    getPointRadius: 3,
    getFillColor: [255, 0, 0, 255]
  });

  const overlay = new GoogleMapsOverlay({
    layers: [layer]
  });
  overlay.setMap(map);
}

createMap();
