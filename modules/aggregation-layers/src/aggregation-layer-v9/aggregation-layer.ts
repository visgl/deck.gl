import {
  CompositeLayer,
  LayerDataSource,
  LayerContext,
  UpdateParameters,
  CompositeLayerProps,
  Attribute
} from '@deck.gl/core';
import {Aggregator} from './aggregator';

// TODO
type GPUAggregator = Aggregator & {destroy(): void};
// TODO
type CPUAggregator = Aggregator;

export type AggregationLayerProps<DataT> = CompositeLayerProps & {
  data: LayerDataSource<DataT>;
};

export default abstract class AggregationLayer<
  DataT,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<Required<AggregationLayer<DataT>> & ExtraPropsT> {
  static layerName = 'AggregationLayer';

  state!: {
    gpuAggregator: GPUAggregator | null;
    cpuAggregator: CPUAggregator | null;
  };

  /** Allow this layer to have an AttributeManager and participates in the draw cycle */
  get isDrawable() {
    return true;
  }

  /** Called to create a GPUAggregator instance */
  abstract getGPUAggregator(): GPUAggregator | null;
  /** Called to create a CPUAggregator instance if getGPUAggregator() returns null */
  abstract getCPUAggregator(): CPUAggregator | null;
  /** Called when some attributes change, a chance to mark Aggregator as dirty */
  abstract onAttributeChange(id: string): void;

  initializeState(): void {
    this.getAttributeManager()!.remove(['instancePickingColors']);
  }

  // Override Layer.updateState to update the GPUAggregator instance
  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      this.state.gpuAggregator?.destroy();
      this.state.gpuAggregator = this.getGPUAggregator();
      if (this.state.gpuAggregator) {
        this.getAttributeManager()!.invalidateAll();
      } else if (!this.state.cpuAggregator) {
        this.state.cpuAggregator = this.getCPUAggregator();
      }
    }
  }

  // Override Layer.finalizeState to dispose the GPUAggregator instance
  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this.state.gpuAggregator?.destroy();
  }

  // Override Layer.updateAttributes to update the aggregator
  protected updateAttributes(changedAttributes: {[id: string]: Attribute}) {
    this.getAggregator()?.setProps({
      attributes: changedAttributes
    });

    for (const id in changedAttributes) {
      this.onAttributeChange(id);
    }
  }

  draw({moduleParameters}) {
    // GPU aggregation needs `moduleSettings` for projection/filter uniforms which are only accessible at draw time
    // GPUAggregator's Buffers are allocated during `updateState`/`GPUAggregator.setProps`
    // and passed down to the sublayer attributes in renderLayers()
    // Although the Buffers have been bound to the sublayer's Model, their content are not populated yet
    // GPUAggregator.update() is called in the draw cycle here right before Buffers are used by sublayer.draw()
    this.state.gpuAggregator?.update({moduleSettings: moduleParameters});
  }

  protected getAggregator(): Aggregator | null {
    return this.state.gpuAggregator || this.state.cpuAggregator;
  }

  // Override CompositeLayer._postUpdate to update attributes and the CPUAggregator
  protected _postUpdate(updateParams: UpdateParameters<this>, forceUpdate: boolean) {
    this._updateAttributes();
    // CPUAggregator.update() must be called before renderLayers()
    // CPUAggregator's outputs are Float32Array whose content is applied during the `updateState` lifecycle
    // The typed arrays are passed to the sublayer's attributes and uploaded to GPU Buffers during the sublayer's update
    // therefore they must be up to date before renderLayers()
    this.state.cpuAggregator?.update();
    super._postUpdate(updateParams, forceUpdate);
  }
}
