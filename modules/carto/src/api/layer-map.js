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
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';

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
  highlightColor: 'highlightColor',
  isVisible: 'visible',
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
    radius: 'getPointRadius'
  },
  wireframe: 'wireframe'
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

export const LAYER_MAP = {
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
  mvt: {
    Layer: MVTLayer,
    propMap: sharedPropMap,
    defaultProps: {...defaultProps, pointRadiusScale: 0.3, lineWidthScale: 2}
  }
};

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

function calculateDomain(data, name, scaleType) {
  if (data.features) {
    // GeoJSON data type
    const values = data.features.map(({properties}) => properties[name]);
    if (scaleType === 'ordinal') {
      return [...new Set(values)].sort();
    }
    return extent(values);
  } else if (data.tilestats) {
    // Tileset data type
    const {attributes} = data.tilestats.layers[0];
    const attribute = attributes.find(a => a.attribute === name);
    return domainFromAttribute(attribute, scaleType);
  }

  return [0, 1];
}

export function getColorAccessor({name}, scaleType, {colorRange}, data) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(colorRange.colors);

  return ({properties}) => {
    const rgba = rgb(scale(properties[name]));
    return [rgba.r, rgba.g, rgba.b, 255 * rgba.a];
  };
}

export function getElevationAccessor({name}, scaleType, {heightRange}, data) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(heightRange);
  return ({properties}) => {
    return scale(properties[name]);
  };
}
export function getSizeAccessor({name}, scaleType, {radiusRange}, data) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(radiusRange);
  return ({properties}) => {
    return scale(properties[name]);
  };
}

const FORMATS = {
  date: s => moment.utc(s).format('MM/DD/YY HH:mm:ssa'),
  integer: d3Format('i'),
  float: d3Format('.5f'),
  timestamp: s => moment.utc(s).format('MM/DD/YY HH:mm:ssa'),
  default: String
};

export function getTextAccessor({name, type}) {
  const format = FORMATS[type] || FORMATS.default;
  return ({properties}) => {
    return format(properties[name]);
  };
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
