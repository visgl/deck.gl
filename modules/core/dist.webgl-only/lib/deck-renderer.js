// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import debug from "../debug/index.js";
import DrawLayersPass from "../passes/draw-layers-pass.js";
import PickLayersPass from "../passes/pick-layers-pass.js";
const TRACE_RENDER_LAYERS = 'deckRenderer.renderLayers';
export default class DeckRenderer {
    constructor(device, opts = {}) {
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
    setProps(props) {
        if (this.layerFilter !== props.layerFilter) {
            this.layerFilter = props.layerFilter;
            this._needsRedraw = 'layerFilter changed';
        }
        if (this.drawPickingColors !== props.drawPickingColors) {
            this.drawPickingColors = props.drawPickingColors;
            this._needsRedraw = 'drawPickingColors changed';
        }
    }
    renderLayers(opts) {
        if (!opts.viewports.length) {
            return;
        }
        const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;
        const renderOpts = {
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
        const renderResult = layerPass.render({ ...renderOpts, target: outputBuffer });
        const renderStats = 'stats' in renderResult ? renderResult.stats : renderResult;
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
    needsRedraw(opts = { clearRedrawFlags: false }) {
        const redraw = this._needsRedraw;
        if (opts.clearRedrawFlags) {
            this._needsRedraw = false;
        }
        return redraw;
    }
    finalize() {
        const { renderBuffers } = this;
        for (const buffer of renderBuffers) {
            buffer.delete();
        }
        renderBuffers.length = 0;
    }
    _updateStats(source) {
        if (!this.stats)
            return;
        let layersCount = 0;
        for (const { visibleCount } of source) {
            layersCount += visibleCount;
        }
        this.stats.get('Layers rendered').addCount(layersCount);
    }
    _preRender(effects, opts) {
        this.lastPostProcessEffect = null;
        opts.preRenderStats = opts.preRenderStats || {};
        for (const effect of effects) {
            opts.preRenderStats[effect.id] = effect.preRender(opts);
            if (effect.postRender) {
                this.lastPostProcessEffect = effect.id;
            }
        }
        if (this.lastPostProcessEffect) {
            this._resizeRenderBuffers(opts.canvasContext);
        }
    }
    _resizeRenderBuffers(canvasContext = this.device.canvasContext) {
        const { renderBuffers } = this;
        const size = canvasContext.getDrawingBufferSize();
        const [width, height] = size;
        if (renderBuffers.length === 0) {
            [0, 1].map(i => {
                const texture = this.device.createTexture({
                    sampler: { minFilter: 'linear', magFilter: 'linear' },
                    width,
                    height
                });
                renderBuffers.push(this.device.createFramebuffer({
                    id: `deck-renderbuffer-${i}`,
                    colorAttachments: [texture]
                }));
            });
        }
        for (const buffer of renderBuffers) {
            buffer.resize(size);
        }
    }
    _postRender(effects, opts) {
        const { renderBuffers } = this;
        const target = opts.target ?? opts.canvasContext?.getCurrentFramebuffer() ?? opts.target;
        const params = {
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
                params.inputBuffer = buffer;
                params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
            }
        }
    }
}
//# sourceMappingURL=deck-renderer.js.map