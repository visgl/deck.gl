import {CompositeLayer} from '@deck.gl/core';
import {AGGREGATION_OPERATION} from '../utils/gpu-grid-aggregation/gpu-grid-aggregator-constants';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import GPUGridLayer from '../gpu-grid-layer/gpu-grid-layer';
import GridLayer from '../grid-layer/grid-layer';

const defaultProps = Object.assign({}, GPUGridLayer.defaultProps, GridLayer.defaultProps);

// Function to convert from getWeight/aggregation props to getValue prop for Color and Elevation
function getMean(pts, accessor) {
  const filtered = pts.map(item => accessor(item)).filter(pt => Number.isFinite(pt));

  return filtered.length ? filtered.reduce((accu, curr) => accu + curr, 0) / filtered.length : null;
}

function getSum(pts, accessor) {
  const filtered = pts.map(item => accessor(item)).filter(pt => Number.isFinite(pt));

  return filtered.length ? filtered.reduce((accu, curr) => accu + curr, 0) : null;
}

function getMax(pts, accessor) {
  const filtered = pts.map(item => accessor(item)).filter(pt => Number.isFinite(pt));

  return filtered.length
    ? filtered.reduce((accu, curr) => (curr > accu ? curr : accu), -Infinity)
    : null;
}

function getMin(pts, accessor) {
  const filtered = pts.map(item => accessor(item)).filter(pt => Number.isFinite(pt));

  return filtered.length
    ? filtered.reduce((accu, curr) => (curr < accu ? curr : accu), Infinity)
    : null;
}

function getValueFunc(aggregation, accessor) {
  switch (aggregation) {
    case AGGREGATION_OPERATION.MIN:
      return pts => getMin(pts, accessor);
    case AGGREGATION_OPERATION.SUM:
      return pts => getSum(pts, accessor);
    case AGGREGATION_OPERATION.MEAN:
      return pts => getMean(pts, accessor);
    case AGGREGATION_OPERATION.MAX:
      return pts => getMax(pts, accessor);
    default:
      return null;
  }
}

export default class NewGPULayer extends CompositeLayer {
  initializeState() {
    this.state = {
      useGPUAggregation: true
    };
  }

  getPickingInfo(opts) {
    // TODO: implement picking.
    return Object.assign({}, opts.info, {picked: false, object: null});
  }

  updateState({oldProps, props, changeFlags}) {
    const newState = {};
    newState.useGPUAggregation = this.canUseGPUAggregation(props);
    this.setState(newState);
  }

  renderLayers() {
    let gridLayer = null;

    if (this.state.useGPUAggregation) {
      gridLayer = new GPUGridLayer(
        this.props,
        this.getSubLayerProps({
          id: 'GPU',
          // Note: data has to be passed explicitly like this to avoid being empty
          data: this.props.data
        })
      );
    } else {
      const buildColorElevationProps = this.buildColorElevationProps(this.props);
      gridLayer = new GridLayer(
        this.props,
        buildColorElevationProps,
        this.getSubLayerProps({
          id: 'CPU',
          // Note: data has to be passed explicitly like this to avoid being empty
          data: this.props.data
        })
      );
    }
    return [gridLayer];
  }

  // Private methods

  // this method converts getColorWeight and colorAggregation props to getColorValue prop.
  // similarly for Elevation, for backward compitability.
  buildColorElevationProps(props) {
    const {DEFAULT_GETVALUE} = GridLayer;
    const getValueProps = {};
    const {
      colorAggregation,
      getColorWeight,
      getColorValue,
      elevationAggregation,
      getElevationWeight,
      getElevationValue
    } = props;

    if (getColorValue === DEFAULT_GETVALUE) {
      getValueProps.getColorValue = getValueFunc(colorAggregation, getColorWeight);
    }
    if (getElevationValue === DEFAULT_GETVALUE) {
      getValueProps.getElevationValue = getValueFunc(elevationAggregation, getElevationWeight);
    }
    return getValueProps;
  }

  canUseGPUAggregation(props) {
    const {
      gpuAggregation,
      lowerPercentile,
      upperPercentile,
      getColorValue,
      getElevationValue
    } = props;
    if (!gpuAggregation) {
      // cpu aggregation is requested
      return false;
    }
    if (!GPUGridAggregator.isSupported(this.context.gl)) {
      return false;
    }
    if (lowerPercentile !== 0 || upperPercentile !== 0) {
      // percentile calculations requires sorting not supported on GPU
      return false;
    }
    const {DEFAULT_GETCOLORVALUE, DEFAULT_GETELEVATIONVALUE} = GridLayer;
    if (
      (getColorValue && getColorValue !== DEFAULT_GETCOLORVALUE) ||
      (getElevationValue && getElevationValue !== DEFAULT_GETELEVATIONVALUE)
    ) {
      // accessor for custom color or elevation calculation is specified
      return false;
    }
    return true;
  }
}

NewGPULayer.layerName = 'NewGPULayer';
NewGPULayer.defaultProps = defaultProps;
