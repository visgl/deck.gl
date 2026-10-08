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
  AttributeManager,
  Viewport,
  _deepEqual as deepEqual
} from '@deck.gl/core';
import {transformMat4} from '@math.gl/core/vec4';
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

  initializeState(): void {}

  /** Projects a (preprojected) position to common space using the given viewport.
   * Used by CPUAggregators to convert packed position attributes to aggregation common space.
   */
  projectPositionFromAttribute(
    position: number[],
    viewport: Viewport = this.context.viewport
  ): [number, number, number] {
    // CPU callbacks outlive layer clones; use the current layer's projection props.
    const layer = this.getCurrentLayer()!;
    return layer.projectPosition(
      position,
      layer.context.viewport.preproject && layer.props.coordinateSystem !== 'cartesian'
        ? /* Preprojected attributes have already consumed the converter and model matrix */
          {
            viewport,
            autoOffset: false,
            coordinateSystem: 'cartesian',
            coordinateOrigin: [0, 0, 0],
            modelMatrix: null
          }
        : {viewport, autoOffset: false}
    );
  }

  /** Bound transformed Cartesian geometry using its bounding-box corners, without rewriting positions. */
  getBounds(): [number[], number[]] | null {
    const bounds = super.getBounds();
    const {viewport} = this.context;
    if (!bounds || !viewport.preproject || this.props.coordinateSystem !== 'cartesian')
      return bounds;
    // Both backends need bounds in packed coordinates, before viewport projection.
    // Transforming the box is conservative under rotation, but includes every transformed point.
    const result: [number[], number[]] = [Array(3).fill(Infinity), Array(3).fill(-Infinity)];
    for (let corner = 0; corner < 8; corner++) {
      const position = [0, 1, 2].map(axis => bounds[(corner >> axis) & 1][axis] ?? 0);
      position.push(1);
      if (this.props.modelMatrix) transformMat4(position, position, this.props.modelMatrix);
      for (let axis = 0; axis < 3; axis++) {
        const value = position[axis] + this.props.coordinateOrigin[axis];
        result[0][axis] = Math.min(result[0][axis], value);
        result[1][axis] = Math.max(result[1][axis], value);
      }
    }
    return result;
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
    if (
      this.context.viewport.preproject &&
      params.props.coordinateSystem === 'cartesian' &&
      (!deepEqual(params.props.modelMatrix, params.oldProps.modelMatrix, 1) ||
        !deepEqual(params.props.coordinateOrigin, params.oldProps.coordinateOrigin, 1))
    ) {
      // Projection props affect binning and bounds, but both backends retain the packed positions.
      this.onAttributeChange('positions');
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
    if (
      this.context.viewport.preproject &&
      this.props.coordinateSystem !== 'cartesian' &&
      shaderModuleProps.project
    ) {
      // Grid/hexagon/contour aggregation uses a separate precision viewport.
      // Preprojected inputs already consumed the layer matrix; Cartesian inputs retain their transforms.
      shaderModuleProps = {
        ...shaderModuleProps,
        project: {
          ...shaderModuleProps.project,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          modelMatrix: null,
          autoWrapLongitude: false
        }
      };
    }
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
