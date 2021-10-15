/* global document, google */
import {CartoLayer, setDefaultCredentials, API_VERSIONS, MAP_TYPES} from '@deck.gl/carto';
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

const powerLayer = new CartoLayer({
  id: 'power-lines',
  connection: 'bigquery',
  type: MAP_TYPES.TILESET,
  data: 'cartobq.nexus_demo.transmission_lines_tileset_simplified',
  getLineColor: [83, 135, 185, 180],
  filled: false,
  stroked: true,
  lineWidthMinPixels: 1,
  credentials: {
    accessToken:
      'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfN3hoZnd5bWwiLCJqdGkiOiJjOTVkODFlZCJ9.6T9_NBCsS5t-MJXDHLLkSSRmh6Pyqrutr9NbdrL5YN8'
  }
});

const overlay = new GoogleMapsOverlay({
  layers: [powerLayer]
});
overlay.setMap(map);
