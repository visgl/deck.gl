/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, WebMercatorViewport} from 'deck.gl';
import TimeSlicedScatterplotLayer from
 './time-sliced-scatterplot-layer/time-sliced-scatterplot-layer.js';
import {json as requestJson} from 'd3-request';
import assert from 'assert';

const tileParams = {
  userID: `viz2`,
  zoom: 0,
  xTileNoStart: 2,
  yTileNoStart: 4,
  xTileNo: 0,
  yTileNo: 0,
  layergroupid: `4995f7f31f735a7eef2a2968f04433a3:0`
}

const colorMap = [[0, 0, 255], [255, 0, 0], [0, 255, 0], [255, 255, 0], [255, 0, 255], [0, 255, 255]];

// const tileParams = {
//   userID: `javi`,
//   zoom: 17,
//   xTileNoStart: 38597,
//   yTileNoStart: 49256,
//   xTileNo: 0,
//   yTileNo: 0,
//   layergroupid: `168d1645f74d1355a17adc6c341eb5d1:1494934031794`
// }

// URL from this GIST https://gist.github.com/javisantana/68e50e70bf5463dbcaaf205063fcef00
// const TORQUE_TILE_SOURCE = 'https://cartocdn-ashbu_b.global.ssl.fastly.net/javi/api/v1/map/168d1645f74d1355a17adc6c341eb5d1:1494934031794/0/17/38597/49256.json.torque';


// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line

const INITIAL_VIEWPORT = {
  latitude: 36,
  longitude: -40,
  zoom: 6,
  bearing: 0,
  pitch: 0
};

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: INITIAL_VIEWPORT,
      width: 0,
      height: 0,
      currentTime: 0,
      points: []
    };

    const startTile = this._latLonToTileNum(INITIAL_VIEWPORT.latitude, INITIAL_VIEWPORT.longitude, INITIAL_VIEWPORT.zoom);
    tileParams.xTileNoStart = startTile[0];
    tileParams.yTileNoStart = startTile[1];
    tileParams.zoom = INITIAL_VIEWPORT.zoom;
    const tilesToFetchX = 16;
    const tilesToFetchY = 8;

    for (let i = 0; i < tilesToFetchX; i++) {
      for (let j = 0; j < tilesToFetchY; j++) {

        tileParams.xTileNo = tileParams.xTileNoStart - Math.floor(tilesToFetchX / 2) + i;
        tileParams.yTileNo = tileParams.yTileNoStart - Math.floor(tilesToFetchY / 2) + j;

        tileParams.url = `https://cartocdn-ashbu_b.global.ssl.fastly.net/${tileParams.userID}/api/v1/map/${tileParams.layergroupid}/0/${tileParams.zoom}/${tileParams.xTileNo}/${tileParams.yTileNo}.json.torque`; // eslint-disable-line

        this.loadTorqueTile(Object.assign({}, tileParams));
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._animate();
  }

  _resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _animate() {
    const {currentTime} = this.state;

    this.setState({
      currentTime: (currentTime + 1) & 255
    });

    if (typeof window !== 'undefined') {
      this._animationFrame = window.setTimeout(this._animate.bind(this), 100);
    }
  }

  loadTorqueTile(tileParams) {
    console.log("URL: ", tileParams.url);

    requestJson(tileParams.url, (error, response) => {
      if (error) {
        console.error(error); // eslint-disable-line
      } else {
        const newPoints = this.state.points.concat(this.parseTorqueTile(response, tileParams));
        this.setState({points: newPoints});
      }
    });
  }

  // Parses a torque tile into a linear array of points which is easier for deck.gl to deal with
  // @param {Array} tile - a torque tile is an array of "pixels"
  // @return {Array} - returns an array of points
  parseTorqueTile(tile, tileParams) {
    const tileString = JSON.stringify(tile);
    console.log(`tileParams ${tileParams}, tileString`);
    assert(Array.isArray(tile), 'Cannot parse torque tile - expected array of pixels');
    const corners = this._tileNumToLatLon(tileParams.xTileNo, tileParams.yTileNo, tileParams.zoom);
    const n = Math.pow(2.0, tileParams.zoom);

    const xTileSize = corners.east - corners.west;
    const yTileSize = corners.north - corners.south;

    // this.setState({
    //   viewport: {
    //     latitude: (corners.south + corners.north) / 2,
    //     longitude: (corners.west + corners.east) / 2,
    //     zoom: tileParams.zoom,
    //     bearing: 0,
    //     pitch: 0
    //   }
    // });

    const points = [];
    for (const pixel of tile) {
      assert(
        Number.isFinite(pixel.x__uint8) && Number.isFinite(pixel.y__uint8) &&
        Array.isArray(pixel.vals__uint8) && Array.isArray(pixel.dates__uint16) &&
        pixel.vals__uint8.length === pixel.dates__uint16.length,
        'Cannot parse torque tile - expected torque pixel'
      );

      // Generate a linear set of points from the vals and dates arrays
      for (let i = 0; i < pixel.vals__uint8.length; ++i) {
        points.push({
          position: [corners.west + pixel.x__uint8 / 256 * xTileSize, corners.south + pixel.y__uint8 / 256 * yTileSize],
          value: pixel.vals__uint8[i],
          time: pixel.dates__uint16[i]
        });
      }
    }

    return points;
  }

  //Get the southwest corner of the tile
  // http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
  _tileNumToLatLon(xTile, yTile, zoom) {
    const n = Math.pow(2.0, zoom);
    const west = xTile / n * 360 - 180;
    const east = (xTile + 1) / n * 360 - 180;
    const south = Math.atan(Math.sinh(Math.PI * (1 - 2 * (yTile + 1) / n))) / Math.PI * 180;
    const north = Math.atan(Math.sinh(Math.PI * (1 - 2 * (yTile) / n))) / Math.PI * 180
    console.log('west, east, south, north: ', west, east, south, north)
    return {west, east, south, north};
  }

  _latLonToTileNum(lat, lon, zoom) {

    const lat_rad = lat / 180 * Math.PI;
    const n = Math.pow(2.0, zoom);
    const xtile = Math.floor((lon + 180.0) / 360.0 * n)
    const ytile = Math.floor((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n)
    return [xtile, ytile];
  }


  render() {
    const {viewport, width, height, currentTime} = this.state;

    return (
      <MapGL
        {...viewport}
        width={width}
        height={height}
        perspectiveEnabled
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onChangeViewport={this._onChangeViewport.bind(this)}>
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          debug
          layers={[
            new TimeSlicedScatterplotLayer({
              data: this.state.points,
              fp64: true,
              radiusMinPixels: 2,
              currentTime,
              fadeFactor: 0.1,
              getColor: x => colorMap[x.value] || [0, 255, 255],
              getRadius: x => 3,
              getTime: x => x.time * 10
            })
          ]} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
