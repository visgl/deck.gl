import {
  CompositeLayer,
  LayerDataSource,
  LayerContext,
  UpdateParameters,
  CompositeLayerProps,
  Attribute,
  AttributeManager
} from '@deck.gl/core';
import {Aggregator} from './aggregator';

export type AggregationLayerProps<DataT> = CompositeLayerProps & {
  data: LayerDataSource<DataT>;
};

export default abstract class AggregationLayer<
  DataT,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<Required<AggregationLayer<DataT>> & ExtraPropsT> {
  static layerName = 'AggregationLayer';

  state!: {
    aggregator: Aggregator;
  };

  /** Allow this layer to participates in the draw cycle */
  get isDrawable() {
    return true;
  }

  /** Called to create an Aggregator instance */
  abstract createAggregator(): Aggregator;
  /** Called when some attributes change, a chance to mark Aggregator as dirty */
  abstract onAttributeChange(id: string): void;

  initializeState(): void {
    this.getAttributeManager()!.remove(['instancePickingColors']);
  }

  // Override Layer.updateState to update the GPUAggregator instance
  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      this.state.aggregator?.destroy();
      this.state.aggregator = this.createAggregator();
      this.getAttributeManager()!.invalidateAll();
    }
  }

  // Override Layer.finalizeState to dispose the GPUAggregator instance
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

  draw({moduleParameters}) {
    // GPU aggregation needs `moduleSettings` for projection/filter uniforms which are only accessible at draw time
    // GPUAggregator's Buffers are pre-allocated during `update()` and passed down to the sublayer attributes in renderLayers()
    // Although the Buffers have been bound to the sublayer's Model, their content are not populated yet
    // GPUAggregator.preDraw() is called in the draw cycle here right before Buffers are used by sublayer.draw()
    this.state.aggregator.preDraw({moduleSettings: moduleParameters});
  }

  // override CompositeLayer._getAttributeManager to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
}
