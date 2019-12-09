import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { TerrainLayer } from "./terrain-layer/TerrainLayer";
import { load } from "@loaders.gl/core";
import { ImageLoader } from "@loaders.gl/images";
import { TileLayer } from "@deck.gl/geo-layers";

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const INITIAL_VIEW_STATE = {
  longitude: 103.851959,
  latitude: 1.290270,
  zoom: 15.5,
  pitch: 45,
  bearing: 0
};

// Load Tile Data
const enableSectional = false;
const getTileData = ({ x, y, z }) => {
  // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  const street = "https://c.tile.openstreetmap.org";
  const sectional = "https://wms.chartbundle.com/tms/1.0.0/sec";
  const terrainRgb = "https://api.mapbox.com/v4/mapbox.terrain-rgb";
  const satellite = "https://api.mapbox.com/v4/mapbox.satellite";

  let mapTile = `${satellite}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
  if (enableSectional) {
    mapTile = `${sectional}/${z}/${x}/${y}.png?origin=nw`;
  }

  const terrainTile = `${terrainRgb}/${z}/${x}/${y}@2x.pngraw?access_token=${MAPBOX_TOKEN}`;

  return Promise.all([
    load(mapTile),
    load(terrainTile, ImageLoader)
  ]);
}

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this._deck = null;
  }

  _renderLayers() {
    // const {data = DATA_URL} = this.props;

    return [
      new TileLayer({
        id: "terrain-tiles",
        pickable: false,
        onHover: this._onHover,
        // autoHighlight,
        // highlightColor,
        opacity: 1,
        // https://wiki.openstreetmap.org/wiki/Zoom_levels
        minZoom: 0,
        maxZoom: 23,
        maxCacheSize: 500,

        getTileData,

        renderSubLayers: props => {
          const {
            bbox: { west, south, east, north }
          } = props.tile;

          // if (north < 43 && south > 34 && east < -118 && west > -126) {
            console.log(props.tile);
            return new TerrainLayer(props, {
              data: [],
              pickable: false,
              images: props.data,
              cutoffHeightM: 50.0,
              peakHeightM: 500.0,
              bounds: [west, south, east, north]
            });
          // }
        }
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = false} = this.props;

    return (
      <DeckGL
        ref={ref => {
          this._deck = ref && ref.deck;
        }}
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
