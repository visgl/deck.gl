/* global window, fetch */
import {Deck, GeoJsonLayer, MapController} from 'deck.gl';
import TimeSlicedScatterplotLayer from './time-sliced-scatterplot-layer/time-sliced-scatterplot-layer';

import {parseTile, lngLatToTile, getTileUrl} from './utils/carto-torque-utils';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const TILE_PARAMS = {
  userID: 'viz2',
  longitude: -40,
  latitude: 36,
  zoom: 6,
  xTileNoStart: 2,
  yTileNoStart: 4,
  xTileNo: 0,
  yTileNo: 0,
  layergroupid: '4995f7f31f735a7eef2a2968f04433a3:0'
};

const COLOR_MAP = [
  [0, 0, 255],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [255, 0, 255],
  [0, 255, 255]
];

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -100,
  zoom: 2,
  bearing: 0,
  pitch: 60
};

class App {
  constructor(props) {
    this.state = {
      data: null,
      points: [{position: [-100, 40], value: 1}],
      currentTime: 0
    };

    this.deckgl = new Deck({
      viewState: INITIAL_VIEW_STATE,
      width: '100%',
      height: '100%',
      layers: [],
      controller: MapController,
      onViewStateChange: this.onViewStateChange.bind(this),
      onResize: this.onResize.bind(this),
      debug: true
    });

    this.fetchCartoTiles();

    fetch(GEOJSON)
      .then(resp => resp.json())
      .then(data => this.setState({data}));

    this.onAnimate();
  }

  setState(state) {
    Object.assign(this.state, state);
    this.updateLayers();
  }

  setProps(props) {
    this.setState(props);
    this.deckgl.setProps(props);
    // this.map.setProps(props);
  }

  fetchCartoTiles() {
    const startTile = lngLatToTile(TILE_PARAMS);
    TILE_PARAMS.xTileNoStart = startTile[0];
    TILE_PARAMS.yTileNoStart = startTile[1];
    const tilesToFetchX = 16;
    const tilesToFetchY = 8;

    for (let i = 0; i < tilesToFetchX; i++) {
      for (let j = 0; j < tilesToFetchY; j++) {
        const tileParams = Object.assign({}, TILE_PARAMS, {
          xTileNo: TILE_PARAMS.xTileNoStart - Math.floor(tilesToFetchX / 2) + i,
          yTileNo: TILE_PARAMS.yTileNoStart - Math.floor(tilesToFetchY / 2) + j
        });

        fetch(getTileUrl(tileParams))
          .then(resp => resp.json())
          .then(tileData => {
            const newPoints = this.state.points.concat(parseTile({tileData, tileParams}));
            this.setState({points: newPoints});
          });
      }
    }
  }

  updateLayers() {
    // console.log(this.state.currentTime);
    this.deckgl.setProps({
      layers: [
        new GeoJsonLayer({
          data: this.state.data,
          stroked: true,
          filled: true,
          lineWidthMinPixels: 2,
          getLineColor: () => [255, 255, 255],
          getFillColor: () => [200, 200, 200]
        }),
        new TimeSlicedScatterplotLayer({
          data: this.state.points,
          fp64: true,
          radiusMinPixels: 2,
          currentTime: this.state.currentTime,
          fadeFactor: 0.1,
          getColor: x => COLOR_MAP[x.value] || [0, 255, 255],
          getRadius: x => 3,
          getTime: x => x.time * 10
        })
      ]
    });
  }

  onViewStateChange({viewState}) {
    this.setState({viewState});
    this.deckgl.setProps(viewState);
  }

  onResize({width, height}) {
    this.setProps({width, height});
  }

  onViewportChange(viewport) {
    this.setProps(Object.assign({}, viewport, {viewState: viewport}));
  }

  onAnimate() {
    const {currentTime} = this.state;
    this.setState({
      currentTime: currentTime > 10 ? 0 : currentTime + 0.1
    });
    if (typeof window !== 'undefined') {
      this._animationFrame = window.setTimeout(this.onAnimate.bind(this), 100);
    }
  }
}

window.addEventListener('load', () => new App());
