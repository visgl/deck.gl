import {fetchMap, FetchMapOptions} from '@deck.gl/carto';
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {PathStyleExtension} from '@deck.gl/extensions';
import {H3HexagonLayer, TileLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer, PathLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';

// // Simplest instantiation
const cartoMapId = '3ab94591-b2be-4737-8d60-cd1907dde9ae';
// fetchMap({cartoMapId}).then(map => new Deck(map));

const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
// const apiBaseUrl = 'https://gcp-us-east1-05.dev.api.carto.com';

async function createMap(cartoMapId: string) {
  const deck = new Deck({canvas: 'deck-canvas'});
  const options: FetchMapOptions = {apiBaseUrl, cartoMapId};

  // Auto-refresh (optional)
  const autoRefresh = false;
  if (autoRefresh) {
    // Autorefresh the data every 5 seconds
    options.autoRefresh = 5;
    options.onNewData = ({layers}) => {
      deck.setProps({layers});
    };
  }

  // Get map info from CARTO and update deck
  const {initialViewState, mapStyle, layers} = await fetchMap(options);
  deck.setProps({initialViewState, layers});

  // Mapbox basemap (optional)
  const {label} = mapStyle.visibleLayerGroups;
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}${
    label ? '' : '-nolabels'
  }-gl-style/style.json`;
  const map = new mapboxgl.Map({container: 'map', style: MAP_STYLE, interactive: false});
  deck.setProps({
    controller: true,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
      deck.setProps({
        layers: [...layers, ...createHexagonLayers(viewState)]
      });
    }
  });
}

// Helper UI for dev
const examples = [
  // These CARTO maps should live in the "Public" org (ac_lqe3zwgu) using the carto_dw, public_snowflake or public_redshift connection

  // Mine
  '3ab94591-b2be-4737-8d60-cd1907dde9ae', // H3

  // Vector
  '3d72c6eb-9486-42ad-8b62-0f78dd9133eb', // Vector - Table - 500k points fires worldwide
  '8edfb83d-ede2-480d-bb56-42bba198d214', // Vector - Table - 6k lines Galapagos contour
  '542c40c5-2b15-46c7-933b-2586630af6ac', // Vector - Table - 35k points with multiple labels airports
  '84c3ad7a-1d46-4fce-a999-2812426c3015', // Vector - Table - 42k polygons NYC extruded buildings
  'b8abc46c-3c7f-489f-b16f-0664872ad82a', // Vector - Table - Snowflake - 74k bike accidents France
  'c638e42a-a305-4a48-8f7c-b9aa86b31be1', // Vector - Table - Redshift - 45 store points size based on revenue
  '4f5f8894-b895-460c-809d-769ae4e3fd30', // Vector - Tileset - 362M points COVID vaccination custom palette

  // H3
  '06e3898f-fd5e-40dd-bd33-5cd4104d29ee', // H3 - Table - 12M Spatial Features USA extruded
  '8046b5b7-dad4-4b0a-99f1-8e61490b01d4', // H3 — Tileset — 12M Spatial Features USA

  // Quadbin
  'abfce395-d9ec-48d4-85ad-45ec7705a921', // Quadbin - Table - 588k Spatial Features Spain
  '8ead73bb-aa1f-4bf6-91fc-52a50c682938' // Quadbin — Tileset 14M Spatial Features USA
];
const params = new URLSearchParams(location.search.slice(1));
const id = params.has('id') ? params.get('id')! : examples[0];

const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = 'calc(50% + 20px)';
iframe.src = `${apiBaseUrl.replace('api', 'app')}/map/${id}`;
document.body.appendChild(iframe);

for (const e of examples) {
  const btn = document.createElement('button');
  btn.innerHTML = e.slice(0, 4);
  btn.style.position = 'relative';
  btn.style.bottom = '80px';
  btn.style.padding = '8px 0px';
  btn.style.opacity = '0.8';
  btn.style.width = '40px';
  if (e === id) {
    btn.style.background = '#e3f6ff';
  }
  btn.onclick = () => {
    window.location.assign(`?id=${e}`);
  };
  document.body.appendChild(btn);
}

const mapContainer = document.getElementById('container')!;
mapContainer.style.height = 'calc(50% - 26px)';
mapContainer.style.margin = '5px';

createMap(id);

// Relative scale factor (0 = no biasing, 2 = a few hexagons cover view)
const BIAS = 2;
export function getHexagonResolution(
  viewport: {zoom: number; latitude: number},
  tileSize: number
): number {
  const zoomOffset = 0; // Math.log2(tileSize / 512);
  const hexagonScaleFactor = (2 / 3) * (viewport.zoom - zoomOffset);
  const latitudeScaleFactor = Math.log(1 / Math.cos((Math.PI * viewport.latitude) / 180));
  const tileSizeScaleFactor = Math.log2(512 / tileSize);

  // Clip and bias
  return Math.max(
    0,
    Math.floor(hexagonScaleFactor + latitudeScaleFactor + tileSizeScaleFactor - BIAS)
  );
}

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

  console.log(`512: ${hexagons512.length}, 1024: ${hexagons1024.length}`);

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
