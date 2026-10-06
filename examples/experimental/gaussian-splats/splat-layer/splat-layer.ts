// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  type DefaultProps,
  type LayerProps,
  type UpdateParameters,
  type Viewport,
  type Effect,
  type PreRenderOptions
} from '@deck.gl/core';
import type {RenderPass} from '@luma.gl/core';
import type {SplatHierarchyView} from '@luma.gl/splats';
import {Matrix4} from '@math.gl/core';
import {RADScene, type SplatLayerStatus} from './rad-scene';

export type {SplatLayerStatus} from './rad-scene';

/** Experimental RAD layer properties, in addition to normal deck layer visibility and opacity. */
export type SplatLayerProps = Omit<LayerProps, 'data'> & {
  /** RAD URL or Blob. It is range-loaded by the layer, not fetched as a deck table. */
  data: string | Blob;
  /** Maximum selected original source rows. Defaults to two million. */
  maxActiveSplats?: number;
  /** Steady resident source-row budget, with active-capacity headroom during refinement. */
  maxResidentSplats?: number;
  /** Parallel page requests per admission batch. Defaults to eight. */
  maxConcurrentLoads?: number;
  /** Reports loading, refinement, budget, and error state without exposing the renderer. */
  onStatusChange?: (status: SplatLayerStatus) => void;
};

const defaultProps: DefaultProps<SplatLayerProps> = {
  data: {type: 'data', value: '', async: false},
  maxActiveSplats: {type: 'number', min: 1, value: 2_000_000},
  maxResidentSplats: {type: 'number', min: 1, value: 8_000_000},
  maxConcurrentLoads: {type: 'number', min: 1, value: 8},
  onStatusChange: {type: 'function', value: () => {}, optional: true}
};

/**
 * Prototype RAD layer using deck's WebGPU device, viewport, render pass, and redraw lifecycle.
 * Supports a single Cartesian view. Picking, geographic coordinates, and extensions are not yet supported.
 */
export default class SplatLayer extends Layer<Required<SplatLayerProps>> {
  static layerName = 'SplatLayer';
  static defaultProps = defaultProps;
  declare state: {scene?: RADScene; preparedViewportId?: string};

  initializeState(): void {
    if (this.context.device.type !== 'webgpu') throw new Error('SplatLayer requires WebGPU.');
    this.context.deck?._addDefaultEffect(new SplatPreparationEffect());
  }

  /** Source URLs are not deck attribute tables; the renderer owns indirect instance counts. */
  getNumInstances(): number {
    return 0;
  }

  updateState({props, oldProps}: UpdateParameters<this>): void {
    if (
      props.pickable ||
      props.extensions.length ||
      !['default', 'cartesian'].includes(props.coordinateSystem)
    ) {
      throw new Error(
        'Prototype SplatLayer supports Cartesian drawing without picking or extensions.'
      );
    }
    if (
      !this.state.scene ||
      props.data !== oldProps.data ||
      props.maxActiveSplats !== oldProps.maxActiveSplats ||
      props.maxResidentSplats !== oldProps.maxResidentSplats ||
      props.maxConcurrentLoads !== oldProps.maxConcurrentLoads
    ) {
      this.state.scene?.destroy();
      this.state.scene = undefined;
      if (props.data) {
        this.state.scene = new RADScene(this.context.device, {
          data: props.data,
          maxActiveSplats: props.maxActiveSplats,
          maxResidentSplats: props.maxResidentSplats,
          maxConcurrentLoads: props.maxConcurrentLoads,
          onChange: () => this.getCurrentLayer()?.setNeedsRedraw(),
          onStatus: status => this.getCurrentLayer()?.props.onStatusChange?.(status),
          onError: error => this.getCurrentLayer()?.raiseError(error, 'loading RAD source')
        });
      }
    }
  }

  finalizeState(): void {
    this.state.scene?.destroy();
    super.finalizeState(this.context);
  }

  /** Called by the automatically registered effect before deck opens a render pass. */
  prepare(viewport: Viewport, pixelRatio: number): void {
    if (viewport.isGeospatial)
      throw new Error('Prototype SplatLayer requires a Cartesian viewport.');
    const modelMatrix = new Matrix4().translate(this.props.coordinateOrigin);
    if (this.props.modelMatrix) modelMatrix.multiplyRight(this.props.modelMatrix);
    const cpuStart = performance.now();
    this.state.scene?.update(
      getSplatHierarchyView(viewport, modelMatrix, pixelRatio),
      this.props.opacity,
      performance.now()
    );
    const prepareStart = performance.now();
    const encoded = this.state.scene?.renderer.prepare(this.context.device.commandEncoder);
    if (encoded && new URLSearchParams(location.search).has('diagnostic')) {
      console.info(
        'COIT_CPU',
        JSON.stringify({
          scene: prepareStart - cpuStart,
          prepare: performance.now() - prepareStart,
          active: this.state.scene?.renderer.stats.activeRowCount
        })
      );
    }
    this.state.preparedViewportId = viewport.id;
  }

  draw({renderPass}: {renderPass: RenderPass}): void {
    if (this.context.viewport.id === this.state.preparedViewportId) {
      this.state.scene?.renderer.draw(renderPass);
    }
  }
}

/** Converts deck's Cartesian camera to source-local coordinates and physical viewport pixels. */
export function getSplatHierarchyView(
  viewport: Viewport,
  modelMatrix: Matrix4,
  pixelRatio: number
): SplatHierarchyView {
  const cameraPosition = new Matrix4(modelMatrix)
    .invert()
    .transformAsPoint(viewport.cameraPosition);
  return {
    modelViewProjectionMatrix: new Matrix4(viewport.viewProjectionMatrix).multiplyRight(
      modelMatrix
    ),
    cameraPosition: [cameraPosition[0], cameraPosition[1], cameraPosition[2]],
    viewportSize: [
      Math.max(1, viewport.width * pixelRatio),
      Math.max(1, viewport.height * pixelRatio)
    ],
    verticalFieldOfView: 2 * Math.atan(1 / viewport.projectionMatrix[5]),
    // Use one viewport-relative falloff, with full priority through each edge midpoint.
    // Normalizing each axis separately avoids spending a portrait view's budget offscreen.
    foveation: {center: [0.5, 0.5], radius: 0.5, strength: 12}
  };
}

/** Internal compute hook; applications only add SplatLayer, not a companion effect. */
class SplatPreparationEffect implements Effect {
  id = 'splat-preparation';
  props = null;
  useInPicking = false;
  setup(): void {}
  cleanup(): void {}
  preRender({layers, viewports, isPicking, layerFilter, canvasContext}: PreRenderOptions): void {
    if (isPicking) return;
    for (const layer of layers) {
      if (!(layer instanceof SplatLayer) || !layer.props.visible) continue;
      const selected = viewports.filter(
        viewport =>
          !layerFilter ||
          layerFilter({
            layer,
            viewport,
            isPicking: false,
            renderPass: 'screen'
          })
      );
      if (selected.length > 1)
        throw new Error('Prototype SplatLayer supports one viewport per layer.');
      if (selected[0]) {
        layer.prepare(
          selected[0],
          (canvasContext || layer.context.device.canvasContext)?.cssToDeviceRatio() || 1
        );
      }
    }
  }
}
