import {H3TileLayer, getHexagonResolution, h3TableSource} from '@deck.gl/carto';
import {Deck, MapView} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import fetchMapResponse from './carto-map-3ab94591-b2be-4737-8d60-cd1907dde9ae.json';
import {GUI} from 'lil-gui';
import { getHexagonsInView } from './h3-utils';

const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

type TileSize = 256 | 512 | 1024 | 1448 | 2048;
type TileResolution = 0.25 | 0.5 | 1 | 2;
const TILE_SIZE_TO_RESOLUTION: Record<TileSize, TileResolution> = {
  256: 0.25,
  512: 0.5,
  1024: 1,
  1448: 1,
  2048: 2
};

async function createMap() {
  const initialViewState = fetchMapResponse.keplerMapConfig.config.mapState;

  interface Params {
    tileSize: TileSize;
    aggregationResLevel: number;
    bias: number;
    color: [number, number, number, number];
  }
  const leftParams: Params = {
    tileSize: 512,
    aggregationResLevel: 3,
    bias: 2,
    color: [200, 128, 0, 230]
  };
  const rightParams: Params = {
    tileSize: 1024,
    aggregationResLevel: 4,
    bias: 2.333,
    color: [128, 200, 0, 230]
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
  const createData = (params: Params) =>
    h3TableSource({
      ...defaultTableProps,
      aggregationResLevel: params.aggregationResLevel,
      tileResolution: TILE_SIZE_TO_RESOLUTION[params.tileSize]
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

  const createLayer = (id: string, params: Params) =>
    new H3TileLayer({
      ...baseLayerProps,
      id: id,
      data: createData(params),
      tileSize: params.tileSize,
      aggregationResLevel: params.aggregationResLevel,
      bias: params.bias,
      getLineColor: params.color
    });

  const createDebugLayer = (
    id: string,
    viewState: {zoom: number; latitude: number},
    params: Params
  ) =>
    new H3HexagonLayer({
      id: id,
      data: getHexagonsInView(
        viewState,
        Math.floor(getHexagonResolution(viewState, params.tileSize, params.bias))
      ),
      getHexagon: d => d,
      getLineColor: params.color,
      extruded: false,
      filled: false,
      stroked: true,
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      parameters: {depthTest: false}
    });

  const createLayers = (viewState: any) => [
    createLayer('left', leftParams),
    createLayer('right', rightParams),
    createDebugLayer('left-debug', viewState, leftParams),
    createDebugLayer('right-debug', viewState, rightParams)
  ];

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
    layers: createLayers(initialViewState),
    layerFilter: ({layer, viewport}) => layer.id.startsWith(viewport.id),
    onViewStateChange: ({viewState}) => {
      const layers = deck.props.layers.slice(0, 2);
      layers.push(
        createDebugLayer('left-debug', viewState, leftParams),
        createDebugLayer('right-debug', viewState, rightParams)
      );
      deck.setProps({viewState, layers});
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
    gui.add(params, 'tileSize', [256, 512, 1024, 1448, 2048] as TileSize[]);
    gui.add(params, 'aggregationResLevel', [2, 3, 4, 5]);
    gui.add(params, 'bias');
    gui.onChange(() => {
      deck.setProps({layers: createLayers(deck.props.viewState)});
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
