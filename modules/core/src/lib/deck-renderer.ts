// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {CanvasContext, Device, PresentationContext} from '@luma.gl/core';
import {Framebuffer, Texture} from '@luma.gl/core';
import type {TemporalProps, TemporalFrame} from './temporal';
import VelocityPass from '../passes/velocity-pass';
import ObjectVelocityPass from '../passes/object-velocity-pass';
import {
  getTemporalJitter,
  getJitterPhaseCount,
  findTemporalViewportOverlap
} from '../passes/temporal-utils';
import debug from '../debug/index';
import log from '../utils/log';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';
import type {RenderStats} from '../passes/layers-pass';
import type {Stats} from '@probe.gl/stats';
import type Layer from './layer';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type {Effect, PostRenderOptions} from './effect';
import type {LayersPassRenderOptions, FilterContext} from '../passes/layers-pass';

const TRACE_RENDER_LAYERS = 'deckRenderer.renderLayers';

type LayerFilter = ((context: FilterContext) => boolean) | null;

type TargetState = {
  id: string;
  frameIndex: number;
  key: string;
  buffers: Framebuffer[];
  temporalBuffers: boolean;
  velocityPass: VelocityPass | null;
  objectVelocityPass: ObjectVelocityPass | null;
  lastUsed: number;
  overlapWarned: boolean;
};

export default class DeckRenderer {
  device: Device;
  layerFilter: LayerFilter;
  drawPickingColors: boolean;
  drawLayersPass: DrawLayersPass;
  pickLayersPass: PickLayersPass;
  stats?: Stats;

  private temporalProps: TemporalProps | null = null;
  private temporalPropsSource: TemporalProps | null = null;
  private targetStates = new Map<object, TargetState>();
  private nextTargetId = 0;
  private targetState!: TargetState;
  private renderCount: number;
  private _needsRedraw: string | false;
  private renderBuffers: Framebuffer[];
  private lastPostProcessEffect: string | null;

  constructor(device: Device, opts: {stats?: Stats} = {}) {
    this.device = device;
    this.stats = opts.stats;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(device);
    this.pickLayersPass = new PickLayersPass(device);
    this.renderCount = 0;
    this._needsRedraw = 'Initial render';
    this.renderBuffers = [];
    this.lastPostProcessEffect = null;
  }

  setProps(props: {
    layerFilter: LayerFilter;
    drawPickingColors: boolean;
    _temporal?: TemporalProps | null;
  }) {
    const temporal = props._temporal ?? null;
    if (
      temporal !== this.temporalPropsSource ||
      temporal?.jitter !== this.temporalProps?.jitter ||
      temporal?.velocity !== this.temporalProps?.velocity ||
      temporal?.objectVelocity !== this.temporalProps?.objectVelocity ||
      temporal?.renderScale !== this.temporalProps?.renderScale
    ) {
      this.temporalPropsSource = temporal;
      this.temporalProps = temporal && {...temporal};
      for (const state of this.targetStates.values()) {
        state.frameIndex = 0;
        state.key = '';
        state.velocityPass?.reset();
        state.objectVelocityPass?.reset();
        if (!temporal || temporal.velocity === false || temporal.objectVelocity === false) {
          state.objectVelocityPass?.release();
        }
      }
      if (!temporal) {
        for (const state of this.targetStates.values()) this._deleteTarget(state);
        this.targetStates.clear();
      }
      this._needsRedraw = '_temporal changed';
    }
    if (this.layerFilter !== props.layerFilter) {
      this.layerFilter = props.layerFilter;
      this._needsRedraw = 'layerFilter changed';
    }

    if (this.drawPickingColors !== props.drawPickingColors) {
      this.drawPickingColors = props.drawPickingColors;
      this._needsRedraw = 'drawPickingColors changed';
    }
  }

  renderLayers(opts: {
    pass: string;
    layers: Layer[];
    viewports: Viewport[];
    views: {[viewId: string]: View};
    onViewportActive: (viewport: Viewport) => void;
    effects: Effect[];
    target?: Framebuffer | null;
    canvasContext?: CanvasContext | PresentationContext;
    layerFilter?: LayerFilter;
    isPicking?: boolean;
    shaderModuleProps?: LayersPassRenderOptions['shaderModuleProps'];
    clearStack?: boolean;
    clearCanvas?: boolean;
  }) {
    this.targetState = undefined!;
    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;

    const renderOpts: LayersPassRenderOptions = {
      layerFilter: this.layerFilter,
      isPicking: this.drawPickingColors,
      ...opts
    };

    this.lastPostProcessEffect =
      opts.effects?.filter(effect => effect.postRender).at(-1)?.id ?? null;
    if (
      this.temporalProps &&
      !this.drawPickingColors &&
      !renderOpts.isPicking &&
      this.lastPostProcessEffect &&
      opts.viewports.length
    ) {
      this._selectTarget(
        opts.target || opts.canvasContext || this.device.canvasContext || this.device
      );
      this._prepareTemporalFrame(renderOpts);
    } else {
      const state =
        this.temporalProps &&
        this.targetStates.get(
          opts.target || opts.canvasContext || this.device.canvasContext || this.device
        );
      if (state) {
        state.key = '';
        if (!this.drawPickingColors && !renderOpts.isPicking) {
          state.objectVelocityPass?.release();
        }
      }
    }

    if (!opts.viewports.length) {
      const renderResult = layerPass.render(renderOpts);
      const renderStats = 'stats' in renderResult ? renderResult.stats : renderResult;
      this._updateStats(renderStats);
      return;
    }

    if (renderOpts.effects) {
      this._preRender(renderOpts.effects, renderOpts);
    }

    const outputBuffer = this.lastPostProcessEffect
      ? (this.targetState?.buffers || this.renderBuffers)[0]
      : renderOpts.target;

    if (this.lastPostProcessEffect) {
      renderOpts.clearColor = [0, 0, 0, 0];
      renderOpts.clearCanvas = true;
    }
    const renderResult = layerPass.render({...renderOpts, target: outputBuffer});
    const renderStats = 'stats' in renderResult ? renderResult.stats : renderResult;

    if (renderOpts.temporal) {
      renderOpts.temporal.depthTexture = outputBuffer?.depthStencilAttachment?.texture ?? null;
      if (this.temporalProps?.velocity !== false) {
        let objectTexture: Texture | null = null;
        if (this.temporalProps?.objectVelocity !== false && this.device.type === 'webgpu') {
          this.targetState.objectVelocityPass ||= new ObjectVelocityPass(this.device);
          objectTexture = this.targetState.objectVelocityPass.renderVelocity(renderOpts);
        }
        renderOpts.temporal.objectVelocity = Boolean(objectTexture);
        this.targetState.velocityPass ||= new VelocityPass(this.device);
        renderOpts.temporal.velocityTexture = this.targetState.velocityPass.render(
          renderOpts.temporal,
          opts.viewports,
          (opts.canvasContext || this.device.canvasContext!).cssToDeviceRatio() *
            renderOpts.temporal.renderScale,
          objectTexture
        );
      }
      this.targetState.frameIndex++;
    }

    if (renderOpts.effects) {
      if (this.lastPostProcessEffect) {
        // Interleaved basemap rendering requires clearCanvas to be false
        renderOpts.clearCanvas = opts.clearCanvas === undefined ? true : opts.clearCanvas;
      }

      this._postRender(renderOpts.effects, renderOpts);
    }

    this.renderCount++;

    debug(TRACE_RENDER_LAYERS, this, renderStats, opts);
    this._updateStats(renderStats);
  }

  needsRedraw(opts: {clearRedrawFlags: boolean} = {clearRedrawFlags: false}): string | false {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  finalize() {
    for (const state of this.targetStates.values()) this._deleteTarget(state);
    this.targetStates.clear();
    const {renderBuffers} = this;
    for (const buffer of renderBuffers) {
      buffer.delete();
    }
    renderBuffers.length = 0;
  }

  private _deleteTarget(state: TargetState): void {
    state.velocityPass?.delete();
    state.objectVelocityPass?.delete();
    for (const buffer of state.buffers) buffer.destroy();
    state.buffers.length = 0;
  }

  private _selectTarget(target: object): void {
    for (const [key, state] of this.targetStates) {
      if (this.renderCount - state.lastUsed > 120) {
        this._deleteTarget(state);
        this.targetStates.delete(key);
      }
    }
    let state = this.targetStates.get(target);
    if (!state) {
      state = {
        id: `temporal-target-${this.nextTargetId++}`,
        frameIndex: 0,
        key: '',
        buffers: this.targetStates.size ? [] : this.renderBuffers,
        temporalBuffers: false,
        velocityPass: null,
        objectVelocityPass: null,
        lastUsed: this.renderCount,
        overlapWarned: false
      };
      if (!this.targetStates.size) this.renderBuffers = [];
      this.targetStates.set(target, state);
    }
    state.lastUsed = this.renderCount;
    this.targetState = state;
  }

  private _updateStats(source: RenderStats[]) {
    if (!this.stats) return;
    let layersCount = 0;
    for (const {visibleCount} of source) {
      layersCount += visibleCount;
    }
    this.stats.get('Layers rendered').addCount(layersCount);
  }

  private _preRender(effects: Effect[], opts: LayersPassRenderOptions) {
    opts.preRenderStats = opts.preRenderStats || {};

    for (const effect of effects) {
      opts.preRenderStats[effect.id] = effect.preRender(opts);
      if (effect.postRender) {
        this.lastPostProcessEffect = effect.id;
      }
    }

    if (this.lastPostProcessEffect) {
      this._resizeRenderBuffers(opts.canvasContext, opts.temporal);
    }
  }

  private _prepareTemporalFrame(opts: LayersPassRenderOptions) {
    const canvasContext = opts.canvasContext || this.device.canvasContext!;
    // An explicit target (the `_framebuffer` prop or a presentation target) sets the output size.
    const outputSize: [number, number] = opts.target
      ? [opts.target.width, opts.target.height]
      : canvasContext.getDrawingBufferSize();
    const requestedScale = this.temporalProps?.renderScale ?? 1;
    const renderScale =
      Number.isFinite(requestedScale) && requestedScale > 0 ? Math.min(1, requestedScale) : 1;
    const renderSize: [number, number] = [
      // Rounded up, so that a viewport that fills the canvas stays inside the target.
      Math.max(1, Math.ceil(outputSize[0] * renderScale)),
      Math.max(1, Math.ceil(outputSize[1] * renderScale))
    ];
    const overlap = findTemporalViewportOverlap(
      opts.viewports,
      canvasContext.cssToDeviceRatio() * renderScale,
      renderSize
    );
    if (overlap) {
      if (!this.targetState.overlapWarned) {
        log.warn(`Temporal views overlap: ${overlap[0]}, ${overlap[1]}`)();
        this.targetState.overlapWarned = true;
      }
      this.targetState.key = '';
      this.targetState.frameIndex = 0;
      this.targetState.objectVelocityPass?.release();
      opts.temporal = undefined;
      return;
    }
    const key = JSON.stringify([
      outputSize,
      renderSize,
      renderScale,
      opts.viewports.map(({id, x, y, width, height}) => [id, x, y, width, height])
    ]);
    if (key !== this.targetState.key) this.targetState.frameIndex = 0;
    const phaseCount = getJitterPhaseCount(outputSize[0], renderSize[0]);
    const jitter: [number, number] =
      this.temporalProps?.jitter === false
        ? [0, 0]
        : getTemporalJitter(this.targetState.frameIndex, phaseCount);
    const jitterClip: [number, number] = [
      (2 * jitter[0]) / renderSize[0],
      (-2 * jitter[1]) / renderSize[1]
    ];
    opts.temporal = {
      targetId: this.targetState.id,
      objectVelocity: false,
      frameIndex: this.targetState.frameIndex,
      renderScale,
      renderSize,
      outputSize,
      jitter,
      jitterClip,
      phaseCount,
      depthTexture: null,
      velocityTexture: null,
      reset: key !== this.targetState.key
    };
    this.targetState.key = key;
    // The layers passes read `opts.temporal`. Each scene pass applies the jitter and the render
    // scale itself, so auxiliary passes (shadow, mask, terrain, collision, picking) stay as before.
  }

  private _resizeRenderBuffers(
    canvasContext = this.device.canvasContext!,
    temporal?: TemporalFrame
  ) {
    const renderBuffers = this.targetState?.buffers || this.renderBuffers;
    const size = temporal?.renderSize ?? canvasContext.getDrawingBufferSize();
    if (temporal) {
      const reusable =
        renderBuffers.length === 2 &&
        renderBuffers.every(buffer => {
          const depth = buffer.depthStencilAttachment?.texture;
          return (
            depth instanceof Texture &&
            depth.samples === 1 &&
            Boolean(depth.props.usage & Texture.SAMPLE)
          );
        });
      if (!reusable) {
        for (const buffer of renderBuffers) buffer.destroy();
        renderBuffers.length = 0;
        for (let i = 0; i < 2; i++) {
          const depth = this.device.createTexture({
            width: size[0],
            height: size[1],
            format:
              this.device.preferredDepthFormat === 'depth16'
                ? 'depth16unorm'
                : this.device.preferredDepthFormat,
            usage: Texture.SAMPLE | Texture.RENDER
          });
          const color = this.device.createTexture({
            width: size[0],
            height: size[1],
            sampler: {minFilter: 'linear', magFilter: 'linear'}
          });
          const buffer = this.device.createFramebuffer({
            id: `deck-renderbuffer-${i}`,
            width: size[0],
            height: size[1],
            colorAttachments: [color],
            depthStencilAttachment: depth
          });
          buffer.attachResource(color);
          buffer.attachResource(depth);
          renderBuffers.push(buffer);
        }
      }
      this.targetState.temporalBuffers = true;
    } else if (this.targetState?.temporalBuffers) {
      for (const buffer of renderBuffers) buffer.destroy();
      renderBuffers.length = 0;
      this.targetState.temporalBuffers = false;
    }
    const [width, height] = size;
    if (renderBuffers.length === 0) {
      [0, 1].map(i => {
        const texture = this.device.createTexture({
          sampler: {minFilter: 'linear', magFilter: 'linear'},
          width,
          height
        });
        renderBuffers.push(
          this.device.createFramebuffer({
            id: `deck-renderbuffer-${i}`,
            colorAttachments: [texture]
          })
        );
      });
    }
    for (const buffer of renderBuffers) {
      buffer.resize(size);
    }
  }

  private _postRender(effects: Effect[], opts: LayersPassRenderOptions) {
    const renderBuffers = this.targetState?.buffers || this.renderBuffers;
    const target = opts.target ?? opts.canvasContext?.getCurrentFramebuffer() ?? opts.target;
    const params: PostRenderOptions = {
      ...opts,
      inputBuffer: renderBuffers[0],
      swapBuffer: renderBuffers[1]
    };
    for (const effect of effects) {
      if (effect.postRender) {
        // If not the last post processing effect, unset the target so that
        // it only renders between the swap buffers
        params.target = effect.id === this.lastPostProcessEffect ? target : undefined;
        const buffer = effect.postRender(params);
        // Buffer cannot be null if target is unset
        params.inputBuffer = buffer!;
        params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
      }
    }
  }
}
