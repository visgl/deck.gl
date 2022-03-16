import {extent} from 'd3-array';
import {rgb} from 'd3-color';
import {
  scaleLinear,
  scaleOrdinal,
  scaleLog,
  scalePoint,
  scaleQuantile,
  scaleQuantize,
  scaleSqrt
} from 'd3-scale';
import {format as d3Format} from 'd3-format';
import moment from 'moment-timezone';

import {CPUGridLayer} from '@deck.gl/aggregation-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {H3HexagonLayer, MVTLayer} from '@deck.gl/geo-layers';

import CartoTileLayer from '../layers/carto-tile-layer';
import {TILE_FORMATS} from './maps-api-common';
import {assert} from '../utils';

const SCALE_FUNCS = {
  linear: scaleLinear,
  ordinal: scaleOrdinal,
  log: scaleLog,
  point: scalePoint,
  quantile: scaleQuantile,
  quantize: scaleQuantize,
  sqrt: scaleSqrt
};
export type SCALE_TYPE = keyof typeof SCALE_FUNCS;

const hexToRGBA = c => {
  const {r, g, b, opacity} = rgb(c);
  return [r, g, b, 255 * opacity];
};

// Kepler -> Deck.gl
const sharedPropMap = {
  color: 'getFillColor',
  isVisible: 'visible',
  label: 'cartoLabel',
  textLabel: {
    alignment: 'getTextAlignmentBaseline',
    anchor: 'getTextAnchor',
    color: 'getTextColor',
    size: 'getTextSize'
  },
  visConfig: {
    colorAggregation: 'colorAggregation',
    colorRange: x => ({colorRange: x.colors.map(hexToRGBA)}),
    coverage: 'coverage',
    enable3d: 'extruded',
    elevationPercentile: ['elevationLowerPercentile', 'elevationUpperPercentile'],
    elevationScale: 'elevationScale',
    filled: 'filled',
    opacity: 'opacity',
    percentile: ['lowerPercentile', 'upperPercentile'],
    strokeColor: 'getLineColor',
    stroked: 'stroked',
    thickness: 'getLineWidth',
    radius: 'getPointRadius',
    wireframe: 'wireframe',
    worldUnitSize: x => ({cellSize: 1000 * x})
  }
};

const RADIUS_DOWNSCALE = 0.2;

const defaultProps = {
  lineMiterLimit: 2,
  lineWidthUnits: 'pixels',
  pointRadiusScale: RADIUS_DOWNSCALE,
  pointRadiusUnits: 'pixels',
  rounded: true,
  wrapLongitude: false
};

function mergePropMaps(a, b) {
  return {...a, ...b, visConfig: {...a.visConfig, ...b.visConfig}};
}

export function getLayer(
  type: string,
  config,
  dataset
): {Layer: any; propMap: any; defaultProps: any} {
  if (type === 'mvt' || type === 'tileset') {
    return getTileLayer(dataset);
  }

  const {geoColumn} = dataset;
  const hexagonId = config.columns?.hex_id;
  const layer = {
    point: {
      Layer: GeoJsonLayer,
      propMap: mergePropMaps(sharedPropMap, {
        visConfig: {outline: 'stroked'}
      }),
      defaultProps
    },
    geojson: {
      Layer: GeoJsonLayer,
      propMap: sharedPropMap,
      defaultProps: {...defaultProps, lineWidthScale: 2}
    },
    grid: {
      Layer: CPUGridLayer,
      propMap: sharedPropMap,
      defaultProps: {...defaultProps, getPosition: d => d[geoColumn].coordinates}
    },
    hexagonId: {
      Layer: H3HexagonLayer,
      propMap: sharedPropMap,
      defaultProps: {...defaultProps, getHexagon: d => d[hexagonId]}
    }
  }[type];

  assert(layer, `Unsupported layer type: ${type}`);
  return layer;
}

function getTileLayer(dataset) {
  const {
    data: {
      tiles: [tileUrl]
    }
  } = dataset;
  /* global URL */
  const formatTiles = new URL(tileUrl).searchParams.get('formatTiles') || TILE_FORMATS.MVT;

  return {
    Layer: formatTiles === TILE_FORMATS.MVT ? MVTLayer : CartoTileLayer,
    propMap: sharedPropMap,
    defaultProps: {
      ...defaultProps,
      pointRadiusScale: 0.3,
      lineWidthScale: 2,
      uniqueIdProperty: 'geoid',
      formatTiles
    }
  };
}

function domainFromAttribute(attribute, scaleType: SCALE_TYPE) {
  if (scaleType === 'ordinal' || scaleType === 'point') {
    return attribute.categories.map(c => c.category).filter(c => c !== undefined && c !== null);
  }

  let {min} = attribute;
  if (scaleType === 'log' && min === 0) {
    min = 1e-5;
  }
  return [min, attribute.max];
}

function domainFromValues(values, scaleType: SCALE_TYPE) {
  if (scaleType === 'ordinal') {
    return [...new Set(values)].sort();
  } else if (scaleType === 'quantile') {
    return values.sort((a, b) => a - b);
  } else if (scaleType === 'log') {
    const [d0, d1] = extent(values as number[]);
    return [d0 === 0 ? 1e-5 : d0, d1];
  }
  return extent(values);
}

function calculateDomain(data, name, scaleType) {
  if (data.tilestats) {
    // Tileset data type
    const {attributes} = data.tilestats.layers[0];
    const attribute = attributes.find(a => a.attribute === name);
    return domainFromAttribute(attribute, scaleType);
  } else if (data.features) {
    // GeoJSON data type
    const values = data.features.map(({properties}) => properties[name]);
    return domainFromValues(values, scaleType);
  } else if (Array.isArray(data) && data[0][name] !== undefined) {
    // JSON data type
    const values = data.map(properties => properties[name]);
    return domainFromValues(values, scaleType);
  }

  return [0, 1];
}

function normalizeAccessor(accessor, data) {
  if (data.features || data.tilestats) {
    return ({properties}) => {
      return accessor(properties);
    };
  }
  return accessor;
}

export function getColorAccessor(
  {name},
  scaleType: SCALE_TYPE,
  {colors},
  opacity: number | undefined,
  data: any
) {
  const scale = SCALE_FUNCS[scaleType as any]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(colors);
  const alpha = opacity !== undefined ? Math.round(255 * Math.pow(opacity, 1 / 2.2)) : 255;

  const accessor = properties => {
    const {r, g, b} = rgb(scale(properties[name]));
    return [r, g, b, alpha];
  };
  return normalizeAccessor(accessor, data);
}

export function getSizeAccessor({name}, scaleType: SCALE_TYPE, range: Iterable<Range>, data: any) {
  const scale = SCALE_FUNCS[scaleType as any]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(range);

  const accessor = properties => {
    return scale(properties[name]);
  };
  return normalizeAccessor(accessor, data);
}

const FORMATS: Record<string, (value: any) => string> = {
  date: s => moment.utc(s).format('MM/DD/YY HH:mm:ssa'),
  integer: d3Format('i'),
  float: d3Format('.5f'),
  timestamp: s => moment.utc(s).format('X'),
  default: String
};

export function getTextAccessor({name, type}, data) {
  const format = FORMATS[type] || FORMATS.default;
  const accessor = properties => {
    return format(properties[name]);
  };
  return normalizeAccessor(accessor, data);
}

export function getTextPixelOffsetAccessor({alignment, anchor, size}, radius) {
  const padding = 20;
  const signX = anchor === 'middle' ? 0 : anchor === 'start' ? 1 : -1;
  const signY = alignment === 'center' ? 0 : alignment === 'bottom' ? 1 : -1;
  const sizeOffset = alignment === 'center' ? 0 : size;

  const calculateOffset = r => {
    r = RADIUS_DOWNSCALE * r;
    return [signX * (r + padding), signY * (r + padding + sizeOffset)];
  };

  return typeof radius === 'function'
    ? d => {
        return calculateOffset(radius(d));
      }
    : calculateOffset(radius);
}

export {domainFromValues as _domainFromValues};
