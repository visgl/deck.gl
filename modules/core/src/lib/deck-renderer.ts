// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {Framebuffer} from '@luma.gl/core';
import debug from '../debug/index';
import DrawLayersPass from '../passes/draw-layers-pass';
import PickLayersPass from '../passes/pick-layers-pass';

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

  private renderCount: number;
  private _needsRedraw: string | false;
  private renderBuffers: Framebuffer[];
  private lastPostProcessEffect: string | null;

  constructor(device: Device) {
    this.device = device;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(device);
    this.pickLayersPass = new PickLayersPass(device);
    this.renderCount = 0;
    this._needsRedraw = 'Initial render';
    this.renderBuffers = [];
    this.lastPostProcessEffect = null;
  }

  setProps(props: {layerFilter: LayerFilter; drawPickingColors: boolean}) {
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
    layerFilter?: LayerFilter;
    clearStack?: boolean;
    clearCanvas?: boolean;
  }) {
    if (!opts.viewports.length) {
      return;
    }

    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;

    const renderOpts: LayersPassRenderOptions = {
      layerFilter: this.layerFilter,
      isPicking: this.drawPickingColors,
      ...opts
    };

    if (renderOpts.effects) {
      this._preRender(renderOpts.effects, renderOpts);
    }

    const outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : renderOpts.target;
    if (this.lastPostProcessEffect) {
      renderOpts.clearColor = [0, 0, 0, 0];
      renderOpts.clearCanvas = true;
    }
    const renderStats = layerPass.render({...renderOpts, target: outputBuffer});

    if (renderOpts.effects) {
      this._postRender(renderOpts.effects, renderOpts);
    }

    this.renderCount++;

    debug(TRACE_RENDER_LAYERS, this, renderStats, opts);
  }

  needsRedraw(opts: {clearRedrawFlags: boolean} = {clearRedrawFlags: false}): string | false {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  finalize() {
    const {renderBuffers} = this;
    for (const buffer of renderBuffers) {
      buffer.delete();
    }
    renderBuffers.length = 0;
  }

  private _preRender(effects: Effect[], opts: LayersPassRenderOptions) {
    this.lastPostProcessEffect = null;
    opts.preRenderStats = opts.preRenderStats || {};

    for (const effect of effects) {
      opts.preRenderStats[effect.id] = effect.preRender(opts);
      if (effect.postRender) {
        this.lastPostProcessEffect = effect.id;
      }
    }

    if (this.lastPostProcessEffect) {
      this._resizeRenderBuffers();
    }
  }

  private _resizeRenderBuffers() {
    const {renderBuffers} = this;
    const size = this.device.canvasContext!.getDrawingBufferSize();
    if (renderBuffers.length === 0) {
      [0, 1].map(i => {
        const texture = this.device.createTexture({
          sampler: {minFilter: 'linear', magFilter: 'linear'}
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
    const params: PostRenderOptions = {
      ...opts,
      inputBuffer: renderBuffers[0],
      swapBuffer: renderBuffers[1]
    };
    for (const effect of effects) {
      if (effect.postRender) {
        // If not the last post processing effect, unset the target so that
        // it only renders between the swap buffers
        params.target = effect.id === this.lastPostProcessEffect ? opts.target : undefined;
        const buffer = effect.postRender(params);
        // Buffer cannot be null if target is unset
        params.inputBuffer = buffer!;
        params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
      }
    }
  }
}
