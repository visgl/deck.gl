import {deviation, extent, groupSort, median, variance} from 'd3-array';
import {rgb} from 'd3-color';
import {
  scaleLinear,
  scaleOrdinal,
  scaleLog,
  scalePoint,
  scaleQuantile,
  scaleQuantize,
  scaleSqrt,
  scaleThreshold
} from 'd3-scale';
import {format as d3Format} from 'd3-format';
import moment from 'moment-timezone';

import {CPUGridLayer, HeatmapLayer, HexagonLayer} from '@deck.gl/aggregation-layers';
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
  sqrt: scaleSqrt,
  custom: scaleThreshold
};
export type SCALE_TYPE = keyof typeof SCALE_FUNCS;

const UNKNOWN_COLOR = '#868d91';

export const AGGREGATION = {
  average: 'MEAN',
  maximum: 'MAX',
  minimum: 'MIN',
  sum: 'SUM'
};

const AGGREGATION_FUNC = {
  'count unique': (values, accessor) => groupSort(values, v => v.length, accessor).length,
  median,
  // Unfortunately mode() is only available in d3-array@3+ which is ESM only
  mode: (values, accessor) => groupSort(values, v => v.length, accessor).pop(),
  stddev: deviation,
  variance
};

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
    enable3d: 'extruded',
    elevationScale: 'elevationScale',
    filled: 'filled',
    opacity: 'opacity',
    strokeColor: 'getLineColor',
    stroked: 'stroked',
    thickness: 'getLineWidth',
    radius: 'getPointRadius',
    wireframe: 'wireframe'
  }
};

const aggregationVisConfig = {
  colorAggregation: x => ({colorAggregation: AGGREGATION[x] || AGGREGATION.sum}),
  colorRange: x => ({colorRange: x.colors.map(hexToRGBA)}),
  coverage: 'coverage',
  elevationPercentile: ['elevationLowerPercentile', 'elevationUpperPercentile'],
  percentile: ['lowerPercentile', 'upperPercentile']
};

const defaultProps = {
  lineMiterLimit: 2,
  lineWidthUnits: 'pixels',
  pointRadiusUnits: 'pixels',
  rounded: true,
  wrapLongitude: false
};

function mergePropMaps(a = {}, b = {}) {
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

  const geoColumn = dataset?.geoColumn;
  const getPosition = d => d[geoColumn].coordinates;

  const hexagonId = config.columns?.hex_id;
  const layer = {
    point: {
      Layer: GeoJsonLayer,
      propMap: {visConfig: {outline: 'stroked'}}
    },
    geojson: {
      Layer: GeoJsonLayer
    },
    grid: {
      Layer: CPUGridLayer,
      propMap: {visConfig: {...aggregationVisConfig, worldUnitSize: x => ({cellSize: 1000 * x})}},
      defaultProps: {getPosition}
    },
    heatmap: {
      Layer: HeatmapLayer,
      propMap: {visConfig: {...aggregationVisConfig, radius: 'radiusPixels'}},
      defaultProps: {getPosition}
    },
    hexagon: {
      Layer: HexagonLayer,
      propMap: {visConfig: {...aggregationVisConfig, worldUnitSize: x => ({radius: 1000 * x})}},
      defaultProps: {getPosition}
    },
    hexagonId: {
      Layer: H3HexagonLayer,
      propMap: {visConfig: {coverage: 'coverage'}},
      defaultProps: {getHexagon: d => d[hexagonId], stroked: false}
    }
  }[type];

  assert(layer, `Unsupported layer type: ${type}`);
  layer.propMap = mergePropMaps(sharedPropMap, layer.propMap);
  layer.defaultProps = {...defaultProps, ...layer.defaultProps};
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
    return groupSort(
      values,
      g => -g.length,
      d => d
    );
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

export function getColorValueAccessor({name}, colorAggregation, data: any) {
  const aggregator = AGGREGATION_FUNC[colorAggregation];
  const accessor = values => aggregator(values, p => p[name]);
  return normalizeAccessor(accessor, data);
}

export function getColorAccessor(
  {name},
  scaleType: SCALE_TYPE,
  {colors, colorMap},
  opacity: number | undefined,
  data: any
) {
  const scale = SCALE_FUNCS[scaleType as any]();
  let domain: (string | number)[] = [];
  let scaleColor: string[] = [];

  if (Array.isArray(colorMap)) {
    colorMap.forEach(([value, color]) => {
      domain.push(value);
      scaleColor.push(color);
    });
  } else {
    domain = calculateDomain(data, name, scaleType);
    scaleColor = colors;
  }

  if (scaleType === 'ordinal') {
    domain = domain.slice(0, scaleColor.length);
  }

  scale.domain(domain);
  scale.range(scaleColor);
  scale.unknown(UNKNOWN_COLOR);
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

  const calculateOffset = r => [signX * (r + padding), signY * (r + padding + sizeOffset)];

  return typeof radius === 'function'
    ? d => {
        return calculateOffset(radius(d));
      }
    : calculateOffset(radius);
}

export {domainFromValues as _domainFromValues};
