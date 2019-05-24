/* eslint-disable callback-return */
/* global window */
import * as dataSamples from '../../examples/layer-browser/src/data-samples';
import {parseColor, setOpacity} from '../../examples/layer-browser/src/utils/color';
import {
  _GPUGridLayer as GPUGridLayer,
  _NewGridLayer as NewGridLayer,
  AGGREGATION_OPERATION
} from '@deck.gl/aggregation-layers';
import {COORDINATE_SYSTEM, OrbitView, OrthographicView, FirstPersonView} from '@deck.gl/core';

const ICON_ATLAS = './test/render/icon-atlas.png';

import {
  ScatterplotLayer,
  PolygonLayer,
  PathLayer,
  ArcLayer,
  LineLayer,
  IconLayer,
  GeoJsonLayer,
  GridCellLayer,
  ColumnLayer,
  PointCloudLayer,
  TextLayer
} from '@deck.gl/layers';
import {ContourLayer, ScreenGridLayer, GridLayer, HexagonLayer} from '@deck.gl/aggregation-layers';
import {H3HexagonLayer, H3ClusterLayer} from '@deck.gl/geo-layers';

import * as h3 from 'h3-js';

const IS_HEADLESS = Boolean(window.browserTestDriver_isHeadless);

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

const GRID_LAYER_INFO = {
  viewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  },
  props: {
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    getPosition: d => d.COORDINATES
  },
  goldenImage: './test/render/golden-images/grid-lnglat.png'
};

function getMean(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => accu + curr[key], 0) / filtered.length
    : null;
}

function getMax(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => (curr[key] > accu ? curr[key] : accu), -Infinity)
    : null;
}

function getColorValue(points) {
  return getMean(points, 'SPACES');
}

function getElevationValue(points) {
  return getMax(points, 'SPACES');
}

export const WIDTH = 800;
export const HEIGHT = 450;

// Max color delta in the YIQ difference metric for two pixels to be considered the same
export const COLOR_DELTA_THRESHOLD = 255 * 0.05;
// Percentage of pixels that must be the same for the test to pass
export const TEST_PASS_THRESHOLD = 0.99;
const screenSpaceData = [
  [0, -100],
  [0, -110],
  [0, -115],
  [10, -100],
  [0, 100],
  [0, 105],
  [-100, -100],
  [-100, -100],
  [100, 10],
  [100, 12],
  [100, 100],
  [110, 90]
];

export const TEST_CASES = [
  // First person
  {
    name: 'first-person',
    views: [
      new FirstPersonView({
        fovy: 75,
        near: 10,
        far: 100000,
        focalDistance: 10
      })
    ],
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      altitude: 20,
      bearing: 270
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-lnglat',
        data: dataSamples.geojson,
        getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
        getFillColor: f => parseColor(f.properties.fill || f.properties['marker-color']),
        getLineColor: f => parseColor(f.properties.stroke),
        extruded: true,
        wireframe: true,
        getElevation: 500,
        lineWidthScale: 10,
        lineWidthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/first-person.png'
  },
  // Info vis
  {
    name: 'orthographic-64bit',
    views: new OrthographicView(),
    viewState: {
      target: [10000 - 122.4, 10000 + 37.75, 0],
      zoom: 14
    },
    layers: [
      new ScatterplotLayer({
        id: 'orthographic-64',
        opacity: 0.1,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: dataSamples.getPoints100K().map(p => [p[0] + 10000, p[1] + 10000]),
        getPosition: d => d,
        getRadius: 0,
        radiusMinPixels: 6
      })
    ],
    goldenImage: './test/render/golden-images/orthographic-64.png'
  },
  {
    name: 'pointcloud-identity',
    views: [
      new OrbitView({
        fov: 30,
        orbitAxis: 'Y'
      })
    ],
    viewState: {
      rotationX: 15,
      rotationOrbit: 30
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-identity',
        data: [{position: [0, 100, 0]}, {position: [-100, -100, 0]}, {position: [100, -100, 0]}],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getNormal: d => [0, 0.5, 0.2],
        getColor: d => [255, 255, 0, 128],
        pointSize: 50
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-identity.png'
  },
  {
    name: 'screengrid-infoviz',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-infoviz',
        data: screenSpaceData,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d,
        cellSizePixels: 40,
        pickable: false
      })
    ],
    goldenImage: './test/render/golden-images/screengrid-infoviz.png'
  },
  {
    name: 'contour-infoviz',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2,
      zoom: 0.1
    },
    layers: [
      new ContourLayer({
        id: 'contour-infoviz',
        data: screenSpaceData,
        getPosition: d => d,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        cellSize: 40,
        opacity: 1,
        contours: [
          {threshold: 1, color: [50, 50, 50]},
          {threshold: 2, color: [100, 100, 100]},
          {threshold: 3, color: [150, 150, 150]}
        ],
        gpuAggregation: true
      })
    ],
    goldenImage: './test/render/golden-images/contour-infoviz.png'
  },
  {
    name: 'contour-isobands-infoviz',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2
    },
    layers: [
      new ContourLayer({
        id: 'contour-isobands-infoviz',
        data: screenSpaceData,
        getPosition: d => d,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        cellSize: 40,
        opacity: 1,
        contours: [
          {threshold: [1, 2], color: [150, 0, 0]},
          {threshold: [2, 5], color: [0, 150, 0]}
        ],
        gpuAggregation: false
      })
    ],
    goldenImage: './test/render/golden-images/contour-infoviz_border_ref.png'
  },

  // GEOSPATIAL
  {
    name: 'polygon-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-lnglat',
        data: dataSamples.polygons,
        getPolygon: f => f,
        getFillColor: [200, 0, 0],
        getLineColor: [0, 0, 0],
        getLineDashArray: [20, 0],
        getWidth: f => 20,
        opacity: 0.8,
        pickable: true,
        lineWidthMinPixels: 1,
        lineDashJustified: true
      })
    ],
    goldenImage: './test/render/golden-images/polygon-lnglat.png'
  },
  {
    name: 'polygon-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-lnglat-64',
        data: dataSamples.polygons,
        getPolygon: f => f,
        getFillColor: [200, 0, 0],
        getLineColor: [0, 0, 0],
        getLineDashArray: [20, 0],
        getWidth: f => 20,
        opacity: 0.8,
        pickable: true,
        lineWidthMinPixels: 1,
        lineDashJustified: true
      })
    ],
    goldenImage: './test/render/golden-images/polygon-lnglat.png'
  },
  {
    name: 'path-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: dataSamples.zigzag,
        opacity: 0.6,
        getPath: f => f.path,
        getColor: f => [128, 0, 0],
        getWidth: f => 100,
        widthMinPixels: 1,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/path-lnglat.png'
  },
  {
    name: 'path-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat-64',
        data: dataSamples.zigzag,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        opacity: 0.6,
        getPath: f => f.path,
        getColor: f => [128, 0, 0],
        getWidth: f => 100,
        widthMinPixels: 1,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/path-lnglat.png'
  },
  {
    name: 'path-billboard',
    viewState: {
      latitude: 37.7518488,
      longitude: -122.427699,
      zoom: 16.5,
      pitch: 55,
      bearing: -20
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: dataSamples.zigzag3D,
        opacity: 0.6,
        billboard: true,
        getPath: f => f.path,
        getColor: f => [128, 0, 0],
        getWidth: f => 10
      })
    ],
    goldenImage: './test/render/golden-images/path-billboard.png'
  },
  {
    name: 'scatterplot-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat-64',
        data: dataSamples.points,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'arc-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        strokeWidth: 2,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: d => [64, 255, 0],
        getTargetColor: d => [0, 128, 200],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat.png',
    imageDiffOptions: !IS_HEADLESS && {
      threshold: 0.985
    }
  },
  {
    name: 'arc-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat-64',
        data: dataSamples.routes,
        strokeWidth: 2,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: d => [64, 255, 0],
        getTargetColor: d => [0, 128, 200],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat-64.png',
    imageDiffOptions: !IS_HEADLESS && {
      threshold: 0.985
    }
  },
  {
    name: 'line-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new LineLayer({
        id: 'line-lnglat',
        data: dataSamples.routes,
        getWidth: 0,
        widthMinPixels: 2,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/line-lnglat.png'
  },
  {
    name: 'line-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new LineLayer({
        id: 'line-lnglat-64',
        data: dataSamples.routes,
        getWidth: 0,
        widthMinPixels: 2,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/line-lnglat-64.png'
  },
  {
    name: 'icon-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    layers: [
      new IconLayer({
        id: 'icon-lnglat',
        data: dataSamples.points,
        iconAtlas: ICON_ATLAS,
        iconMapping: dataSamples.iconAtlas,
        sizeScale: 12,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    onAfterRender: ({layers, done}) => {
      if (layers[0].state.iconManager.getTexture()) {
        done();
      }
    },
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  },
  {
    name: 'icon-lnglat-facing-up',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    layers: [
      new IconLayer({
        id: 'icon-lnglat',
        data: dataSamples.points,
        iconAtlas: ICON_ATLAS,
        billboard: false,
        iconMapping: dataSamples.iconAtlas,
        sizeScale: 12,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    onAfterRender: ({layers, done}) => {
      if (layers[0].state.iconManager.getTexture()) {
        done();
      }
    },
    goldenImage: './test/render/golden-images/icon-lnglat-facing-up.png'
  },
  {
    name: 'icon-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    layers: [
      new IconLayer({
        id: 'icon-lnglat-64',
        data: dataSamples.points,
        iconAtlas: ICON_ATLAS,
        iconMapping: dataSamples.iconAtlas,
        sizeScale: 12,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  },
  {
    name: 'icon-lnglat-auto',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    layers: [
      new IconLayer({
        id: 'icon-lnglat-auto',
        data: dataSamples.points,
        sizeScale: 12,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => {
          if (d.PLACEMENT === 'SW') {
            return Object.assign({}, dataSamples.iconAtlas.marker, {
              url: './test/render/icon-marker.png'
            });
          }
          return Object.assign({}, dataSamples.iconAtlas['marker-warning'], {
            url: './test/render/icon-warning.png'
          });
        },
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  },
  {
    name: 'icon-meters',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    layers: [
      new IconLayer({
        id: 'icon-meters',
        data: dataSamples.points,
        iconAtlas: ICON_ATLAS,
        iconMapping: dataSamples.iconAtlas,
        sizeScale: 256,
        sizeUnits: 'meters',
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    onAfterRender: ({layers, done}) => {
      if (layers[0].state.iconManager.getTexture()) {
        done();
      }
    },
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  },
  {
    name: 'geojson-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-lnglat',
        data: dataSamples.geojson,
        getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
        getFillColor: f => {
          const color = parseColor(f.properties.fill || f.properties['marker-color']);
          const opacity = (f.properties['fill-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineColor: f => {
          const color = parseColor(f.properties.stroke);
          const opacity = (f.properties['stroke-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineWidth: f => f.properties['stroke-width'],
        getElevation: f => 500,
        lineWidthScale: 10,
        lineWidthMinPixels: 1,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geojson-lnglat.png'
  },
  {
    name: 'geojson-extruded-lnglat',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-extruded-lnglat',
        data: dataSamples.geojson,
        extruded: true,
        wireframe: true,
        getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
        getFillColor: f => {
          const color = parseColor(f.properties.fill || f.properties['marker-color']);
          const opacity = (f.properties['fill-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineColor: f => {
          const color = parseColor(f.properties.stroke);
          const opacity = (f.properties['stroke-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineWidth: f => f.properties['stroke-width'],
        getElevation: f => 500,
        lineWidthScale: 10,
        lineWidthMinPixels: 1,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geojson-extruded-lnglat.png'
  },
  {
    name: 'gridcell-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GridCellLayer({
        id: 'gridcell-lnglat',
        data: dataSamples.worldGrid.data,
        cellSize: dataSamples.worldGrid.cellSize,
        extruded: true,
        pickable: true,
        opacity: 1,
        getFillColor: g => [245, 166, g.value * 255, 255],
        getElevation: h => h.value * 5000
      })
    ],
    goldenImage: './test/render/golden-images/gridcell-lnglat.png'
  },
  {
    name: 'gridcell-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GridCellLayer({
        id: 'gridcell-lnglat-64',
        data: dataSamples.worldGrid.data,
        cellSize: dataSamples.worldGrid.cellSize,
        extruded: true,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        pickable: true,
        opacity: 1,
        getFillColor: g => [245, 166, g.value * 255, 255],
        getElevation: h => h.value * 5000
      })
    ],
    goldenImage: './test/render/golden-images/gridcell-lnglat.png'
  },
  {
    name: 'grid-lnglat',
    viewState: GRID_LAYER_INFO.viewState,
    layers: [
      new GridLayer(
        Object.assign({}, GRID_LAYER_INFO.props, {
          id: 'grid-lnglat',
          getColorValue,
          getElevationValue
        })
      )
    ],
    goldenImage: GRID_LAYER_INFO.goldenImage
  },
  {
    name: 'new-grid-lnglat-cpu',
    viewState: GRID_LAYER_INFO.viewState,
    layers: [
      new NewGridLayer(
        Object.assign({}, GRID_LAYER_INFO.props, {
          id: 'new-grid-lnglat-cpu',
          getColorWeight: x => x.SPACES,
          colorAggregation: AGGREGATION_OPERATION.MEAN,
          getElevationWeight: x => x.SPACES,
          elevationAggregation: AGGREGATION_OPERATION.MAX,
          gpuAggregation: false
        })
      )
    ],
    goldenImage: GRID_LAYER_INFO.goldenImage
  },
  {
    name: 'new-grid-lnglat-gpu',
    viewState: GRID_LAYER_INFO.viewState,
    layers: [
      new NewGridLayer(
        Object.assign({}, GRID_LAYER_INFO.props, {
          id: 'new-grid-lnglat-gpu',
          getColorWeight: x => x.SPACES,
          colorAggregation: AGGREGATION_OPERATION.MEAN,
          getElevationWeight: x => x.SPACES,
          elevationAggregation: AGGREGATION_OPERATION.MAX,
          gpuAggregation: true
        })
      )
    ],
    goldenImage: GRID_LAYER_INFO.goldenImage
  },
  {
    name: 'screengrid-lnglat-cpu-aggregation',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-lnglat-cpu-aggregation',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        cellSizePixels: 40,
        pickable: false,
        gpuAggregation: false
      })
    ],
    goldenImage: './test/render/golden-images/screengrid-lnglat-colorRange.png'
  },
  {
    name: 'screengrid-lnglat-colorRange',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-lnglat-colorRange',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        cellSizePixels: 40,
        pickable: false
      })
    ],
    goldenImage: './test/render/golden-images/screengrid-lnglat-colorRange.png'
  },
  {
    name: 'column-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 30,
      bearing: 0,
      orthographic: true
    },
    layers: [
      new ColumnLayer({
        id: 'column-lnglat',
        data: dataSamples.hexagons,
        radius: 250,
        angle: Math.PI / 2,
        coverage: 1,
        extruded: true,
        pickable: true,
        opacity: 1,
        getPosition: h => h.centroid,
        getFillColor: h => [48, 128, h.value * 255, 255],
        getElevation: h => h.value * 5000
      })
    ],
    goldenImage: './test/render/golden-images/column-lnglat.png'
  },
  {
    name: 'column-lnglat-stroke',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0,
      orthographic: true
    },
    layers: [
      new ColumnLayer({
        id: 'column-lnglat',
        data: dataSamples.hexagons,
        radius: 250,
        angle: Math.PI / 2,
        coverage: 1,
        extruded: false,
        stroked: true,
        pickable: true,
        opacity: 1,
        lineWidthUnits: 'pixels',
        getPosition: h => h.centroid,
        getFillColor: h => [48, 128, h.value * 255, 255],
        getLineColor: [255, 255, 255],
        getLineWidth: 4
      })
    ],
    goldenImage: './test/render/golden-images/column-lnglat-stroke.png'
  },
  {
    name: 'hexagon-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new HexagonLayer({
        id: 'hexagon-lnglat',
        data: dataSamples.points,
        extruded: true,
        pickable: true,
        radius: 1000,
        opacity: 1,
        elevationScale: 1,
        elevationRange: [0, 3000],
        coverage: 1,
        getPosition: d => d.COORDINATES,
        getColorValue,
        getElevationValue
      })
    ],
    goldenImage: './test/render/golden-images/hexagon-lnglat.png'
  },
  {
    name: 'pointcloud-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-lnglat',
        data: dataSamples.getPointCloud(),
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        coordinateOrigin: dataSamples.positionOrigin,
        getPosition: d => [d.position[0] * 1e-5, d.position[1] * 1e-5, d.position[2]],
        getNormal: d => d.normal,
        getColor: d => d.color,
        opacity: 1,
        pointSize: 2,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-lnglat.png'
  },
  {
    name: 'pointcloud-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-lnglat-64',
        data: dataSamples.getPointCloud(),
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        coordinateOrigin: dataSamples.positionOrigin,
        fp64: true,
        getPosition: d => [
          d.position[0] * 1e-5 - 122.42694203247012,
          d.position[1] * 1e-5 + 37.751537058389985,
          d.position[2]
        ],
        getNormal: d => d.normal,
        getColor: d => d.color,
        opacity: 1,
        pointSize: 2,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-lnglat-64.png'
  },
  {
    name: 'pointcloud-meter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-meter',
        data: dataSamples.getPointCloud(),
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: dataSamples.positionOrigin,
        getPosition: d => d.position,
        getNormal: d => d.normal,
        getColor: d => d.color,
        opacity: 1,
        pointSize: 2,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-meter.png'
  },
  {
    name: 'path-meter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-meter',
        data: dataSamples.meterPaths,
        opacity: 1.0,
        getColor: f => [255, 0, 0],
        getWidth: f => 10,
        widthMinPixels: 1,
        pickable: false,
        strokeWidth: 5,
        widthScale: 100,
        autoHighlight: false,
        highlightColor: [255, 255, 255, 255],
        sizeScale: 200,
        rounded: false,
        getMarkerPercentages: () => [],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: dataSamples.positionOrigin
      })
    ],
    goldenImage: './test/render/golden-images/path-meter.png'
  },
  {
    name: 'text-layer',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer',
        data: dataSamples.points.slice(0, 50),
        fontFamily: 'Arial',
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [153, 0, 0],
        getSize: x => 16,
        getAngle: x => 0,
        sizeScale: 1,
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer.png'
  },
  {
    name: 'text-layer-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer-64',
        data: dataSamples.points.slice(0, 50),
        fontFamily: 'Arial',
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
        fp64: true,
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [153, 0, 0],
        getSize: x => 16,
        getAngle: x => 0,
        sizeScale: 1,
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer.png'
  },
  {
    name: 'text-layer-meters',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TextLayer({
        id: 'text-layer',
        data: dataSamples.points.slice(0, 50),
        fontFamily: 'Arial',
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [153, 0, 0],
        getSize: x => 16,
        getAngle: x => 0,
        sizeScale: 21,
        sizeUnits: 'meters',
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    goldenImage: './test/render/golden-images/text-layer.png'
  },
  {
    name: 'gpu-grid-lnglat',
    viewState: GRID_LAYER_INFO.viewState,
    layers: [
      new GPUGridLayer(
        Object.assign({}, GRID_LAYER_INFO.props, {
          id: 'gpu-grid-lnglat',
          gpuAggregation: true
        })
      )
    ],
    goldenImage: './test/render/golden-images/gpu-grid-lnglat.png'
  },
  {
    name: 'gpu-grid-lnglat-cpu-aggregation',
    viewState: GRID_LAYER_INFO.viewState,
    layers: [
      new GPUGridLayer(
        Object.assign({}, GRID_LAYER_INFO.props, {
          id: 'gpu-grid-lnglat-cpu-aggregation',
          gpuAggregation: false
        })
      )
    ],
    goldenImage: './test/render/golden-images/gpu-grid-lnglat.png'
  },
  {
    name: 'contour-lnglat-cpu-aggregation',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ContourLayer({
        id: 'contour-lnglat-cpu-aggregation',
        data: dataSamples.points,
        cellSize: 200,
        opacity: 1,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: 1, color: [255, 0, 0], strokeWidth: 6},
          {threshold: 5, color: [0, 255, 0], strokeWidth: 3},
          {threshold: 15, color: [0, 0, 255]}
        ],
        gpuAggregation: false
      })
    ],
    goldenImage: './test/render/golden-images/contour-lnglat.png'
  },
  {
    name: 'contour-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ContourLayer({
        id: 'contour-lnglat',
        data: dataSamples.points,
        cellSize: 200,
        opacity: 1,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: 1, color: [255, 0, 0], strokeWidth: 6},
          {threshold: 5, color: [0, 255, 0], strokeWidth: 3},
          {threshold: 15, color: [0, 0, 255]}
        ],
        gpuAggregation: true
      })
    ],
    goldenImage: './test/render/golden-images/contour-lnglat.png'
  },
  {
    name: 'contour-isobands-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ContourLayer({
        id: 'contour-isobands-lnglat',
        data: dataSamples.points,
        cellSize: 200,
        opacity: 1,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: [1, 5], color: [255, 0, 0], strokeWidth: 6},
          {threshold: [5, 15], color: [0, 255, 0], strokeWidth: 3},
          {threshold: [15, 1000], color: [0, 0, 255]}
        ],
        gpuAggregation: true
      })
    ],
    goldenImage: './test/render/golden-images/contour-isobands-lnglat.png'
  },
  {
    name: 'h3-hexagon-layer',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 11,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: h3.kRing('882830829bfffff', 4),
        getHexagon: d => d,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getElevation: (d, {index}) => index * 100
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon.png'
  },
  {
    name: 'h3-hexagon-layer-high-precision',
    viewState: {
      latitude: 50.103,
      longitude: -143.478,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: h3.kRing('891c0000003ffff', 4),
        getHexagon: d => d,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getElevation: (d, {index}) => index * 10
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-high-precision.png'
  },
  {
    name: 'h3-hexagon-layer-flat',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: h3.kRing('882830829bfffff', 4),
        getHexagon: d => d,
        extruded: false,
        stroked: true,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-flat.png'
  },
  {
    name: 'h3-hexagon-layer-flat-high-precision',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: h3.kRing('882830829bfffff', 4),
        getHexagon: d => d,
        extruded: false,
        stroked: true,
        highPrecision: true,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-flat.png'
  },
  {
    name: 'h3-hexagon-layer-low-zoom',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: h3
          .polyfill([[-90, -180], [90, -180], [90, 0], [-90, 0]], 0)
          .concat(h3.polyfill([[-90, 180], [90, 180], [90, 0], [-90, 0]], 0)),
        getHexagon: d => d,
        extruded: false,
        filled: false,
        stroked: true,
        getLineColor: [0, 0, 0],
        lineWidthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-low-zoom.png'
  },
  {
    name: 'h3-cluster-layer',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 11,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3ClusterLayer({
        data: ['882830829bfffff'],
        getHexagons: d => h3.kRing(d, 6),
        getLineWidth: 100,
        stroked: true,
        filled: false
      })
    ],
    goldenImage: './test/render/golden-images/h3-cluster.png'
  }
];
