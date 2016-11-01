export const MAPBOX_STYLES = {
  LIGHT: 'mapbox://styles/ubervispublic/citx7uply008i2hlbno8edv8r',
  DARK: 'mapbox://styles/ubervispublic/citx7v64n00am2io6n8ycriaf'
};

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidWJlcnZpc3B1YmxpYyIsImEiOiJjaXRrY3QxNnMwYWk4MnRtazYwODAxMXp5In0.tfzIQkC6mKPR7meww3nquw';

export const DEFAULT_VIEWPORT_STATE = {
  mapStyle: MAPBOX_STYLES.LIGHT,
  width: 600,
  height: 600,
  latitude: 37.7749295,
  longitude: -122.4194155,
  zoom: 11,
  isDragging: false,
  startDragLngLat: null,
  startBearing: null,
  startPitch: null,
  bearing: 0,
  pitch: 0
};

export const DEFAULT_APP_STATE = {
  owner: null,
  meta: {},
  data: null,
  params: {}
};
