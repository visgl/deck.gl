import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {_GPUGridLayerProps} from '../gpu-grid-layer/gpu-grid-layer';
import {_CPUGridLayerProps} from '../cpu-grid-layer/cpu-grid-layer';
/** All properties supported by GridLayer. */
export declare type GridLayerProps<DataT = any> = _GridLayerProps<DataT> &
  CompositeLayerProps<DataT>;
/** Properties added by GridLayer. */
declare type _GridLayerProps<DataT> = _CPUGridLayerProps<DataT> &
  _GPUGridLayerProps<DataT> & {
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
export default class GridLayer<DataT = any, ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_GridLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<GridLayerProps<any>>;
  state: CompositeLayer['state'] & {
    useGPUAggregation: boolean;
  };
  initializeState(): void;
  updateState({props}: UpdateParameters<this>): void;
  renderLayers(): Layer;
  canUseGPUAggregation(props: GridLayer['props']): boolean;
}
export {};
// # sourceMappingURL=grid-layer.d.ts.map
