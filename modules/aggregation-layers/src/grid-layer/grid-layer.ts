import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import GPUGridLayer, {GPUGridLayerProps} from '../gpu-grid-layer/gpu-grid-layer';
import CPUGridLayer, {CPUGridLayerProps} from '../cpu-grid-layer/cpu-grid-layer';

const defaultProps: DefaultProps<GridLayerProps> = {
  ...GPUGridLayer.defaultProps,
  ...CPUGridLayer.defaultProps,
  gpuAggregation: false
};

/** All properties supported by GridLayer. */
export type GridLayerProps<DataT = any> = _GridLayerProps<DataT> & CompositeLayerProps;

/** Properties added by GridLayer. */
type _GridLayerProps<DataT> = CPUGridLayerProps<DataT> &
  GPUGridLayerProps<DataT> & {
    /**
     * Whether the aggregation should be performed in high-precision 64-bit mode.
     * @default false
     */
    fp64?: boolean;

    /**
     * When set to true, aggregation is performed on GPU, provided other conditions are met.
     * @default false
     */
    gpuAggregation?: boolean;
  };

/** Aggregate data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains. */
export default class GridLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_GridLayerProps<DataT>>
> {
  static layerName = 'GridLayer';
  static defaultProps = defaultProps;

  state!: CompositeLayer['state'] & {
    useGPUAggregation: boolean;
  };

  initializeState() {
    this.state = {
      useGPUAggregation: true
    };
  }

  updateState({props}: UpdateParameters<this>) {
    this.setState({
      useGPUAggregation: this.canUseGPUAggregation(props)
    });
  }

  renderLayers(): Layer {
    const {data, updateTriggers} = this.props;
    const id = this.state.useGPUAggregation ? 'GPU' : 'CPU';
    const LayerType = this.state.useGPUAggregation
      ? this.getSubLayerClass('GPU', GPUGridLayer)
      : this.getSubLayerClass('CPU', CPUGridLayer);
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

  canUseGPUAggregation(props: GridLayer['props']) {
    const {
      gpuAggregation,
      lowerPercentile,
      upperPercentile,
      getColorValue,
      getElevationValue,
      colorScaleType
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
    if (getColorValue !== null || getElevationValue !== null) {
      // accessor for custom color or elevation calculation is specified
      return false;
    }
    if (colorScaleType === 'quantile' || colorScaleType === 'ordinal') {
      // quantile and ordinal scales are not supported on GPU
      return false;
    }
    return true;
  }
}
