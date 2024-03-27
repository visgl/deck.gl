import {H3TileLayer, getHexagonResolution, h3TableSource} from '@deck.gl/carto';
import {Deck, MapView, WebMercatorViewport} from '@deck.gl/core';
import {PathStyleExtension} from '@deck.gl/extensions';
import {H3HexagonLayer, TileLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer, PathLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import fetchMapResponse from './carto-map-3ab94591-b2be-4737-8d60-cd1907dde9ae.json';
import {GUI} from 'lil-gui';

const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const TILE_SIZE_TO_RESOLUTION: Record<256 | 512 | 1024 | 2048, 0.25 | 0.5 | 1 | 2> = {
  256: 0.25,
  512: 0.5,
  1024: 1,
  2048: 2
};

async function createMap() {
  const initialViewState = fetchMapResponse.keplerMapConfig.config.mapState;
  const mapStyle = fetchMapResponse.keplerMapConfig.config.mapStyle;
  const layerConfigs = fetchMapResponse.keplerMapConfig.config.visState.layers;
  const layerProps = layerConfigs[0].config.visConfig;

  const leftParams = {
    tileSize: 512,
    aggregationResLevel: 3,
    bias: 2
  };
  const rightParams = {
    tileSize: 1024,
    aggregationResLevel: 4,
    bias: 2.333
  };

  ///////////////////////////////////////////////////////////////////////////////
  // DATA
  //

  const defaultTableProps = {
    apiBaseUrl,
    accessToken,
    tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_esp_h3res8_v1_yearly_v2',
    aggregationExp: 'APPROX_TOP_COUNT(urbanity, 1)[OFFSET(0)].value as urbanity_mode',
    connectionName: 'carto_dw'
  };
  const createLeftData = () =>
    h3TableSource({
      ...defaultTableProps,
      aggregationResLevel: leftParams.aggregationResLevel,
      tileResolution: TILE_SIZE_TO_RESOLUTION[leftParams.tileSize]
    });
  const createRightData = () =>
    h3TableSource({
      ...defaultTableProps,
      aggregationResLevel: rightParams.aggregationResLevel,
      tileResolution: TILE_SIZE_TO_RESOLUTION[rightParams.tileSize],
    });

  ///////////////////////////////////////////////////////////////////////////////
  // LAYERS
  //

  const baseLayerProps = {
    lineMiterLimit: 2,
    lineWidthUnits: 'pixels',
    pointRadiusUnits: 'pixels',
    rounded: true,
    aggregationExp: 'APPROX_TOP_COUNT(urbanity, 1)[OFFSET(0)].value as urbanity_mode',
    uniqueIdProperty: 'geoid',
    autoHighlight: true,
    visible: true,
    cartoLabel: 'H3 Urbanity',
    extruded: false,
    elevationScale: 5,
    filled: true,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [130, 154, 227, 230],
    stroked: true,
    getLineWidth: 1,
    getPointRadius: 2,
    highlightColor: [252, 242, 26, 255]
  } as any;

  const createLeftLayer = () =>
    new H3TileLayer({
      ...baseLayerProps,
      id: 'left',
      data: createLeftData(),
      tileSize: leftParams.tileSize,
      aggregationResLevel: leftParams.aggregationResLevel,
      bias: leftParams.bias,
      getLineColor: [200, 128, 0, 230],
    });

  const createRightLayer = () =>
    new H3TileLayer({
      ...baseLayerProps,
      id: 'right',
      data: createRightData(),
      tileSize: rightParams.tileSize,
      aggregationResLevel: rightParams.aggregationResLevel,
      bias: rightParams.bias,
      getLineColor: [128, 200, 0, 230],
    });

  ///////////////////////////////////////////////////////////////////////////////
  // DECK
  //

  const deck = new Deck({
    canvas: 'deck-canvas',
    initialViewState,
    views: [
      new MapView({id: 'left', x: 0, y: 0, width: '50%', height: '100%', controller: true}),
      new MapView({id: 'right', x: '50%', y: 0, width: '50%', height: '100%', controller: true})
    ],
    layers: [createLeftLayer(), createRightLayer()],
    layerFilter: ({layer, viewport}) => viewport.id === layer.id,
    onViewStateChange: ({viewState}) => {
      deck.setProps({
        viewState
        // layers: [...layers, ...createHexagonLayers(viewState)]
      });
    }
  });

  ///////////////////////////////////////////////////////////////////////////////
  // GUI
  //

  const leftGUI = new GUI({
    width: 200,
    container: document.querySelector<HTMLElement>('.gui.-left')!
  });
  const rightGUI = new GUI({
    width: 200,
    container: document.querySelector<HTMLElement>('.gui.-right')!
  });

  const guiList = [
    [leftGUI, leftParams],
    [rightGUI, rightParams]
  ] as const;

  for (const [gui, params] of guiList) {
    gui.add(params, 'tileSize', [256, 512, 1024, 2048]);
    gui.add(params, 'aggregationResLevel', [2, 3, 4, 5]);
    gui.add(params, 'bias');
    gui.onChange(() => {
      deck.setProps({layers: [createLeftLayer(), createRightLayer()]});
    });
  }
}

createMap();

///////////////////////////////////////////////////////////////////////////////
// PRODUCTION COMPARISON
//

// Helper UI for dev
const id = '3ab94591-b2be-4737-8d60-cd1907dde9ae';
const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = '50vh';
iframe.src = `${apiBaseUrl.replace('api', 'app')}/map/${id}`;
document.body.appendChild(iframe);

const mapContainer = document.getElementById('container')!;
mapContainer.style.height = 'calc(50vh - 4px)';
mapContainer.style.margin = '5px';

// Support h3 v3/v4 (https://h3geo.org/docs/library/migration-3.x/functions)
const kRing = h3.kRing || h3.gridDisk;
const geoToH3 = h3.geoToH3 || h3.latLngToCell;
const getH3UnidirectionalEdgesFromHexagon =
  h3.getH3UnidirectionalEdgesFromHexagon || h3.originToDirectedEdges;
const exactEdgeLength = h3.exactEdgeLength || h3.edgeLength;
const h3ToGeoBoundary = h3.h3ToGeoBoundary || h3.cellToBoundary;
const polyfill = h3.polyfill || h3.polygonToCells;
const getRes0Indexes = h3.getRes0Indexes;

// Style
const GREEN = [128, 189, 164];
const PINK = [245, 41, 95];

// Visualization
function createHexagonLayers(viewState) {
  const viewport = new WebMercatorViewport(viewState);
  let polygon = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([viewport.width, viewport.height]),
    viewport.unproject([0, viewport.height])
  ];
  polygon.push(polygon[0]);
  polygon = turf.polygon([polygon]);

  const resolution512 = getHexagonResolution(viewState, 512);
  const resolution1024 = getHexagonResolution(viewState, 1024);
  const hexagons512 = getHexagonsInView(viewState, Math.floor(resolution512));
  const hexagons1024 = getHexagonsInView(viewState, Math.floor(resolution1024));

  // Stats display
  // const totalHex = 122 * Math.pow(7, r); // estimate
  // const el = document.getElementById('textfield');
  // el.innerHTML = `Hexagons: ${hexagons.length}/${totalHex}, resolution: ${r}`;

  return [
    new H3HexagonLayer({
      id: 'hex512',
      data: hexagons512,
      getHexagon: d => d,
      getLineColor: [255, 0, 0, 127],
      extruded: false,
      filled: false,
      stroked: true,
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      parameters: {
        depthTest: false
      }
    }),
    new H3HexagonLayer({
      id: 'hex1024',
      data: hexagons1024,
      getHexagon: d => d,
      getLineColor: [0, 255, 0, 127],
      extruded: false,
      filled: false,
      stroked: true,
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      parameters: {
        depthTest: false
      },
      getDashArray: [3, 2],
      extensions: [new PathStyleExtension({dash: true})]
    })
  ];
}

// H3 helpers
function getHexagonsInView(view, resolution) {
  const viewport = new WebMercatorViewport(view);
  if (resolution >= 15) {
    const center = geoToH3(viewport.latitude, viewport.longitude, 15);
    return kRing(center, 1);
  }

  let polygon = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([viewport.width, viewport.height]),
    viewport.unproject([0, viewport.height])
  ];
  polygon.push([...polygon[0]]);

  const lonList = polygon.map(c => c[0]);
  const [west, east] = [Math.min(...lonList), Math.max(...lonList)];

  polygon = turf.polygon([polygon]);

  let hexagons = [];
  const el = document.getElementById('textfield2');

  if (east - west > 140) {
    // 140 is heuristic
    // For longitude spans greater than 180 h3 polyfill doesn't work
    // and turf.buffer has issues also, so just take all hexagons
    hexagons = getRes0Indexes();
    el.innerHTML = `Edge length: -`;
  } else {
    // Probably overkill to consider all edges
    // hexagons = getHexagonsInPolygon(polygon, resolution);
    if (!hexagons.length) {
      hexagons.push(geoToH3(viewport.latitude, viewport.longitude, resolution));
    }

    let edges = [];
    hexagons.forEach(h => {
      edges = edges.concat(getH3UnidirectionalEdgesFromHexagon(h));
    });
    const edgeLengths = edges.map(e => exactEdgeLength(e, 'km'));
    const maxEdgeLength = Math.max(...edgeLengths);
    el.innerHTML = `Edge length: ${Math.round(1000 * maxEdgeLength)}m`;

    const buffered = turf.buffer(polygon, maxEdgeLength); // Doesn't work for polygons wider than world
    hexagons = getHexagonsInPolygon(buffered, resolution);
  }

  const visible = hexagons.filter(h => {
    const boundary = h3ToGeoBoundary(h, true);
    return turf.booleanIntersects(turf.lineString(boundary), polygon);
  });

  const el2 = document.getElementById('textfield3');
  el2.innerHTML = `Culled: ${hexagons.length - visible.length}`;
  return visible;
}

function getHexagonsInPolygon(polygon, resolution) {
  return polyfill(polygon.geometry.coordinates, resolution, true);
}
