import { useState, useCallback, useEffect, } from 'react';
import CodeBlock from '@theme/CodeBlock';
import {
  ScreenshotWidget,
  FullscreenWidget,
  CompassWidget,
  ZoomWidget,
  ResetViewWidget,
  GimbalWidget,
  PopupWidget,
  _ThemeWidget as ThemeWidget,
  _ContextMenuWidget as ContextMenuWidget,
  _FpsWidget as FpsWidget,
  _GeocoderWidget as GeocoderWidget,
  _InfoWidget as InfoWidget,
  _LoadingWidget as LoadingWidget,
  _StatsWidget as StatsWidget,
  DarkTheme, LightTheme, DarkGlassTheme, LightGlassTheme
} from '@deck.gl/widgets';
import { MapView, OrthographicView, OrbitView } from '@deck.gl/core';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { MVTLayer } from '@deck.gl/geo-layers';
import { Map } from 'react-map-gl/maplibre';
import { useColorMode } from '@docusaurus/theme-common';
import { MAPBOX_STYLES, DATA_URI } from '../constants/defaults';

const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
const DEMO_CONTAINER_STYLE = {
  position: 'relative',
  width: '100%',
  height: '50vh',
  minHeight: 200,
};

function GeoDemoBase(deckProps) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const layers = [
    !deckProps.map && new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    }),
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
    }),
  ]

  return (
    <div style={DEMO_CONTAINER_STYLE}>
      <DeckGL
        views={[new MapView({repeat: true})]}
        initialViewState={{
          longitude: 0,
          latitude: 52,
          zoom: 4,
        }}
        controller
        pickingRadius={5}
        layers={layers}
        style={isDarkMode ? DarkGlassTheme : LightGlassTheme}
        {...deckProps}
      >
        {deckProps.map && <Map reuseMaps mapStyle={deckProps.mapLabels
          ? (isDarkMode ? MAPBOX_STYLES.DARK_LABEL : MAPBOX_STYLES.LIGHT_LABEL)
          : (isDarkMode ? MAPBOX_STYLES.DARK : MAPBOX_STYLES.LIGHT)} />}
      </DeckGL>
    </div>
  )
}

function NonGeoDemoBase(deckProps) {
  const { colorMode } = useColorMode();
  const layers = deckProps.layers || [
    new ScatterplotLayer({
      data: generateMatrix(40, 40),
      getPosition: d => d.position,
      getFillColor: d => d.color,
      billboard: true,
      getRadius: 3,
    })
  ];
  return (
    <div style={DEMO_CONTAINER_STYLE}>
      <DeckGL
        views={new OrbitView({orbitAxis: 'Y'})}
        initialViewState={{
          target: [0, 0, 0],
          zoom: 0,
          rotationX: 0,
          rotationOrbit: 0,
        }}
        layers={layers}
        controller
        style={colorMode === 'dark' ? DarkGlassTheme : LightGlassTheme}
        {...deckProps}
      >
      </DeckGL>
    </div>
  )
}

function generateMatrix(nCol, nRow) {
  const space = 10;
  const halfW = (nCol - 1) / 2;
  const halfH = (nRow) / 2;
  return Array.from({ length: nCol * nRow }, (_, i) => {
    const col = i % nCol;
    const row = Math.floor(i / nCol);
    return {
      position: [(col - halfW) * space, (row - halfH) * space],
      color: [col / nCol * 255, row / nRow * 255, 0],
    };
  });
}
function getMVTLayer() {
  return new MVTLayer({
    data: [
      'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
    ],

    minZoom: 0,
    maxZoom: 14,
    stroked: false,
    getLineColor: [192, 192, 192],
    getFillColor: f => {
      switch (f.properties.layerName) {
        case 'poi':
          return [255, 0, 0];
        case 'water':
          return [120, 150, 180];
        case 'building':
          return [218, 218, 218];
        default:
          return [128, 128, 128, 100];
      }
    },
    getPointRadius: 2,
    pointRadiusUnits: 'pixels',
    getLineWidth: f => {
      switch (f.properties.class) {
        case 'street':
          return 6;
        case 'motorway':
          return 10;
        default:
          return 1;
      }
    },
    lineWidthMinPixels: 1,
    pickable: true,
  });
}

export function FullscreenWidgetDemo() {
  return <GeoDemoBase map widgets={[new FullscreenWidget()]} />
}
export function ScreenshotWidgetDemo() {
  return <GeoDemoBase widgets={[new ScreenshotWidget()]} />
}
export function ZoomWidgetDemo() {
  return <GeoDemoBase map widgets={[new ZoomWidget()]} />
}
export function ResetViewWidgetDemo() {
  return <GeoDemoBase map widgets={[new ResetViewWidget({
    initialViewState: {
      longitude: -20,
      latitude: 15,
      zoom: 0
    }
  })]} />
}
export function GimbalWidgetDemo() {
  const viewState = useAnimatedCamera({
    target: [0, 0, 0],
    zoom: 0,
    rotationX: -45,
    rotationOrbit: 0,
  }, v => ({
    rotationX: 90 - (v.rotationX ?? 0),
    rotationOrbit: (v.rotationOrbit ?? 0) + 120,
    transitionDuration: 4000,
  }))
  return <NonGeoDemoBase initialViewState={viewState} widgets={[new GimbalWidget()]} />
}
export function GeocoderWidgetDemo() {
  return <GeoDemoBase map mapLabels widgets={[new GeocoderWidget({
        geocoder: 'coordinates',
        _geolocation: true
      }),]} />
}
export function InfoWidgetDemo() {
  return <GeoDemoBase map widgets={[new InfoWidget({
    getTooltip: (pickInfo) => {
      if (pickInfo.object?.properties) {
        const props = pickInfo.object.properties;
        console.log(pickInfo.object);
        return {
          html: `\
<b>${props.name}</b><br/>
${props.iata_code} | ${props.gps_code} | <a href="${props.wikipedia}">Wikipedia</a>`
        }
      }
    },
    style: {minWidth: '160px', fontSize: '12px'}
  })]} />
}
export function PopupWidgetDemo() {
  return <GeoDemoBase map layers={[]} widgets={[new PopupWidget({
    content: {
      text: 'I\'m here',
    },
    marker: {
      html: `<div style="font-size:28px;transform:translate(-50%,-50%);">🏠</div>`
    },
    defaultIsOpen: true,
    position: [ -0.453, 51.471 ],
    closeButton: true,
    closeOnClickOutside: true,
    style: {minWidth: '160px', fontSize: '12px'}
  })]} />
}
export function FpsWidgetDemo() {
  const viewState = useAnimatedCamera({
    longitude: 0,
    latitude: 50,
    zoom: 4,
    pitch: 45,
    bearing: 0,
  }, v => ({
    bearing: (v.bearing ?? 0) + 120,
    transitionDuration: 4000,
  }));

  return <GeoDemoBase map initialViewState={viewState} widgets={[new FpsWidget()]} />
}
export function CompassWidgetDemo() {
  const viewState = useAnimatedCamera({
    longitude: 0,
    latitude: 50,
    zoom: 4,
    pitch: 45,
    bearing: 0,
  }, v => ({
    bearing: (v.bearing ?? 0) + 120,
    transitionDuration: 4000,
  }));

  return <GeoDemoBase map initialViewState={viewState} widgets={[new CompassWidget()]} />
}
export function ContextMenuWidgetDemo() {
  const [data, setData] = useState(() => [
    [-87.905, 41.977],
    [-122.302, 47.444],
    [-122.383, 37.617],
    [-73.786, 40.646],
    [-104.674, 39.849],
    [-97.04, 32.9],
    [-77.448, 38.953],
    [-111.982, 40.787]
  ]);

  const addPoint = useCallback((pickInfo) => {
    const position = pickInfo.coordinate;
    setData(curr => curr.concat([position]));
  }, []);

  const deletePoint = useCallback((pickInfo) => {
    const index = pickInfo.index;
    setData(curr => {
      const next = curr.slice();
      next.splice(index, 1);
      return next;
    });
  }, []);

  const layers = [
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      pickable: true,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    }),
    new IconLayer({
      id: 'pins',
      data,
      iconAtlas: `${DATA_URI}/icon-atlas.png`,
      iconMapping: `${DATA_URI}/icon-atlas.json`,
      getPosition: d => d,
      getIcon: d => 'marker',
      getSize: 20,
      sizeUnits: 'pixels',
      getColor: [200, 0, 80, 180],
      alphaCutoff: 0,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 0, 100],
    })
  ];

  return <GeoDemoBase
    layers={layers}
    initialViewState={{
      longitude: -100,
      latitude: 40,
      zoom: 2.5,
    }}
    widgets={[
      new ContextMenuWidget({
        getMenuItems: (info) => {
          if (info.layer?.id === 'pins') {
            return [
              { value: 'delete', label: 'Delete pin' }
            ];
          } else if (info.picked) {
            return [{ label: 'Add pin', value: 'add' }];
          }
        },
        onMenuItemSelected: (value, pickInfo) => {
          if (value === 'add') addPoint(pickInfo);
          if (value === 'delete') deletePoint(pickInfo);
        }
      })
    ]} />
}
export function LoadingWidgetDemo() {
  return <GeoDemoBase layers={[getMVTLayer()]} widgets={[new LoadingWidget()]} />
}
export function StatsWidgetDemo() {
  return <GeoDemoBase layers={[getMVTLayer()]} widgets={[new StatsWidget({
    defaultIsExpanded: true
  })]} />
}
export function ThemeWidgetDemo() {
  return <NonGeoDemoBase views={new OrthographicView()} widgets={[
    new FullscreenWidget(),
    new ZoomWidget(),
    new ResetViewWidget({
      initialViewState: {
        target: [0, 0, 0],
        zoom: 0,
      }
    }),
    new ThemeWidget(),
  ]} />
}
function useAnimatedCamera(viewState, getNextViewState) {
  const [vs, setVs] = useState(viewState);

  useEffect(() => {
    const updateCamera = () => {
      setVs(v => ({
        ...v,
        ...getNextViewState(v),
        onTransitionEnd: updateCamera
      }));
    };
    updateCamera();
  }, []);

  return vs;
}

function Widget({ cls = ScreenshotWidget, props = {} }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 52 }}>
      <div style={{ pointerEvents: 'auto', position: 'absolute', height: '100%', width: '100%', zIndex: 1000 }} />
      <DeckGL widgets={[new cls(props)]} />
    </div>
  )
}

const THEMES = [
  { code: "import {DarkTheme} from '@deck.gl/widgets';", theme: DarkTheme },
  { code: "import {LightTheme} from '@deck.gl/widgets';", theme: LightTheme },
  { code: "import {DarkGlassTheme} from '@deck.gl/widgets';", theme: DarkGlassTheme },
  { code: "import {LightGlassTheme} from '@deck.gl/widgets';", theme: LightGlassTheme }
]

export function WidgetThemes({ themes = THEMES }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Preview</th>
          <th>Theme</th>
        </tr>
      </thead>
      <tbody>
        {themes.map(({ code, theme }) => (
          <tr key={code}>
            <td><Widget props={{ style: theme }} /></td>
            <td><CodeBlock language="ts">{code}</CodeBlock></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
