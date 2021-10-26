import {extent} from 'd3-array';
import {rgb} from 'd3-color';
import {scaleLinear, scaleOrdinal, scaleSqrt, scaleQuantize} from 'd3-scale';
import CartoLayer from '../layers/carto-layer';

const RADIUS_DOWNSCALE = 4;

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

const SCALE_TYPES = {
  ordinal: 'ordinal',
  quantile: 'quantile',
  quantize: 'quantize',
  linear: 'linear',
  sqrt: 'sqrt',
  log: 'log',
  point: 'point'
};

function domainFromAttribute(attribute, scaleType) {
  switch (scaleType) {
    case SCALE_TYPES.ordinal:
    case SCALE_TYPES.point:
      return attribute.categories.map(c => c.category).filter(c => c !== undefined && c !== null);
    case SCALE_TYPES.log: {
      const [d0, d1] = [attribute.min, attribute.max];
      return [d0 === 0 ? 1e-5 : d0, d1];
    }
    case SCALE_TYPES.quantize:
    case SCALE_TYPES.linear:
    case SCALE_TYPES.sqrt:
    default:
      return [attribute.min, attribute.max];
  }
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
  let scaler;
  if (scaleType === 'quantize') {
    scaler = scaleQuantize();
  } else if (scaleType === 'ordinal') {
    scaler = scaleOrdinal();
  }

  scaler.domain(calculateDomain(data, name, scaleType));
  scaler.range(colorRange.colors);

  return ({properties}) => {
    const rgba = rgb(scaler(properties[name]));
    return [rgba.r, rgba.g, rgba.b, 255 * rgba.a];
  };
}

export function getElevationAccessor({name}, scaleType, {heightRange}, {data}) {
  const scaler = scaleLinear()
    .domain(calculateDomain(data, name, scaleType))
    .range(heightRange);
  return ({properties}) => {
    return scaler(properties[name]);
  };
}
export function getSizeAccessor({name}, scaleType, visConfig, {data}) {
  const range = visConfig.radiusRange.map(r => r / RADIUS_DOWNSCALE);
  const scaler = scaleSqrt()
    .domain(calculateDomain(data, name, scaleType))
    .range(range);
  return ({properties}) => {
    return scaler(properties[name]);
  };
}
