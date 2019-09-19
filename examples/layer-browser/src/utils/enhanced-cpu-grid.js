import {
  scaleLinear,
  scaleQuantize,
  scaleQuantile,
  scaleOrdinal,
  scaleSqrt,
  scaleLog,
  scalePoint
} from 'd3-scale';

const SCALE_TYPES = {
  ordinal: 'ordinal',
  quantile: 'quantile',
  quantize: 'quantize',
  linear: 'linear',
  sqrt: 'sqrt',
  log: 'log',

  // ordinal domain to linear range
  point: 'point'
};

const SCALE_FUNC = {
  [SCALE_TYPES.linear]: scaleLinear,
  [SCALE_TYPES.quantize]: scaleQuantize,
  [SCALE_TYPES.quantile]: scaleQuantile,
  [SCALE_TYPES.ordinal]: scaleOrdinal,
  [SCALE_TYPES.sqrt]: scaleSqrt,
  [SCALE_TYPES.log]: scaleLog,
  [SCALE_TYPES.point]: scalePoint
};

function notNullorUndefined(d) {
  return d !== undefined && d !== null;
}

function unique(values) {
  const results = [];
  values.forEach(v => {
    if (!results.includes(v) && notNullorUndefined(v)) {
      results.push(v);
    }
  });

  return results;
}

// Enable render color by customized color Scale
export function getBinColorDomain(scaleType, bins, [lowerIdx, upperIdx]) {
  switch (scaleType) {
    case SCALE_TYPES.quantize:
      return [bins[lowerIdx].value, bins[upperIdx].value];

    case SCALE_TYPES.quantile:
      return bins.slice(lowerIdx, upperIdx + 1).map(d => d.value);
    case SCALE_TYPES.ordinal:
      return unique(bins.map(b => b.value)).sort();
    default:
      return [bins[lowerIdx].value, bins[upperIdx].value];
  }
}

export function getScaleFunctor(scaleType) {
  return SCALE_FUNC[scaleType] || SCALE_FUNC.quantile;
}

export function getColorValueDomain(layer) {
  const {lowerPercentile, upperPercentile, colorScale} = layer.props;
  const {sortedBins} = layer.state.sortedColorBins;
  const len = sortedBins.length;

  if (!len) {
    // err... what do we do
    layer.state.colorValueDomain = null;
  } else {
    const lowerIdx = Math.ceil((lowerPercentile / 100) * (len - 1));
    const upperIdx = Math.floor((upperPercentile / 100) * (len - 1));

    // calculate valueDomain based on
    layer.state.colorValueDomain = getBinColorDomain(colorScale, sortedBins, [lowerIdx, upperIdx]);
    layer.getColorScale();
  }

  layer.props.onSetColorDomain(layer.state.colorValueDomain);
}

export function getColorScaleFunction(layer) {
  const {colorScale, colorDomain} = layer.props;
  layer.state.colorScaleFunc = getScaleFunctor(colorScale)()
    .domain(colorDomain || layer.state.colorDomain || layer.state.colorValueDomain)
    .range(layer.props.colorRange);
}

export function getElevationScaleFunction(layer) {
  const elevationRange = layer.props.elevationRange;
  const elevationDomain = layer.props.elevationDomain || layer.state.elevationValueDomain;

  layer.state.elevationScaleFunc = getScaleFunctor(layer.props.sizeScale)()
    .domain(elevationDomain)
    .range(elevationRange);
}

export function getRadiusScaleFunction(layer) {
  const {viewport} = layer.context;
  layer.state.radiusScaleFunc = SCALE_FUNC.sqrt()
    .domain(layer.state.radiusDomain)
    .range(layer.props.radiusRange.map(d => d * viewport.distanceScales.metersPerPixel[0]));
}

export function needsRecalculateColorDomain(oldProps, props) {
  return (
    oldProps.lowerPercentile !== props.lowerPercentile ||
    oldProps.upperPercentile !== props.upperPercentile ||
    oldProps.colorScale !== props.colorScale
  );
}

export function needReCalculateScaleFunction(oldProps, props) {
  return oldProps.colorRange !== props.colorRange;
}

export function needsRecalculateRadiusRange(oldProps, props) {
  return (
    oldProps.radiusRange !== props.radiusRange &&
    (oldProps.radiusRange[0] !== props.radiusRange[0] ||
      oldProps.radiusRange[1] !== props.radiusRange[1])
  );
}
