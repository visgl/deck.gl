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
import CartoLayer from '../layers/carto-layer';

const RADIUS_DOWNSCALE = 4;
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
  enable3d: 'extruded',
  filled: 'filled',
  fixedRadius: {pointRadiusUnits: v => (v ? 'meters' : 'pixels')},
  highlightColor: 'highlightColor',
  isVisible: 'visible',
  opacity: 'opacity',
  // Hack: match Builder output
  // radius: 'getPointRadius',
  radius: {getPointRadius: r => r / RADIUS_DOWNSCALE},
  strokeColor: 'getLineColor',
  stroked: 'stroked',
  thickness: 'getLineWidth',
  wireframe: 'wireframe'
};

const defaultProps = {
  lineMiterLimit: 2,
  lineWidthUnits: 'pixels',
  rounded: true,
  wrapLongitude: false
};

// Have to wrap in function to be able to import CartoLayer without errors
let layerMap;
export function getLayerMap() {
  if (!layerMap) {
    layerMap = {
      point: {
        Layer: CartoLayer,
        propMap: {
          ...sharedPropMap,
          outline: 'stroked'
        },
        defaultProps: {
          ...defaultProps
        }
      },
      geojson: {
        Layer: CartoLayer,
        propMap: {
          ...sharedPropMap,
          thickness: {getLineWidth: w => 2 * w}
        },
        defaultProps
      },
      mvt: {
        Layer: CartoLayer,
        propMap: {
          ...sharedPropMap
        },
        defaultProps
      }
    };
  }

  return layerMap;
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

function calculateDomain(data, name, scaleType) {
  if (data.features) {
    // GeoJSON data type
    const values = data.features.map(({properties}) => properties[name]);
    if (scaleType === 'ordinal') {
      return [...new Set(values)].sort();
    }
    return extent(data.features);
  } else if (data.tilestats) {
    // Tileset data type
    const {attributes} = data.tilestats.layers[0];
    const attribute = attributes.find(a => a.attribute === name);
    return domainFromAttribute(attribute, scaleType);
  }

  return [0, 1];
}

export function getColorAccessor({name}, scaleType, {colorRange}, {data}) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(colorRange.colors);

  return ({properties}) => {
    const rgba = rgb(scale(properties[name]));
    return [rgba.r, rgba.g, rgba.b, 255 * rgba.a];
  };
}

export function getElevationAccessor({name}, scaleType, {heightRange}, {data}) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(heightRange);
  return ({properties}) => {
    return scale(properties[name]);
  };
}
export function getSizeAccessor({name}, scaleType, {radiusRange}, {data}) {
  const scale = SCALE_FUNCS[scaleType]();
  scale.domain(calculateDomain(data, name, scaleType));
  scale.range(radiusRange.map(r => r / RADIUS_DOWNSCALE));
  return ({properties}) => {
    return scale(properties[name]);
  };
}
