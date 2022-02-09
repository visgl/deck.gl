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
import {log} from '@deck.gl/core';
import {H3HexagonLayer, MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {_CartoDynamicTileLayer, TILE_FORMATS} from '@deck.gl/carto';

const SCALE_FUNCS = {
  linear: scaleLinear,
  ordinal: scaleOrdinal,
  log: scaleLog,
  point: scalePoint,
  quantile: scaleQuantile,
  quantize: scaleQuantize,
  sqrt: scaleSqrt
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
    filled: 'filled',
    opacity: 'opacity',
    strokeColor: 'getLineColor',
    stroked: 'stroked',
    thickness: 'getLineWidth',
    radius: 'getPointRadius',
    wireframe: 'wireframe'
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

export function getLayer(type, config, dataset) {
  if (type === 'mvt' || type === 'tileset') {
    return getTileLayer(dataset);
  }

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
    hexagonId: {
      Layer: H3HexagonLayer,
      propMap: mergePropMaps(sharedPropMap, {
        visConfig: {coverage: 'coverage', elevationScale: 'elevationScale'}
      }),
      defaultProps: {...defaultProps, getHexagon: d => d[hexagonId]}
    }
  }[type];

  log.assert(layer, `Unsupported layer type: ${type}`);

  return layer;
}

function getTileLayer(dataset) {
  const {
    data: {
      tiles: [tileUrl]
    }
  } = dataset;
  /* global URLSearchParams */
  const formatTiles = new URLSearchParams(tileUrl).get('formatTiles');

  return {
    Layer: formatTiles === TILE_FORMATS.MVT ? MVTLayer : _CartoDynamicTileLayer,
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

function domainFromAttribute(attribute, scaleType) {
  if (scaleType === 'ordinal' || scaleType === 'point') {
    return attribute.categories.map(c => c.category).filter(c => c !== undefined && c !== null);
  }

  let {min} = attribute;
  if (scaleType === 'log' && min === 0) {
    min = 1e-5;
  }
  return [min, attribute.max];
}

function domainFromValues(values, scaleType) {
  if (scaleType === 'ordinal') {
    return [...new Set(values)].sort();
  } else if (scaleType === 'quantile') {
    return values.sort((a, b) => a - b);
  } else if (scaleType === 'log') {
    const [d0, d1] = extent(values);
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

export function getColorAccessor({name}, scaleType, {colors}, opacity, data) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(colors);
  const alpha = opacity !== undefined ? Math.round(255 * Math.pow(opacity, 1 / 2.2)) : 255;

  const accessor = properties => {
    const rgba = rgb(scale(properties[name]));
    return [rgba.r, rgba.g, rgba.b, alpha];
  };
  return normalizeAccessor(accessor, data);
}

export function getSizeAccessor({name}, scaleType, range, data) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(range);

  const accessor = properties => {
    return scale(properties[name]);
  };
  return normalizeAccessor(accessor, data);
}

const FORMATS = {
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
