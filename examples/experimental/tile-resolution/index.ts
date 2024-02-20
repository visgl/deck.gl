import './style.css';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Deck } from '@deck.gl/core';
import { BASEMAP, vectorTableSource, VectorTileLayer } from '@deck.gl/carto';
import GUI from 'lil-gui';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const accessToken = import.meta.env.VITE_TOKEN;
const connectionName = import.meta.env.VITE_CONNECTION;
const tableName = import.meta.env.VITE_GLOBAL_TILESET;

const cartoConfig = { apiBaseUrl, accessToken, connectionName };

///////////////////////////////////////////////////////////////
// MAP

const INITIAL_VIEW_STATE = {
  latitude: 36.5210,
  longitude: -6.2805,
  zoom: 14,
  minZoom: 1,
  pitch: 0,
  bearing: 0,
};

const map = new maplibregl.Map({
  container: 'map',
  style: BASEMAP.POSITRON,
  interactive: false,
});

const deck = new Deck({
  canvas: 'deck-canvas',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true
});

deck.setProps({
  onViewStateChange: ({viewState}) => {
    const {longitude, latitude, ...rest} = viewState;
    map.jumpTo({center: [longitude, latitude], ...rest});
  }
});

///////////////////////////////////////////////////////////////
// GUI

const searchParams = new URLSearchParams(location.search);

const params = { 
  tileSize: Number(searchParams.get('tileSize')) || 1024,
  tileResolution: Number(searchParams.get('tileResolution')) || 1
};

const gui = new GUI({width: 150});
gui.add(params, 'tileSize', [128, 256, 512, 1024, 2048]);
gui.add(params, 'tileResolution', [0.25, 0.5, 1, 2, 4]);
gui.onChange(render);

///////////////////////////////////////////////////////////////
// RENDER

let layer: VectorTileLayer;

function render() {
  const source = vectorTableSource({
    ...cartoConfig,
    tableName,
    // @ts-ignore
    tileResolution: params.tileResolution
  });

  layer = new VectorTileLayer({
    id: 'roads',
    data: source as any,
    tileSize: params.tileSize,
    uniqueIdProperty: 'geoid',
    pointRadiusUnits: 'pixels',
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    pickable: false,
  });

  deck.setProps({ layers: [layer] });

  searchParams.set('tileSize', params.tileSize + '');
  searchParams.set('tileResolution', params.tileResolution + '');
  history.replaceState(null, '', location.pathname + '?' + searchParams.toString())
}

render();
