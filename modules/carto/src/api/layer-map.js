import {extent} from 'd3-array';
import {rgb} from 'd3-color';
import {scaleOrdinal, scaleSqrt, scaleQuantize} from 'd3-scale';
import CartoLayer from '../layers/carto-layer';

const RADIUS_DOWNSCALE = 4;

// Kepler -> Deck.gl
const sharedPropMap = {
  color: 'getFillColor',
  extruded: 'enable3d',
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
  if (scale === 'quantize') {
    scaler = scaleQuantize();
    const dataExtent = extent(data.features, ({properties}) => properties[name]);
    scaler.domain(dataExtent);
  } else if (scale === 'ordinal') {
    scaler = scaleOrdinal();
    // TODO how do we get the domain?
  }

  scaler.range(range);

  return ({properties}) => {
    const rgba = rgb(scaler(properties[name]));
    return [rgba.r, rgba.g, rgba.b, 255 * rgba.a];
  };
}

export function getSizeAccessor({name}, scale, range, {data}) {
  const dataExtent = extent(data.features, ({properties}) => properties[name]);
  const radiusRange = range.map(r => r / RADIUS_DOWNSCALE);
  const scaler = scaleSqrt()
    .domain(dataExtent)
    .range(radiusRange);
  return ({properties}) => {
    return scaler(properties[name]);
  };
}
