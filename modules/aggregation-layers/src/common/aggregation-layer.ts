// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  LayerDataSource,
  LayerContext,
  UpdateParameters,
  CompositeLayerProps,
  Attribute,
  AttributeManager
} from '@deck.gl/core';
import {Aggregator} from './aggregator/aggregator';

export type AggregationLayerProps<DataT> = CompositeLayerProps & {
  data: LayerDataSource<DataT>;
};

export default abstract class AggregationLayer<
  DataT,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<Required<AggregationLayer<DataT>> & ExtraPropsT> {
  static layerName = 'AggregationLayer';

  state!: {
    aggregatorType: string;
    aggregator: Aggregator;
  };

  /** Allow this layer to participates in the draw cycle */
  get isDrawable() {
    return true;
  }

  abstract getAggregatorType(): string;
  /** Called to create an Aggregator instance */
  abstract createAggregator(type: string): Aggregator;
  /** Called when some attributes change, a chance to mark Aggregator as dirty */
  abstract onAttributeChange(id: string): void;

  initializeState(): void {
    this.getAttributeManager()!.remove(['instancePickingColors']);
  }

  // Extend Layer.updateState to update the Aggregator instance
  // returns true if aggregator is changed
  updateState(params: UpdateParameters<this>): boolean {
    super.updateState(params);

    const aggregatorType = this.getAggregatorType();
    if (params.changeFlags.extensionsChanged || this.state.aggregatorType !== aggregatorType) {
      this.state.aggregator?.destroy();
      const aggregator = this.createAggregator(aggregatorType);
      aggregator.setProps({
        attributes: this.getAttributeManager()?.attributes
      });
      this.setState({aggregator, aggregatorType});
      return true;
    }
    return false;
  }

  // Override Layer.finalizeState to dispose the Aggregator instance
  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this.state.aggregator.destroy();
  }

  // Override Layer.updateAttributes to update the aggregator
  protected updateAttributes(changedAttributes: {[id: string]: Attribute}) {
    const {aggregator} = this.state;
    aggregator.setProps({
      attributes: changedAttributes
    });

    for (const id in changedAttributes) {
      this.onAttributeChange(id);
    }

    // In aggregator.update() the aggregator allocates the buffers to store its output
    // These buffers will be exposed by aggregator.getResults() and passed to the sublayers
    // Therefore update() must be called before renderLayers()
    // CPUAggregator's output is populated right here in update()
    // GPUAggregator's output is pre-allocated and populated in preDraw(), see comments below
    aggregator.update();
  }

  draw({shaderModuleProps}) {
    // GPU aggregation needs `shaderModuleProps` for projection/filter uniforms which are only accessible at draw time
    // GPUAggregator's Buffers are pre-allocated during `update()` and passed down to the sublayer attributes in renderLayers()
    // Although the Buffers have been bound to the sublayer's Model, their content are not populated yet
    // GPUAggregator.preDraw() is called in the draw cycle here right before Buffers are used by sublayer.draw()
    const {aggregator} = this.state;
    // @ts-expect-error only used by GPU aggregators
    aggregator.setProps({shaderModuleProps});
    aggregator.preDraw();
  }

  // override CompositeLayer._getAttributeManager to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
}
