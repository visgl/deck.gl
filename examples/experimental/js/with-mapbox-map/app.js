/* global window, fetch */
import {Deck, GeoJsonLayer, MapController} from 'deck.gl';
import MapBox from './mapbox';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

class App {
  constructor(props) {
    this.state = {
      viewState: {
        latitude: 40,
        longitude: -100,
        zoom: 3,
        bearing: 0,
        pitch: 60
      },
      width: 500,
      height: 500,
      data: null
    };

    fetch(GEOJSON)
      .then(resp => resp.json())
      .then(data => this.setState({data}));

    window.addEventListener('load', this.onLoad.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }

  setState(state) {
    Object.assign(this.state, state);
    this.updateLayers();
  }

  updateLayers() {
    if (this.deckgl) {
      this.deckgl.setProps({
        layers: [
          new GeoJsonLayer({
            data: this.state.data,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2,
            opacity: 0.4,
            getLineColor: () => [255, 100, 100],
            getFillColor: () => [100, 100, 200]
          })
        ]
      });
    }
  }

  setProps(props) {
    this.setState(props);
    this.deckgl.setProps(props);
    this.map.setProps(props);
    this.controller.setProps(props);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.setProps({width, height});
  }

  onViewportChange(viewport) {
    this.setProps(Object.assign({}, viewport, {viewState: viewport}));
  }

  onLoad() {
    const {viewState, width, height} = this.state;

    this.map = new MapBox({
      container: 'map',
      ...viewState,
      width,
      height,
      debug: true
    });

    this.deckgl = new Deck({
      // TODO EventManager should accept element id
      /* global document */
      canvas: document.getElementById('deck'),
      controller: MapController,
      onViewportChange: this.onViewportChange.bind(this),
      viewState,
      width,
      height,
      debug: true
    });

    this.onResize();
  }
}

new App(); // eslint-disable-line
