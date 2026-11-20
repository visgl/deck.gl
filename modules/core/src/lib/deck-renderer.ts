// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {CanvasContext, Device, PresentationContext} from '@luma.gl/core';
import {Framebuffer, Texture} from '@luma.gl/core';
import type {TemporalProps, TemporalFrame} from './temporal';
import VelocityPass from '../passes/velocity-pass';
import {getTemporalJitter, getJitterPhaseCount} from '../passes/temporal-utils';
import debug from '../debug/index';
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

export default class DeckRenderer {
  device: Device;
  layerFilter: LayerFilter;
  drawPickingColors: boolean;
  drawLayersPass: DrawLayersPass;
  pickLayersPass: PickLayersPass;
  stats?: Stats;

  private temporalProps: TemporalProps | null = null;
  private temporalPropsSource: TemporalProps | null = null;
  private temporalFrameIndex = 0;
  private temporalKey = '';
  private temporalBuffers = false;
  private velocityPass: VelocityPass | null = null;
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
      temporal?.renderScale !== this.temporalProps?.renderScale
    ) {
      this.temporalPropsSource = temporal;
      this.temporalProps = temporal && {...temporal};
      this.temporalFrameIndex = 0;
      this.temporalKey = '';
      this.velocityPass?.reset();
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
      this._prepareTemporalFrame(renderOpts);
    } else {
      this.temporalKey = '';
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

    const outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : renderOpts.target;

    if (this.lastPostProcessEffect) {
      renderOpts.clearColor = [0, 0, 0, 0];
      renderOpts.clearCanvas = true;
    }
    const renderResult = layerPass.render({...renderOpts, target: outputBuffer});
    const renderStats = 'stats' in renderResult ? renderResult.stats : renderResult;

    if (renderOpts.temporal) {
      renderOpts.temporal.depthTexture = outputBuffer?.depthStencilAttachment?.texture ?? null;
      if (this.temporalProps?.velocity !== false) {
        this.velocityPass ||= new VelocityPass(this.device);
        renderOpts.temporal.velocityTexture = this.velocityPass.render(
          renderOpts.temporal,
          opts.viewports,
          (opts.canvasContext || this.device.canvasContext!).cssToDeviceRatio() *
            renderOpts.temporal.renderScale
        );
      }
      this.temporalFrameIndex++;
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
    this.velocityPass?.delete();
    const {renderBuffers} = this;
    for (const buffer of renderBuffers) {
      buffer.delete();
    }
    renderBuffers.length = 0;
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
    const key = JSON.stringify([
      outputSize,
      renderSize,
      renderScale,
      opts.viewports.map(({id, x, y, width, height}) => [id, x, y, width, height])
    ]);
    const phaseCount = getJitterPhaseCount(outputSize[0], renderSize[0]);
    const jitter: [number, number] =
      this.temporalProps?.jitter === false
        ? [0, 0]
        : getTemporalJitter(this.temporalFrameIndex, phaseCount);
    const jitterClip: [number, number] = [
      (2 * jitter[0]) / renderSize[0],
      (-2 * jitter[1]) / renderSize[1]
    ];
    opts.temporal = {
      frameIndex: this.temporalFrameIndex,
      renderScale,
      renderSize,
      outputSize,
      jitter,
      jitterClip,
      phaseCount,
      depthTexture: null,
      velocityTexture: null,
      reset: key !== this.temporalKey
    };
    this.temporalKey = key;
    // The layers passes read `opts.temporal`. Each scene pass applies the jitter and the render
    // scale itself, so auxiliary passes (shadow, mask, terrain, collision, picking) stay as before.
  }

  private _resizeRenderBuffers(
    canvasContext = this.device.canvasContext!,
    temporal?: TemporalFrame
  ) {
    const {renderBuffers} = this;
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
      this.temporalBuffers = true;
    } else if (this.temporalBuffers) {
      for (const buffer of renderBuffers) buffer.destroy();
      renderBuffers.length = 0;
      this.temporalBuffers = false;
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
    const {renderBuffers} = this;
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
