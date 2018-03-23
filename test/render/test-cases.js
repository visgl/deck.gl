import dataSamples from '../../examples/layer-browser/src/immutable-data-samples';
import {parseColor, setOpacity} from '../../examples/layer-browser/src/utils/color';
import {GL} from 'luma.gl';
import {experimental} from 'deck.gl';
const {OrbitView, OrthographicView} = experimental;

const ICON_ATLAS = './test/render/icon-atlas.png';

import {
  BezierCurveLayer,
  MeshLayer,
  PathOutlineLayer,
  // PathMarkerLayer,
  TextLayer,
  Arrow2DGeometry
} from 'deck.gl-layers';

import {
  COORDINATE_SYSTEM,
  ScatterplotLayer,
  PolygonLayer,
  PathLayer,
  ArcLayer,
  LineLayer,
  IconLayer,
  GeoJsonLayer,
  GridCellLayer,
  GridLayer,
  ScreenGridLayer,
  HexagonCellLayer,
  HexagonLayer,
  PointCloudLayer
} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.0, 8000],
  ambientRatio: 0.3,
  diffuseRatio: 0.6,
  specularRatio: 0.4,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
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

// experimental layer data

const arrowDataLngLat = [
  {position: [-122.4111557006836, 37.774879455566406], angle: 0},
  {position: [-122.41878509521484, 37.75032043457031], angle: 70},
  {position: [-122.43194580078125, 37.75153732299805], angle: 212}
];

export const WIDTH = 800;
export const HEIGHT = 450;

// Max color delta in the YIQ difference metric for two pixels to be considered the same
export const COLOR_DELTA_THRESHOLD = 255 * 0.05;
// Percentage of pixels that must be the same for the test to pass
export const TEST_PASS_THRESHOLD = 0.99;

export const TEST_CASES = [
  // INFOVIS

  {
    name: 'bezier-curve-2d',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2
    },
    layers: [
      new BezierCurveLayer({
        id: 'bezier-curve-2d',
        data: [
          {sourcePosition: [0, -100], targetPosition: [0, 100], controlPoint: [50, 0]},
          {sourcePosition: [0, -100], targetPosition: [0, 100], controlPoint: [-50, 0]},
          {sourcePosition: [0, -100], targetPosition: [0, 100], controlPoint: [100, 0]},
          {sourcePosition: [0, -100], targetPosition: [0, 100], controlPoint: [-100, 0]},
          {sourcePosition: [0, -100], targetPosition: [0, 100], controlPoint: [150, 0]},
          {sourcePosition: [0, -100], targetPosition: [0, 100], controlPoint: [-150, 0]}
        ],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getColor: d => [255, 255, 0, 128],
        strokeWidth: 10
      })
    ],
    referenceImageUrl: './test/render/golden-images/bezier-curve-2d.png'
  },
  {
    name: 'pointcloud-identity',
    views: [
      new OrbitView({
        fov: 30,
        near: 0.001,
        far: 100
      })
    ],
    viewState: {
      lookAt: [0, 0, 0],
      distance: 1,
      rotationX: 15,
      rotationOrbit: 30,
      orbitAxis: 'Y'
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-identity',
        data: [{position: [0, 0.2, 0]}, {position: [-0.2, -0.2, 0]}, {position: [0.2, -0.2, 0]}],
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getNormal: d => [0, 0.5, 0.2],
        getColor: d => [255, 255, 0, 128],
        radiusPixels: 100
      })
    ],
    referenceImageUrl: './test/render/golden-images/pointcloud-identity.png'
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
        getFillColor: f => [200, 0, 0],
        getLineColor: f => [0, 0, 0, 255],
        getLineDashArray: f => [20, 0],
        getWidth: f => 20,
        getElevation: f => 1000,
        opacity: 0.8,
        pickable: true,
        lineDashJustified: true,
        lightSettings: LIGHT_SETTINGS,
        elevationScale: 0.6
      })
    ],
    referenceImageUrl: './test/render/golden-images/polygon-lnglat.png'
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
        fp64: true,
        getPolygon: f => f,
        getFillColor: f => [200, 0, 0],
        getLineColor: f => [0, 0, 0, 255],
        getLineDashArray: f => [20, 0],
        getWidth: f => 20,
        getElevation: f => 1000,
        opacity: 0.8,
        pickable: true,
        lineDashJustified: true,
        lightSettings: LIGHT_SETTINGS,
        elevationScale: 0.6
      })
    ],
    referenceImageUrl: './test/render/golden-images/polygon-lnglat.png'
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
    referenceImageUrl: './test/render/golden-images/path-lnglat.png'
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
        fp64: true,
        opacity: 0.6,
        getPath: f => f.path,
        getColor: f => [128, 0, 0],
        getWidth: f => 100,
        widthMinPixels: 1,
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/path-lnglat.png'
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
        getColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    referenceImageUrl: './test/render/golden-images/scatterplot-lnglat.png'
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
        fp64: true,
        getPosition: d => d.COORDINATES,
        getColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    referenceImageUrl: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'arc-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: d => [64, 255, 0],
        getTargetColor: d => [0, 128, 200],
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/arc-lnglat.png'
  },
  {
    name: 'arc-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat-64',
        data: dataSamples.routes,
        fp64: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: d => [64, 255, 0],
        getTargetColor: d => [0, 128, 200],
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/arc-lnglat-64.png'
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
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/line-lnglat.png'
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
        fp64: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/line-lnglat-64.png'
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
        sizeScale: 24,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/icon-lnglat.png'
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
        sizeScale: 24,
        fp64: true,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8,
        pickable: true
      })
    ],
    referenceImageUrl: './test/render/golden-images/icon-lnglat.png'
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
        pickable: true,
        fp64: true,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/geojson-lnglat.png'
  },
  {
    name: 'geojson-extruded-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-extruded-lnglat',
        data: dataSamples.choropleths,
        getElevation: f => ((f.properties.ZIP_CODE * 10) % 127) * 10,
        getFillColor: f => [0, 100, (f.properties.ZIP_CODE * 55) % 255],
        getLineColor: f => [200, 0, 80],
        extruded: true,
        wireframe: true,
        pickable: true,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/geojson-extruded-lnglat.png'
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
        getColor: g => [245, 166, g.value * 255, 255],
        getElevation: h => h.value * 5000,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/gridcell-lnglat.png'
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
        fp64: true,
        pickable: true,
        opacity: 1,
        getColor: g => [245, 166, g.value * 255, 255],
        getElevation: h => h.value * 5000,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/gridcell-lnglat.png'
  },
  {
    name: 'grid-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GridLayer({
        id: 'grid-lnglat',
        data: dataSamples.points,
        cellSize: 200,
        opacity: 1,
        extruded: true,
        pickable: true,
        getPosition: d => d.COORDINATES,
        getColorValue,
        getElevationValue,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/grid-lnglat.png'
  },
  {
    name: 'screengrid-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-lnglat',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        cellSizePixels: 40,
        minColor: [0, 0, 80, 0],
        maxColor: [100, 255, 0, 128],
        pickable: false
      })
    ],
    referenceImageUrl: './test/render/golden-images/screengrid-lnglat.png'
  },
  {
    name: 'hexagoncell-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new HexagonCellLayer({
        id: 'hexagoncell-lnglat',
        data: dataSamples.hexagons,
        hexagonVertices: dataSamples.hexagons[0].vertices,
        coverage: 1,
        extruded: true,
        pickable: true,
        opacity: 1,
        getColor: h => [48, 128, h.value * 255, 255],
        getElevation: h => h.value * 5000,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/hexagoncell-lnglat.png'
  },
  {
    name: 'hexagoncell-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new HexagonCellLayer({
        id: 'hexagoncell-lnglat-64',
        data: dataSamples.hexagons,
        fp64: true,
        hexagonVertices: dataSamples.hexagons[0].vertices,
        coverage: 1,
        extruded: true,
        pickable: true,
        opacity: 1,
        getColor: h => [48, 128, h.value * 255, 255],
        getElevation: h => h.value * 5000,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/hexagoncell-lnglat.png'
  },
  {
    name: 'hexagon-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
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
        getElevationValue,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/hexagon-lnglat.png'
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
        radiusPixels: 4,
        pickable: true,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/pointcloud-lnglat.png'
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
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
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
        radiusPixels: 4,
        pickable: true,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/pointcloud-lnglat-64.png'
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
        radiusPixels: 4,
        pickable: true,
        lightSettings: LIGHT_SETTINGS
      })
    ],
    referenceImageUrl: './test/render/golden-images/pointcloud-meter.png'
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
    referenceImageUrl: './test/render/golden-images/path-meter.png'
  },
  {
    name: 'mesh-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new MeshLayer({
        id: 'mesh-lnglat',
        data: arrowDataLngLat,
        mesh: new Arrow2DGeometry(),
        sizeScale: 10000
      })
    ],
    referenceImageUrl: './test/render/golden-images/mesh-lnglat.png'
  },
  {
    name: 'mesh-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new MeshLayer({
        id: 'mesh-lnglat-64',
        data: arrowDataLngLat,
        fp64: true,
        mesh: new Arrow2DGeometry(),
        sizeScale: 10000
      })
    ],
    referenceImageUrl: './test/render/golden-images/mesh-lnglat.png'
  },
  {
    name: 'path-outline',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathOutlineLayer({
        id: 'path-outline',
        data: dataSamples.routes,
        opacity: 0.6,
        getPath: f => [f.START, f.END],
        getColor: f => [128, 0, 0],
        getZLevel: f => 125,
        getWidth: f => 10,
        widthMinPixels: 1,
        pickable: true,
        strokeWidth: 5,
        widthScale: 10,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 255],
        parameters: {
          blendEquation: GL.MAX
        }
      })
    ],
    referenceImageUrl: './test/render/golden-images/path-outline.png'
  },
  {
    name: 'path-outline-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathOutlineLayer({
        id: 'path-outline-64',
        data: dataSamples.routes,
        fp64: true,
        opacity: 0.6,
        getPath: f => [f.START, f.END],
        getColor: f => [128, 0, 0],
        getZLevel: f => 125,
        getWidth: f => 10,
        widthMinPixels: 1,
        pickable: true,
        strokeWidth: 5,
        widthScale: 10,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 255],
        parameters: {
          blendEquation: GL.MAX
        }
      })
    ],
    referenceImageUrl: './test/render/golden-images/path-outline-64.png'
  },
  // Chrome 65 can't render this case correctly
  /* {
    name: 'path-marker',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathMarkerLayer({
        id: 'path-marker',
        data: dataSamples.routes,
        opacity: 0.6,
        getPath: f => [f.START, f.END],
        getColor: f => [230, 230, 230],
        getZLevel: f => 125,
        getWidth: f => 10,
        widthMinPixels: 1,
        pickable: true,
        strokeWidth: 5,
        widthScale: 10,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 255],
        parameters: {
          blendEquation: GL.MAX
        },
        sizeScale: 200
      })
    ],
    referenceImageUrl: './test/render/golden-images/path-maker.png'
  }, */
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
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [153, 0, 0],
        getSize: x => 32,
        getAngle: x => 0,
        sizeScale: 1,
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    referenceImageUrl: './test/render/golden-images/text-layer.png'
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
        fp64: true,
        getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
        getPosition: x => x.COORDINATES,
        getColor: x => [153, 0, 0],
        getSize: x => 32,
        getAngle: x => 0,
        sizeScale: 1,
        getTextAnchor: x => 'start',
        getAlignmentBaseline: x => 'center',
        getPixelOffset: x => [10, 0]
      })
    ],
    referenceImageUrl: './test/render/golden-images/text-layer.png'
  }
];
