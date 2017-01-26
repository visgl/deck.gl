export const MAPBOX_STYLES = {
  LIGHT: 'mapbox://styles/uberdata/cive48w2e001a2imn5mcu2vrs',
  DARK: 'mapbox://styles/uberdata/cive485h000192imn6c6cc8fc'
};

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

export const DEFAULT_VIS_STATE = {
  owner: null,
  meta: {},
  data: null,
  params: {}
};

export const DEFAULT_APP_STATE = {
  headerOpacity: 1,
  isMenuOpen: false
};
