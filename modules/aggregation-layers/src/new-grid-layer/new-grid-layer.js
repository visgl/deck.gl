import {CompositeLayer} from '@deck.gl/core';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import GPUGridLayer from '../gpu-grid-layer/gpu-grid-layer';
import GridLayer from '../grid-layer/grid-layer';

const defaultProps = Object.assign({}, GPUGridLayer.defaultProps, GridLayer.defaultProps, {
  gpuAggregation: false
});

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
    const {data, updateTriggers} = this.props;
    const id = this.state.useGPUAggregation ? 'GPU' : 'CPU';
    const LayerType = this.state.useGPUAggregation
      ? this.getSubLayerClass('GPU', GPUGridLayer)
      : this.getSubLayerClass('CPU', GridLayer);
    return new LayerType(
      this.props,
      this.getSubLayerProps({
        id,
        updateTriggers
      }),
      {
        data
      }
    );
  }

  // Private methods

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
