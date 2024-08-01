/* global document */
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

function initMapKit() {
  const map = new mapkit.Map('map', {center: new mapkit.Coordinate(37.334883, -122.008977)});
  console.log('load');
}

setTimeout(initMapKit, 1000);
