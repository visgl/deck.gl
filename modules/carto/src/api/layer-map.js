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

export function getColorAccessor({name}, scale, range, {data}) {
  let scaler;
  let domain;
  if (scale === 'quantize') {
    scaler = scaleQuantize();
  } else if (scale === 'ordinal') {
    scaler = scaleOrdinal();
  }

  if (data.features) {
    const values = data.features.map(({properties}) => properties[name]);
    if (scale === 'ordinal') {
      domain = [...new Set(values)].sort();
    } else {
      domain = extent(data.features);
    }
  } else if (data.tilestats) {
    const {attributes} = data.tilestats.layers[0];
    const attribute = attributes.find(a => a.attribute === name);
    domain = attribute.categories.map(c => c.category).filter(c => c !== undefined && c !== null);
  }

  scaler.domain(domain);
  scaler.range(range);

  return ({properties}) => {
    const rgba = rgb(scaler(properties[name]));
    return [rgba.r, rgba.g, rgba.b, 255 * rgba.a];
  };
}

export function getElevationAccessor({name}, scale, range, {data}) {
  const domain = extent(data.features, ({properties}) => properties[name]);
  const radiusRange = range.map(r => r / RADIUS_DOWNSCALE);
  const scaler = scaleLinear()
    .domain(domain)
    .range(radiusRange);
  return ({properties}) => {
    return scaler(properties[name]);
  };
}
export function getSizeAccessor({name}, scale, range, {data}) {
  const domain = extent(data.features, ({properties}) => properties[name]);
  const radiusRange = range.map(r => r / RADIUS_DOWNSCALE);
  const scaler = scaleSqrt()
    .domain(domain)
    .range(radiusRange);
  return ({properties}) => {
    return scaler(properties[name]);
  };
}
