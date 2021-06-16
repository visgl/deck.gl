/* global document */
import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {GeoCoordinates} from '@here/harp-geoutils';
import {MapView, MapViewUtils} from '@here/harp-mapview';
import {APIFormat, AuthenticationMethod, OmvDataSource} from '@here/harp-omv-datasource';

// Set your API key here
const API_KEY = process.env.HereApiKey; // eslint-disable-line

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

function updateMapCamera(mapView, viewState) {
  const coords = new GeoCoordinates(viewState.latitude, viewState.longitude);
  const dist = MapViewUtils.calculateDistanceFromZoomLevel(
    {focalLength: mapView.focalLength},
    viewState.zoom + 1
  );
  mapView.lookAt(coords, dist, viewState.pitch, viewState.bearing);
  mapView.zoomLevel = viewState.zoom + 1;
}

const map = new MapView({
  canvas: document.getElementById('map-canvas'),
  theme:
    'https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json',
  // Match deck.gl's FOV = Math.atan(1/3) * 2 / Math.PI * 180
  fovCalculation: {fov: 36.87, type: 'fixed'}
});

const omvDataSource = new OmvDataSource({
  baseUrl: 'https://vector.hereapi.com/v2/vectortiles/base/mc',
  apiFormat: APIFormat.XYZOMV,
  styleSetName: 'tilezen',
  authenticationCode: API_KEY,
  authenticationMethod: {
    method: AuthenticationMethod.QueryString,
    name: 'apikey'
  }
});

map.addDataSource(omvDataSource);
updateMapCamera(map, INITIAL_VIEW_STATE);

export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  // Synchronize deck camera and map camer
  onViewStateChange: ({viewState}) => updateMapCamera(map, viewState),
  onResize: ({width, height}) => map.resize(width, height),
  layers: [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info =>
        // eslint-disable-next-line
        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ]
});
