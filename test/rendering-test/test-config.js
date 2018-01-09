import dataSamples from '../../examples/layer-browser/src/immutable-data-samples';
import {parseColor, setOpacity} from '../../examples/layer-browser/src/utils/color';
import {experimental, WebMercatorViewport} from 'deck.gl';
import {GL} from 'luma.gl';
const {get, OrbitViewport} = experimental;

import {
  MeshLayer,
  PathOutlineLayer,
  PathMarkerLayer,
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
  {
    name: 'polygon-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PolygonLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/polygon-lnglat.png'
  },
  {
    name: 'path-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PathLayer,
        props: {
          id: 'path-lnglat',
          data: dataSamples.zigzag,
          opacity: 0.6,
          getPath: f => get(f, 'path'),
          getColor: f => [128, 0, 0],
          getWidth: f => 100,
          widthMinPixels: 1,
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/path-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: ScatterplotLayer,
        props: {
          id: 'scatterplot-lnglat',
          data: dataSamples.points,
          getPosition: d => get(d, 'COORDINATES'),
          getColor: d => [255, 128, 0],
          getRadius: d => get(d, 'SPACES'),
          opacity: 1,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30
        }
      }
    ],
    referenceResult: './golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'arc-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: ArcLayer,
        props: {
          id: 'arc-lnglat',
          data: dataSamples.routes,
          getSourcePosition: d => d.START,
          getTargetPosition: d => d.END,
          getSourceColor: d => [64, 255, 0],
          getTargetColor: d => [0, 128, 200],
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/arc-lnglat.png'
  },
  {
    name: 'line-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: LineLayer,
        props: {
          id: 'line-lnglat',
          data: dataSamples.routes,
          getSourcePosition: d => get(d, 'START'),
          getTargetPosition: d => get(d, 'END'),
          getColor: d => (get(d, 'SERVICE') === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/line-lnglat.png'
  },
  {
    name: 'icon-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // rendering times
    renderingTimes: 2,
    // layer list
    layersList: [
      {
        type: IconLayer,
        props: {
          id: 'icon-lnglat',
          data: dataSamples.points,
          iconAtlas: 'icon-atlas.png',
          iconMapping: dataSamples.iconAtlas,
          sizeScale: 24,
          getPosition: d => d.COORDINATES,
          getColor: d => [64, 64, 72],
          getIcon: d => (get(d, 'PLACEMENT') === 'SW' ? 'marker' : 'marker-warning'),
          getSize: d => (get(d, 'RACKS') > 2 ? 2 : 1),
          opacity: 0.8,
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/icon-lnglat.png'
  },
  {
    name: 'geojson-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: GeoJsonLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/geojson-lnglat.png'
  },
  {
    name: 'geojson-extruded-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: GeoJsonLayer,
        props: {
          id: 'geojson-extruded-lnglat',
          data: dataSamples.choropleths,
          getElevation: f => ((get(f, 'properties.ZIP_CODE') * 10) % 127) * 10,
          getFillColor: f => [0, 100, (get(f, 'properties.ZIP_CODE') * 55) % 255],
          getLineColor: f => [200, 0, 80],
          extruded: true,
          wireframe: true,
          pickable: true,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/geojson-extruded-lnglat.png'
  },
  {
    name: 'gridcell-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: GridCellLayer,
        props: {
          id: 'gridcell-lnglat',
          data: dataSamples.worldGrid.data,
          cellSize: dataSamples.worldGrid.cellSize,
          extruded: true,
          pickable: true,
          opacity: 1,
          getColor: g => [245, 166, get(g, 'value') * 255, 255],
          getElevation: h => get(h, 'value') * 5000,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/gridcell-lnglat.png'
  },
  {
    name: 'grid-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: GridLayer,
        props: {
          id: 'grid-lnglat',
          data: dataSamples.points,
          cellSize: 200,
          opacity: 1,
          extruded: true,
          pickable: true,
          getPosition: d => get(d, 'COORDINATES'),
          getColorValue,
          getElevationValue,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/grid-lnglat.png'
  },
  {
    name: 'screengrid-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: ScreenGridLayer,
        props: {
          id: 'screengrid-lnglat',
          data: dataSamples.points,
          getPosition: d => get(d, 'COORDINATES'),
          cellSizePixels: 40,
          minColor: [0, 0, 80, 0],
          maxColor: [100, 255, 0, 128],
          pickable: false
        }
      }
    ],
    referenceResult: './golden-images/screengrid-lnglat.png'
  },
  {
    name: 'hexagoncell-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: HexagonCellLayer,
        props: {
          id: 'hexagoncell-lnglat',
          data: dataSamples.hexagons,
          hexagonVertices: dataSamples.hexagons[0].vertices,
          coverage: 1,
          extruded: true,
          pickable: true,
          opacity: 1,
          getColor: h => [48, 128, get(h, 'value') * 255, 255],
          getElevation: h => get(h, 'value') * 5000,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/hexagoncell-lnglat.png'
  },
  {
    name: 'hexagon-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: HexagonLayer,
        props: {
          id: 'hexagon-lnglat',
          data: dataSamples.points,
          extruded: true,
          pickable: true,
          radius: 1000,
          opacity: 1,
          elevationScale: 1,
          elevationRange: [0, 3000],
          coverage: 1,
          getPosition: d => get(d, 'COORDINATES'),
          getColorValue,
          getElevationValue,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/hexagon-lnglat.png'
  },
  {
    name: 'pointcloud-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PointCloudLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/pointcloud-lnglat.png'
  },
  {
    name: 'pointcloud-meter',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PointCloudLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/pointcloud-meter.png'
  },
  {
    name: 'path-meter',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PathLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/path-meter.png'
  },
  {
    name: 'mesh-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: MeshLayer,
        props: {
          id: 'mesh-lnglat',
          data: arrowDataLngLat,
          mesh: new Arrow2DGeometry(),
          sizeScale: 10000
        }
      }
    ],
    referenceResult: './golden-images/mesh-lnglat.png'
  },
  {
    name: 'path-outline',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PathOutlineLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/path-outline.png'
  },
  {
    name: 'path-marker',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: PathMarkerLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/path-maker.png'
  },
  {
    name: 'text-layer',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    viewport: WebMercatorViewport,
    // layer list
    layersList: [
      {
        type: TextLayer,
        props: {
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
        }
      }
    ],
    referenceResult: './golden-images/text-layer.png'
  },
  {
    name: 'pointcloud-identity',
    // viewport params
    mapViewState: {
      lookAt: [0, 0, 0],
      distance: 1,
      rotationX: 15,
      rotationOrbit: 30,
      orbitAxis: 'Y',
      fov: 30,
      near: 0.001,
      far: 100
    },
    viewport: OrbitViewport,
    // layer list
    layersList: [
      {
        type: PointCloudLayer,
        props: {
          id: 'pointcloud-identity',
          data: [{position: [0, 0.2, 0]}, {position: [-0.2, -0.2, 0]}, {position: [0.2, -0.2, 0]}],
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          getPosition: d => d.position,
          getNormal: d => [0, 0.5, 0.2],
          getColor: d => [255, 255, 0, 128],
          radiusPixels: 100
        }
      }
    ],
    referenceResult: './golden-images/pointcloud-identity.png'
  }
];
