import {CompositeLayer} from '@deck.gl/core';
import {AGGREGATION_OPERATION} from '../utils/gpu-grid-aggregation/gpu-grid-aggregator-constants';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import GPUGridLayer from '../gpu-grid-layer/gpu-grid-layer';
import GridLayer from '../grid-layer/grid-layer';

const defaultProps = Object.assign({}, GPUGridLayer.defaultProps, GridLayer.defaultProps);

function sumReducer(accu, cur) {
  return accu + cur;
}

function maxReducer(accu, cur) {
  return cur > accu ? cur : accu;
}

function minReducer(accu, cur) {
  return cur < accu ? cur : accu;
}

function getMean(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(sumReducer, 0) / filtered.length : null;
}

function getSum(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(sumReducer, 0) : null;
}

function getMax(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(maxReducer, -Infinity) : null;
}

function getMin(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(minReducer, Infinity) : null;
}

// Function to convert from getWeight/aggregation props to getValue prop for Color and Elevation
function getValueFunc(aggregation, accessor) {
  const op = AGGREGATION_OPERATION[aggregation.toUpperCase()] || AGGREGATION_OPERATION.SUM;
  switch (op) {
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

export default class NewGridLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      useGPUAggregation: true
    };
  }

  updateState({oldProps, props, changeFlags}) {
    const newState = {};
    newState.useGPUAggregation = this.canUseGPUAggregation(props);
    this.setState(newState);
  }

  renderLayers() {
    let gridLayer = null;
    const {data, updateTriggers} = this.props;
    if (this.state.useGPUAggregation) {
      gridLayer = new GPUGridLayer(
        this.props,
        this.getSubLayerProps({
          id: 'GPU',
          updateTriggers
        }),
        {
          data
        }
      );
    } else {
      const buildColorElevationProps = this.buildColorElevationProps(this.props);
      gridLayer = new GridLayer(
        this.props,
        buildColorElevationProps,
        this.getSubLayerProps({
          id: 'CPU',
          updateTriggers
        }),
        {
          data
        }
      );
    }
    return gridLayer;
  }

  // Private methods

  // this method converts getColorWeight and colorAggregation props to getColorValue prop.
  // similarly for Elevation, for backward compitability.
  buildColorElevationProps(props) {
    const getValueProps = {};
    const {
      colorAggregation,
      getColorWeight,
      getColorValue,
      elevationAggregation,
      getElevationWeight,
      getElevationValue
    } = props;

    if (getColorValue === GridLayer.defaultProps.getColorValue.value) {
      getValueProps.getColorValue = getValueFunc(colorAggregation, getColorWeight);
    }
    if (getElevationValue === GridLayer.defaultProps.getElevationValue.value) {
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
    if (lowerPercentile !== 0 || upperPercentile !== 100) {
      // percentile calculations requires sorting not supported on GPU
      return false;
    }
    if (
      (getColorValue && getColorValue !== GridLayer.defaultProps.getColorValue.value) ||
      (getElevationValue && getElevationValue !== GridLayer.defaultProps.getElevationValue.value)
    ) {
      // accessor for custom color or elevation calculation is specified
      return false;
    }
    return true;
  }
}

NewGridLayer.layerName = 'NewGridLayer';
NewGridLayer.defaultProps = defaultProps;
