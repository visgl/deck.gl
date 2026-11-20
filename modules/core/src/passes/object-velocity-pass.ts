// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {Framebuffer, Parameters} from '@luma.gl/core';
import {Matrix4} from '@math.gl/core';
import LayersPass from './layers-pass';
import {PROJECTION_MODE} from '../shaderlib/project/constants';
import type {LayersPassRenderOptions} from './layers-pass';
import type Layer from '../lib/layer';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type MotionVectors from '../lib/motion-vectors';
import {getUniformsFromViewport} from '../shaderlib/project/viewport-uniforms';
import {getClipFromCommon, getLayerMotionDelta, type LayerTransform} from './temporal-utils';

type History = {matrix: Matrix4; transforms: Map<string, LayerTransform>};

/** Re-rasterizes opted-in geometry against the scene depth without modifying it. */
export default class ObjectVelocityPass extends LayersPass {
  private framebuffer: Framebuffer | null = null;
  private history = new Map<string, History>();
  private drawn = new Set<MotionVectors>();
  private owned = new Set<MotionVectors>();
  private targetId = '';
  private resolveSceneIndices = false;
  private currentViewport!: Viewport;
  private nextTransforms = new Map<string, LayerTransform>();

  /** Clears per-viewport transform history after a cut. */
  reset(): void {
    this.history.clear();
  }

  /** Returns null without allocating or drawing when no eligible layer is visible. */
  renderVelocity(options: LayersPassRenderOptions): Texture | null {
    const frame = options.temporal!;
    this.targetId = frame.targetId;
    if (
      this.device.type !== 'webgpu' ||
      !frame.depthTexture ||
      options.viewports.some(
        viewport =>
          viewport.projectionMode === PROJECTION_MODE.GLOBE ||
          viewport.projectionMode === PROJECTION_MODE.CUSTOM_GEOSPATIAL
      )
    ) {
      this.release();
      return null;
    }
    const candidates = options.viewports.some(viewport =>
      super
        ._getDrawLayerParams(viewport, options, true)
        .some((params, index) => params.shouldDrawLayer && options.layers[index].isDrawable)
    );
    if (!candidates) {
      this.release();
      return null;
    }
    if (frame.reset) {
      this.reset();
      for (const layer of options.layers) {
        if (this.shouldDrawLayer(layer)) (layer.state.motionVectors as MotionVectors).reset();
      }
    }
    const depth = frame.depthTexture;
    // Never resize this framebuffer: that would resize/destroy the borrowed scene depth.
    if (
      this.framebuffer?.depthStencilAttachment?.texture !== depth ||
      this.framebuffer.width !== frame.renderSize[0] ||
      this.framebuffer.height !== frame.renderSize[1]
    ) {
      this.framebuffer?.destroy();
      const color = this.device.createTexture({
        width: frame.renderSize[0],
        height: frame.renderSize[1],
        format: this.device.preferredColorFormat,
        usage: Texture.RENDER | Texture.SAMPLE
      });
      this.framebuffer = this.device.createFramebuffer({
        width: frame.renderSize[0],
        height: frame.renderSize[1],
        colorAttachments: [color],
        depthStencilAttachment: depth
      });
      this.framebuffer.attachResource(color);
    }
    this.drawn.clear();
    const nextHistory = new Map<string, History>();
    let clearColor = true;
    for (const viewport of options.viewports) {
      this.currentViewport = viewport;
      this.nextTransforms = new Map();
      super._render({
        ...options,
        pass: 'object-velocity',
        layerFilter: options.layerFilter
          ? context => options.layerFilter!({...context, renderPass: options.pass})
          : options.layerFilter,
        target: this.framebuffer,
        viewports: [viewport],
        // View clears would erase the borrowed depth attachment.
        views: Object.fromEntries(
          Object.entries(options.views || {}).map(([id, view]) => [
            id,
            {...view, props: {...view.props, clear: false}} as View
          ])
        ),
        clearStack: clearColor ? options.clearStack : false,
        clearCanvas: false,
        clearColor: clearColor ? [0, 0, 0, 0] : undefined
      });
      clearColor = false;
      nextHistory.set(viewport.id, {
        matrix: new Matrix4(viewport.viewProjectionMatrix),
        transforms: this.nextTransforms
      });
    }
    this.history = nextHistory;
    this.release(this.drawn);
    for (const motion of this.drawn) motion.copy();
    this.device.submit();
    return this.drawn.size ? this.framebuffer.colorAttachments[0].texture : null;
  }

  protected _getDrawLayerParams(
    viewport: Viewport,
    options: LayersPassRenderOptions,
    evaluateOnly = false
  ) {
    // Resolve polygon offsets using the same visible scene layer indices.
    this.resolveSceneIndices = true;
    const params = super._getDrawLayerParams(viewport, options, evaluateOnly);
    this.resolveSceneIndices = false;
    params.forEach((entry, index) => {
      entry.shouldDrawLayer &&= this.shouldDrawLayer(options.layers[index]);
    });
    return params;
  }

  shouldDrawLayer(layer: Layer): boolean {
    if (this.resolveSceneIndices) {
      return layer.props.operation.includes('draw') || layer.props.operation.includes('terrain');
    }
    const motion = layer.state?.motionVectors as MotionVectors | undefined;
    return Boolean(
      (layer.props as {_motionVectors?: boolean})._motionVectors &&
        layer.props.opacity >= 1 &&
        !layer.props.extensions.length &&
        motion &&
        (!motion.targetId || motion.targetId === this.targetId) &&
        layer.props.operation.includes('draw')
    );
  }

  protected getShaderModuleProps(layer: Layer): any {
    const resolving = this.resolveSceneIndices;
    this.resolveSceneIndices = false;
    const eligible = this.shouldDrawLayer(layer);
    this.resolveSceneIndices = resolving;
    if (!eligible) return null;
    const viewport = this.currentViewport;
    const motion = layer.state.motionVectors as MotionVectors;
    motion.targetId = this.targetId;
    this.drawn.add(motion);
    this.owned.add(motion);
    const transform: LayerTransform = {
      coordinateSystem: layer.props.coordinateSystem,
      coordinateOrigin: [...layer.props.coordinateOrigin],
      modelMatrix: new Matrix4(layer.props.modelMatrix || undefined)
    };
    const previous = this.history.get(viewport.id);
    const uniforms = getUniformsFromViewport({viewport, ...transform});
    this.nextTransforms.set(layer.id, transform);
    return {
      velocity: {
        isActive: 1,
        currentClipFromCommon: getClipFromCommon(
          viewport.viewProjectionMatrix,
          uniforms.commonOrigin
        ),
        previousClipFromCommon: getClipFromCommon(
          previous?.matrix || viewport.viewProjectionMatrix,
          uniforms.commonOrigin,
          getLayerMotionDelta(viewport, transform, previous?.transforms.get(layer.id))
        )
      }
    };
  }

  protected getLayerParameters(layer: Layer): Parameters {
    return {
      ...layer.props.parameters,
      blend: false,
      depthWriteEnabled: false,
      depthCompare: 'less-equal'
    };
  }

  /** Releases snapshots no longer drawn by this target so another target can claim them. */
  release(retained: ReadonlySet<MotionVectors> = new Set()): void {
    if (!retained.size) this.history.clear();
    for (const motion of this.owned) {
      if (!retained.has(motion)) {
        if (motion.targetId === this.targetId) {
          motion.targetId = null;
          motion.reset();
        }
        this.owned.delete(motion);
      }
    }
  }

  /** Releases owned color resources and history; the scene owns depth. */
  delete(): void {
    this.release();
    this.framebuffer?.destroy();
    this.framebuffer = null;
    this.reset();
  }
}
