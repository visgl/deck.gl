/* global window, fetch */
import {experimental, GeoJsonLayer} from 'deck.gl';
const {Deck} = experimental;
import MapBox from './mapbox';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -100,
  zoom: 3,
  bearing: 0,
  pitch: 60
};

class App {
  constructor(props) {
    this.deckgl = new Deck({
      canvas: 'deck',
      onViewStateChange: this.onViewStateChange.bind(this),
      viewState: INITIAL_VIEW_STATE,
      autoResize: true
    });

    this.map = new MapBox({
      container: 'map',
      ...INITIAL_VIEW_STATE
    });

    fetch(GEOJSON)
      .then(resp => resp.json())
      .then(data => this.deckgl.setProps({layers: this.renderLayers(data)}));
  }

  onViewStateChange({viewState}) {
    this.deckgl.setProps({viewState});
    this.map.setProps(viewState.props);
  }

  renderLayers(data) {
    return [
      new GeoJsonLayer({
        data,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        opacity: 0.4,
        getLineColor: () => [255, 100, 100],
        getFillColor: () => [100, 100, 200]
      })
    ];
  }
}

window.addEventListener('load', () => new App());
