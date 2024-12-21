import {LayerContext, UpdateParameters} from '@deck.gl/core';
import AggregationLayer, {AggregationLayerProps} from './aggregation-layer';
import BinSorter from './utils/bin-sorter';
export declare type GridAggregationLayerProps<DataT = any> = AggregationLayerProps<DataT>;
export default abstract class GridAggregationLayer<
  ExtraPropsT = {}
> extends AggregationLayer<ExtraPropsT> {
  static layerName: string;
  state: AggregationLayer['state'] & {
    aggregationDataDirty?: any;
    aggregationWeightsDirty?: any;
    gpuAggregation?: any;
    getValue?: () => any;
    sortedBins?: BinSorter;
  };
  initializeAggregationLayer({dimensions}: {dimensions: any}): void;
  updateState(opts: UpdateParameters<this>): void;
  finalizeState(context: LayerContext): void;
  updateShaders(shaders: any): void;
  updateAggregationState(opts: any): void;
  allocateResources(numRow: any, numCol: any): void;
  updateResults({
    aggregationData,
    maxMinData,
    maxData,
    minData
  }: {
    aggregationData: any;
    maxMinData: any;
    maxData: any;
    minData: any;
  }): void;
  _updateAggregation(opts: any): void;
  _updateWeightBins(): void;
  _uploadAggregationResults(): void;
}
// # sourceMappingURL=grid-aggregation-layer.d.ts.map
