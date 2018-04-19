import mapboxgl from 'mapbox-gl';

/**
 * A simple mapbox-gl wrapper that works with deck props
 */
export default class MapboxMap {
  constructor(props) {
    const {mapboxApiAccessToken, viewState} = props;

    mapboxgl.accessToken = mapboxApiAccessToken;

    this._map = new mapboxgl.Map({
      ...props,
      interactive: false,
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  }

  setProps(props) {
    const {viewState} = props;

    if (viewState) {
      this._map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch
      });
    }
  }

  finalize() {
    this._map.remove();
  }
}
