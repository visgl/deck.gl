/* global document, google */
import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';
import {GeoJsonLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

// Retrieving GOOGLE_MAPS_API_KEY from the environment variable
const gmUrl = `https://maps.googleapis.com/maps/api/js?key=${
  process.env.GOOGLE_MAPS_API_KEY // eslint-disable-line
}&libraries=visualization&v=3.34`;

function loadScript(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  const head = document.querySelector('head');
  head.appendChild(script);
  return new Promise(resolve => {
    script.onload = resolve;
  });
}

loadScript(gmUrl).then(() => {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40, lng: -100},
    zoom: 4
  });

  const overlay = new DeckOverlay({
    layers: [
      new GeoJsonLayer({
        id: 'us-map',
        data: GEOJSON,
        pickable: true,
        autoHighlight: true,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        opacity: 0.4,
        getLineColor: () => [255, 100, 100],
        getFillColor: () => [200, 160, 0, 180]
      })
    ]
  });

  overlay.setMap(map);
});
