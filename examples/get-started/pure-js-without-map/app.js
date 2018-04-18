/* global window, fetch */
import {Deck, GeoJsonLayer, MapController} from 'deck.gl';

// source: Natural Earth http://www.naturalearthdata.com/
// via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const INITIAL_VIEWPORT = {
  latitude: 40,
  longitude: -100,
  zoom: 3,
  bearing: 0,
  pitch: 60
};

class App {
  constructor(props) {
    this.state = {
      viewport: INITIAL_VIEWPORT,
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
            getLineColor: () => [255, 255, 255],
            getFillColor: () => [200, 200, 200]
          })
        ]
      });
    }
  }

  onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  onViewportChange(viewport) {
    this.setState({viewport});
    this.deckgl.setProps(viewport);
    this.controller.setProps(viewport);
  }

  onLoad() {
    this.onResize();

    const {viewport, width, height} = this.state;

    this.deckgl = new Deck({
      ...viewport,
      width,
      height,
      controller: MapController,
      onViewportChange: this.onViewportChange.bind(this),
      layers: []
    });
  }
}

new App(); // eslint-disable-line
