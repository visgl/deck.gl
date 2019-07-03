import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {
  ScatterplotLayer,
  LineLayer,
  PointCloudLayer,
  GeoJsonLayer,
  PathLayer,
  TextLayer
  //  ContourLayer
} from '@deck.gl/layers';

import {ScreenGridLayer} from '@deck.gl/aggregation-layers';

import {Fp64Extension} from '@deck.gl/extensions';

// Demonstrate immutable support
import * as dataSamples from '../data-samples';

const TextLayer100KExample = {
  layer: TextLayer,
  getData: dataSamples.getPoints100K,
  props: {
    id: 'text-layer-100k',
    getText: x => 'X',
    getPosition: x => x,
    getColor: x => [0, 0, 200],
    sizeScale: 1
  }
};

// METER MODE EXAMPLES

const PointCloudLayerExample = {
  layer: PointCloudLayer,
  getData: dataSamples.getPointCloud,
  props: {
    id: 'pointCloudLayer-meters',
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color,
    opacity: 1,
    radiusPixels: 4,
    pickable: true
  }
};

const PointCloudLayerExample2 = {
  layer: PointCloudLayer,
  getData: dataSamples.getPointCloud,
  props: {
    id: 'pointCloudLayer-lnglat',
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin,
    getPosition: d => [d.position[0] * 1e-5, d.position[1] * 1e-5, d.position[2]],
    getNormal: d => [d.normal[0] * 1e-5, d.normal[1] * 1e-5, d.normal[2]],
    getColor: d => d.color,
    opacity: 1,
    radiusPixels: 4,
    pickable: true
  }
};

const PathLayerMetersExample = {
  layer: PathLayer,
  getData: () => dataSamples.meterPaths,
  props: {
    id: 'path-outline-layer-meter',
    opacity: 1.0,
    getColor: f => [255, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: false,
    strokeWidth: 5,
    widthScale: 10,
    autoHighlight: false,
    highlightColor: [255, 255, 255, 255],
    sizeScale: 200,
    rounded: false,
    getMarkerPercentages: () => [],
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin
  }
};

const LineLayerMillimetersExample = {
  layer: LineLayer,
  getData: () => dataSamples.milliMeterLines,
  props: {
    id: 'lineLayer',
    getColor: f => [Math.random() * 255, 0, 0],
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.milliMeterOrigin,
    strokeWidth: 20
  }
};

const PathLayerMillimetersFilteredExample = {
  layer: PathLayer,
  getData: () => dataSamples.milliMeterPathsFiltered,
  props: {
    id: 'pathLayer-meters-filtered',
    opacity: 0.6,
    getPath: f => f.path,
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.milliMeterOrigin
  }
};

const PathLayerMillimetersUnfilteredExample = {
  layer: PathLayer,
  getData: () => dataSamples.milliMeterPaths,
  props: {
    id: 'pathLayer-meters',
    opacity: 0.6,
    getPath: f => f.path,
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.milliMeterOrigin
  }
};

// PERF EXAMPLES

// perf test examples
const ScatterplotLayerPerfExample = (id, getData) => ({
  layer: ScatterplotLayer,
  getData,
  props: {
    id: `scatterplotLayerPerf-${id}`,
    getPosition: d => d,
    getFillColor: [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5
  }
});

const ScatterplotLayer64PerfExample = (id, getData) => ({
  layer: ScatterplotLayer,
  getData,
  props: {
    id: `scatterplotLayer64Perf-${id}`,
    getPosition: d => d,
    getFillColor: [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5,
    extensions: [new Fp64Extension()]
  }
});

function GeoJsonLayerPerfExample(id, getData) {
  return {
    layer: GeoJsonLayer,
    getData,
    props: {
      id: `geojsonlayerperf-${id}`,
      pointRadiusMinPixels: 4
    }
  };
}

const ScreenGridLayerPerfExample = (id, getData) => ({
  layer: ScreenGridLayer,
  getData,
  props: {
    id: `screenGridLayerPerf-${id}`,
    getPosition: d => d,
    cellSizePixels: 40,
    pickable: false
  }
});

/* eslint-disable quote-props */
export default {
  'Core Layers - Meter Offsets': {
    'PointCloudLayer (Meter offset)': PointCloudLayerExample,
    'PointCloudLayer (LngLat offset)': PointCloudLayerExample2,
    'Path Layer (Meters)': PathLayerMetersExample,
    'PathLayer (Mm Filtered: Zoom Map)': PathLayerMillimetersFilteredExample,
    'PathLayer (Mm Unfiltered: Zoom Map)': PathLayerMillimetersUnfilteredExample,
    'LineLayer (Mm - Zoom Map)': LineLayerMillimetersExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample('10M', dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample('100K', dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample('10M', dataSamples.getPoints10M),
    'GeoJsonLayer (1M Point features)': GeoJsonLayerPerfExample(
      '1M-point',
      dataSamples.getPointFeatures1M
    ),
    'GeoJsonLayer (100K MultiPoint features, 10 points per feature)': GeoJsonLayerPerfExample(
      '100K-multipoint',
      dataSamples.getMultiPointFeatures100K
    ),
    'ScreenGridLayer (1M)': ScreenGridLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScreenGridLayer (5M)': ScreenGridLayerPerfExample('5M', dataSamples.getPoints5M),
    'ScreenGridLayer (10M)': ScreenGridLayerPerfExample('10M', dataSamples.getPoints10M),
    'TextLayer (100K)': TextLayer100KExample
  }
};
