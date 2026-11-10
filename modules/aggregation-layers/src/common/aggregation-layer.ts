// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {project, project32} from '@deck.gl/core';

import {
  CompositeLayer,
  LayerDataSource,
  LayerContext,
  LayerExtension,
  UpdateParameters,
  CompositeLayerProps,
  DefaultProps,
  Attribute,
  AttributeManager,
  Viewport,
  _deepEqual as deepEqual
} from '@deck.gl/core';
import {vec4TransformMat4 as transformMat4} from '@math.gl/core';
import type {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import type {Aggregator} from './aggregator/aggregator';
import {CPUAggregator} from './aggregator/cpu-aggregator/cpu-aggregator';
import type {GPUVector} from '@luma.gl/graph/gpu-data';

export type AggregationLayerProps<DataT> = CompositeLayerProps & {
  data: LayerDataSource<DataT>;
  /** Layer-owned aggregator instance. Omit to retain CPU/WebGL selection. */
  aggregator?: Aggregator | null;
  /** Borrowed GPU position column; requires a custom aggregator and bypasses accessors. */
  positions?: GPUVector | null;
  /** Borrowed scalar columns in channel order; required with positions. */
  weights?: readonly GPUVector[] | null;
  /** Bounds in input coordinates for GPU positions used by world-space binning. */
  dataBounds?: [number[], number[]] | null;
};

export default abstract class AggregationLayer<
  DataT,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<Required<AggregationLayerProps<DataT>> & ExtraPropsT> {
  static layerName = 'AggregationLayer';
  static defaultProps: DefaultProps<AggregationLayerProps<unknown>> = {
    aggregator: {type: 'object', value: null, optional: true},
    positions: {type: 'object', value: null, optional: true},
    weights: {type: 'array', value: null, optional: true, compare: 1},
    dataBounds: {type: 'array', value: null, optional: true, compare: 2}
  };

  /** Uses the column row count when positions bypass accessor generation. */
  override getNumInstances(): number {
    return this.props.positions && !Number.isFinite(this.props.numInstances)
      ? this.props.positions.length
      : super.getNumInstances();
  }

  /** GPU columns are forwarded directly to the aggregator, like ArcLayer's column path. */
  protected override _updateAttributes(): void {
    if (!this.props.positions) {
      super._updateAttributes();
      return;
    }
    const {positions, weights, aggregator, extensions} = this.props;
    if (aggregator?.requiresProjectedPositions && this.state.preproject) {
      throw new Error('GPU aggregation positions must use the custom view coordinate system');
    }
    if ((!aggregator && this.state.aggregatorType !== 'webgpu') || extensions.length || !weights) {
      throw new Error('GPU columns require a compatible aggregator, weights, and no extensions');
    }
    if (
      this.getNumInstances() > positions.length ||
      weights.length !== this.getAggregationChannelCount() ||
      weights.some(weight => weight.length !== positions.length)
    ) {
      throw new Error('GPU aggregation weights must match the channels and position length');
    }
    this.state.aggregator.setProps({positions, weights, pointCount: this.getNumInstances()});
    this.state.aggregator.update();
  }

  /** Include asynchronous aggregation metadata in the owning layer's loading state. */
  override get isLoaded(): boolean {
    return super.isLoaded && this.state?.aggregator?.isLoaded !== false;
  }

  /** Number of weight columns consumed by this layer. */
  protected getAggregationChannelCount(): number {
    return 1;
  }

  state!: {
    aggregatorType: string;
    aggregator: Aggregator;
  } & CompositeLayer['state'];

  /** Extension hooks affect input points; rendering effects only affect the cells. */
  protected getAggregationShaders() {
    const shaders = super.getShaders({modules: [project32]});
    return {
      ...shaders,
      plugins: shaders.plugins?.filter(
        plugin => !this.context.defaultShaderPlugins.includes(plugin)
      )
    };
  }

  /** Forwards extension uniforms to the GPU aggregation model as well as rendering models. */
  setShaderModuleProps(props: Record<string, any>): void {
    super.setShaderModuleProps(props);
    if (this.state?.aggregator && !(this.state.aggregator instanceof CPUAggregator)) {
      this.state.aggregator.setProps({shaderModuleProps: props});
    }
  }

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
      layer.state.preproject
        ? /* Preprojected attributes have already consumed the converter and model matrix */
          {
            viewport,
            autoOffset: false,
            sourceCrs: layer.internalState!.packedCrs!,
            coordinateOrigin: [0, 0, 0],
            modelMatrix: null
          }
        : {viewport, autoOffset: false}
    );
  }

  /** Bound transformed Cartesian geometry using its bounding-box corners, without rewriting positions. */
  getBounds(): [number[], number[]] | null {
    const bounds = this.props.dataBounds || super.getBounds();
    const {viewport} = this.context;
    if (!bounds || !project.isCustomProjection(viewport)) return bounds;
    // Attribute-derived bounds are already packed; explicit bounds describe source coordinates.
    if (this.state.preproject && !this.props.dataBounds) return bounds;
    // Both backends need bounds in packed coordinates, before viewport projection.
    // Transforming the box is conservative under rotation, but includes every transformed point.
    const result: [number[], number[]] = [Array(3).fill(Infinity), Array(3).fill(-Infinity)];
    for (let corner = 0; corner < 8; corner++) {
      const position = [0, 1, 2].map(axis => bounds[(corner >> axis) & 1][axis] ?? 0);
      position.push(1);
      if (this.props.modelMatrix) transformMat4(position, position, this.props.modelMatrix);
      for (let axis = 0; axis < 3; axis++) position[axis] += this.props.coordinateOrigin[axis];
      const packedPosition = this.state.preproject ? this.state.preproject(position) : position;
      for (let axis = 0; axis < 3; axis++) {
        const value = packedPosition[axis];
        result[0][axis] = Math.min(result[0][axis], value);
        result[1][axis] = Math.max(result[1][axis], value);
      }
    }
    return result;
  }

  // Extend Layer.updateState to update the Aggregator instance
  // returns true if aggregator is changed
  updateState(params: UpdateParameters<this>): boolean {
    if (this.props.aggregator?.supportsExtensions === false && this.props.extensions.length) {
      throw new Error('The supplied aggregator does not support shader extensions');
    }
    super.updateState(params);
    if (this.props.weights && !this.props.positions) {
      throw new Error('GPU aggregation weights require positions');
    }
    if (
      params.props.positions !== params.oldProps.positions ||
      params.props.weights !== params.oldProps.weights ||
      params.props.numInstances !== params.oldProps.numInstances
    ) {
      this.state.aggregator?.setNeedsUpdate();
      if (!params.props.positions) this.getAttributeManager()?.invalidateAll();
    }

    const aggregatorType = this.props.aggregator ? 'custom' : this.getAggregatorType();
    if (
      params.changeFlags.extensionsChanged ||
      this.state.aggregatorType !== aggregatorType ||
      params.props.aggregator !== params.oldProps.aggregator
    ) {
      const aggregator = this.props.aggregator || this.createAggregator(aggregatorType);
      if (aggregator !== this.state.aggregator) {
        this.state.aggregator?.destroy();
        aggregator.initialize?.(this.context.device);
      } else {
        // Extension changes refresh the supplied instance without destroying it.
        aggregator.setNeedsUpdate();
      }
      aggregator.setProps({
        onError: error => this.getCurrentLayer()?.raiseError(error, 'aggregation'),
        onNeedsRedraw: () => this.getCurrentLayer()?.setNeedsRedraw(),
        attributes: this.getAttributeManager()?.attributes,
        positions: this.props.positions,
        weights: this.props.weights
      });
      this.setState({aggregator, aggregatorType});
      return true;
    }
    if (this.state.aggregator && !(this.state.aggregator instanceof CPUAggregator)) {
      // Extension uniforms affect binning even when no input attributes change.
      for (const extension of params.props.extensions) {
        const {defaultProps} = extension.constructor as typeof LayerExtension;
        const uniformPropsChanged = Object.entries(defaultProps).some(([key, definition]) => {
          // Accessor changes are handled by attributes; callbacks do not affect GPU uniforms.
          if (
            definition &&
            typeof definition === 'object' &&
            'type' in definition &&
            (definition.type === 'accessor' || definition.type === 'function')
          ) {
            return false;
          }
          return !deepEqual(params.props[key], params.oldProps[key], 2);
        });
        if (uniformPropsChanged) {
          this.state.aggregator.setNeedsUpdate();
          break;
        }
      }
    }
    if (
      project.isCustomProjection(this.context.viewport) &&
      (this.props.positions || !this.state.preproject) &&
      (!deepEqual(params.props.modelMatrix, params.oldProps.modelMatrix, 1) ||
        !deepEqual(params.props.coordinateOrigin, params.oldProps.coordinateOrigin, 1) ||
        (this.props.positions && params.changeFlags.projectionChanged))
    ) {
      // GPU columns bypass the position attribute callback, including preprojection changes.
      this.onAttributeChange('positions');
    }
    return false;
  }

  // Override Layer.finalizeState to dispose the Aggregator instance
  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this.state.aggregator?.destroy();
  }

  // Override Layer.updateAttributes to update the aggregator
  protected updateAttributes(changedAttributes: {[id: string]: Attribute}) {
    const {aggregator} = this.state;
    aggregator.setProps({
      attributes: changedAttributes,
      positions: null,
      weights: null
    });

    for (const id in changedAttributes) {
      this.onAttributeChange(id);
      if (!(aggregator instanceof CPUAggregator)) {
        const {accessor} = changedAttributes[id].settings;
        const accessors = Array.isArray(accessor) ? accessor : [accessor];
        // Extension inputs can affect every bin, beyond the layer's position/weight inputs.
        if (
          this.props.extensions.some(extension => {
            const {defaultProps} = extension.constructor as typeof LayerExtension;
            return accessors.some(name => typeof name === 'string' && name in defaultProps);
          })
        ) {
          aggregator.setNeedsUpdate();
        }
      }
    }

    // In aggregator.update() the aggregator allocates the buffers to store its output
    // These buffers will be exposed by aggregator.getResults() and passed to the sublayers
    // Therefore update() must be called before renderLayers()
    // CPUAggregator's output is populated right here in update()
    // GPUAggregator's output is pre-allocated and populated in preDraw(), see comments below
    aggregator.update();
  }

  draw({shaderModuleProps}) {
    // Aggregators can also be drawn directly, without a LayersPass.
    if (shaderModuleProps.project && !shaderModuleProps.project.sizeScale) {
      shaderModuleProps = {
        ...shaderModuleProps,
        project: {
          ...shaderModuleProps.project,
          sizeScaleTransform: (this.context.viewport as CustomProjectionViewport)
            .sizeScaleTransform,
          sizeScale: this.context.layerManager.projectionScaleResources.get(
            // Shader variants follow the layer's view, not the aggregator's
            // temporary Cartesian precision viewport.
            this.context.viewport
          )
        }
      };
    }
    // GPU aggregation needs `shaderModuleProps` for projection/filter uniforms which are only accessible at draw time
    // GPUAggregator's Buffers are pre-allocated during `update()` and passed down to the sublayer attributes in renderLayers()
    // Although the Buffers have been bound to the sublayer's Model, their content are not populated yet
    // GPUAggregator.preDraw() is called in the draw cycle here right before Buffers are used by sublayer.draw()
    const {aggregator} = this.state;
    if (
      project.isCustomProjection(this.context.viewport) &&
      this.state.preproject &&
      !this.props.positions &&
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
