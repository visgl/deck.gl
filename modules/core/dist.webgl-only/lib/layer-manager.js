// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Timeline } from '@luma.gl/engine';
import { getShaderAssembler, layerUniforms } from "../shaderlib/index.js";
import { LIFECYCLE } from "../lifecycle/constants.js";
import log from "../utils/log.js";
import debug from "../debug/index.js";
import { flatten } from "../utils/flatten.js";
import { Stats } from '@probe.gl/stats';
import ResourceManager from "./resource/resource-manager.js";
import Viewport from "../viewports/viewport.js";
const TRACE_SET_LAYERS = 'layerManager.setLayers';
const TRACE_ACTIVATE_VIEWPORT = 'layerManager.activateViewport';
export default class LayerManager {
    /**
     * @param device
     * @param param1
     */
    // eslint-disable-next-line
    constructor(device, props) {
        this._lastRenderedLayers = [];
        this._needsRedraw = false;
        this._needsUpdate = false;
        this._nextLayers = null;
        this._debug = false;
        // This flag is separate from _needsUpdate because it can be set during an update and should trigger another full update
        this._defaultShaderModulesChanged = false;
        //
        // INTERNAL METHODS
        //
        /** Make a viewport "current" in layer context, updating viewportChanged flags */
        this.activateViewport = (viewport) => {
            debug(TRACE_ACTIVATE_VIEWPORT, this, viewport);
            if (viewport) {
                this.context.viewport = viewport;
            }
        };
        const { deck, stats, viewport, timeline } = props || {};
        // Currently deck.gl expects the DeckGL.layers array to be different
        // whenever React rerenders. If the same layers array is used, the
        // LayerManager's diffing algorithm will generate a fatal error and
        // break the rendering.
        // `this._lastRenderedLayers` stores the UNFILTERED layers sent
        // down to LayerManager, so that `layers` reference can be compared.
        // If it's the same across two React render calls, the diffing logic
        // will be skipped.
        this.layers = [];
        this.resourceManager = new ResourceManager({ device, protocol: 'deck://' });
        this.context = {
            mousePosition: null,
            userData: {},
            layerManager: this,
            device,
            // @ts-expect-error
            gl: device?.gl,
            deck,
            shaderAssembler: getShaderAssembler(device?.info?.shadingLanguage || 'glsl'),
            defaultShaderModules: [layerUniforms],
            renderPass: undefined,
            stats: stats || new Stats({ id: 'deck.gl' }),
            // Make sure context.viewport is not empty on the first layer initialization
            viewport: viewport || new Viewport({ id: 'DEFAULT-INITIAL-VIEWPORT' }), // Current viewport, exposed to layers for project* function
            timeline: timeline || new Timeline(),
            resourceManager: this.resourceManager,
            onError: undefined
        };
        Object.seal(this);
    }
    /** Method to call when the layer manager is not needed anymore. */
    finalize() {
        this.resourceManager.finalize();
        // Finalize all layers
        for (const layer of this.layers) {
            this._finalizeLayer(layer);
        }
    }
    /** Check if a redraw is needed */
    needsRedraw(opts = { clearRedrawFlags: false }) {
        let redraw = this._needsRedraw;
        if (opts.clearRedrawFlags) {
            this._needsRedraw = false;
        }
        // This layers list doesn't include sublayers, relying on composite layers
        for (const layer of this.layers) {
            // Call every layer to clear their flags
            const layerNeedsRedraw = layer.getNeedsRedraw(opts);
            redraw = redraw || layerNeedsRedraw;
        }
        return redraw;
    }
    /** Check if a deep update of all layers is needed */
    needsUpdate() {
        if (this._nextLayers && this._nextLayers !== this._lastRenderedLayers) {
            // New layers array may be the same as the old one if `setProps` is called by React
            return 'layers changed';
        }
        if (this._defaultShaderModulesChanged) {
            return 'shader modules changed';
        }
        return this._needsUpdate;
    }
    /** Layers will be redrawn (in next animation frame) */
    setNeedsRedraw(reason) {
        this._needsRedraw = this._needsRedraw || reason;
    }
    /** Layers will be updated deeply (in next animation frame)
      Potentially regenerating attributes and sub layers */
    setNeedsUpdate(reason) {
        this._needsUpdate = this._needsUpdate || reason;
    }
    /** Gets a list of currently rendered layers. Optionally filter by id. */
    getLayers({ layerIds } = {}) {
        // Filtering by layerId compares beginning of strings, so that sublayers will be included
        // Dependes on the convention of adding suffixes to the parent's layer name
        return layerIds
            ? this.layers.filter(layer => layerIds.find(layerId => layer.id.indexOf(layerId) === 0))
            : this.layers;
    }
    /** Set props needed for layer rendering and picking. */
    setProps(props) {
        if ('debug' in props) {
            this._debug = props.debug;
        }
        // A way for apps to add data to context that can be accessed in layers
        if ('userData' in props) {
            this.context.userData = props.userData;
        }
        // New layers will be processed in `updateLayers` in the next update cycle
        if ('layers' in props) {
            this._nextLayers = props.layers;
        }
        if ('onError' in props) {
            this.context.onError = props.onError;
        }
    }
    /** Supply a new layer list, initiating sublayer generation and layer matching */
    setLayers(newLayers, reason) {
        debug(TRACE_SET_LAYERS, this, reason, newLayers);
        this._lastRenderedLayers = newLayers;
        const flatLayers = flatten(newLayers, Boolean);
        for (const layer of flatLayers) {
            layer.context = this.context;
        }
        this._updateLayers(this.layers, flatLayers);
    }
    /** Update layers from last cycle if `setNeedsUpdate()` has been called */
    updateLayers() {
        // NOTE: For now, even if only some layer has changed, we update all layers
        // to ensure that layer id maps etc remain consistent even if different
        // sublayers are rendered
        const reason = this.needsUpdate();
        if (reason) {
            this.setNeedsRedraw(`updating layers: ${reason}`);
            // Force a full update
            this.setLayers(this._nextLayers || this._lastRenderedLayers, reason);
        }
        // Updated, clear the backlog
        this._nextLayers = null;
    }
    /** Register a default shader module */
    addDefaultShaderModule(module) {
        const { defaultShaderModules } = this.context;
        if (!defaultShaderModules.find(m => m.name === module.name)) {
            defaultShaderModules.push(module);
            this._defaultShaderModulesChanged = true;
        }
    }
    /** Deregister a default shader module */
    removeDefaultShaderModule(module) {
        const { defaultShaderModules } = this.context;
        const i = defaultShaderModules.findIndex(m => m.name === module.name);
        if (i >= 0) {
            defaultShaderModules.splice(i, 1);
            this._defaultShaderModulesChanged = true;
        }
    }
    _handleError(stage, error, layer) {
        layer.raiseError(error, `${stage} of ${layer}`);
    }
    // TODO - mark layers with exceptions as bad and remove from rendering cycle?
    /** Match all layers, checking for caught errors
      to avoid having an exception in one layer disrupt other layers */
    _updateLayers(oldLayers, newLayers) {
        // Create old layer map
        const oldLayerMap = {};
        for (const oldLayer of oldLayers) {
            if (oldLayerMap[oldLayer.id]) {
                log.warn(`Multiple old layers with same id ${oldLayer.id}`)();
            }
            else {
                oldLayerMap[oldLayer.id] = oldLayer;
            }
        }
        if (this._defaultShaderModulesChanged) {
            for (const layer of oldLayers) {
                layer.setNeedsUpdate();
                layer.setChangeFlags({ extensionsChanged: true });
            }
            this._defaultShaderModulesChanged = false;
        }
        // Allocate array for generated layers
        const generatedLayers = [];
        // Match sublayers
        this._updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers);
        // Finalize unmatched layers
        this._finalizeOldLayers(oldLayerMap);
        let needsUpdate = false;
        for (const layer of generatedLayers) {
            if (layer.hasUniformTransition()) {
                needsUpdate = `Uniform transition in ${layer}`;
                break;
            }
        }
        this._needsUpdate = needsUpdate;
        this.layers = generatedLayers;
    }
    /* eslint-disable complexity,max-statements */
    // Note: adds generated layers to `generatedLayers` array parameter
    _updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers) {
        for (const newLayer of newLayers) {
            newLayer.context = this.context;
            // Given a new coming layer, find its matching old layer (if any)
            const oldLayer = oldLayerMap[newLayer.id];
            if (oldLayer === null) {
                // null, rather than undefined, means this id was originally there
                log.warn(`Multiple new layers with same id ${newLayer.id}`)();
            }
            // Remove the old layer from candidates, as it has been matched with this layer
            oldLayerMap[newLayer.id] = null;
            let sublayers = null;
            // We must not generate exceptions until after layer matching is complete
            try {
                if (this._debug && oldLayer !== newLayer) {
                    newLayer.validateProps();
                }
                if (!oldLayer) {
                    this._initializeLayer(newLayer);
                }
                else {
                    this._transferLayerState(oldLayer, newLayer);
                    this._updateLayer(newLayer);
                }
                generatedLayers.push(newLayer);
                // Call layer lifecycle method: render sublayers
                sublayers = newLayer.isComposite ? newLayer.getSubLayers() : null;
                // End layer lifecycle method: render sublayers
            }
            catch (err) {
                this._handleError('matching', err, newLayer); // Record first exception
            }
            if (sublayers) {
                this._updateSublayersRecursively(sublayers, oldLayerMap, generatedLayers);
            }
        }
    }
    /* eslint-enable complexity,max-statements */
    // Finalize any old layers that were not matched
    _finalizeOldLayers(oldLayerMap) {
        for (const layerId in oldLayerMap) {
            const layer = oldLayerMap[layerId];
            if (layer) {
                this._finalizeLayer(layer);
            }
        }
    }
    // / EXCEPTION SAFE LAYER ACCESS
    /** Safely initializes a single layer, calling layer methods */
    _initializeLayer(layer) {
        try {
            layer._initialize();
            layer.lifecycle = LIFECYCLE.INITIALIZED;
        }
        catch (err) {
            this._handleError('initialization', err, layer);
            // TODO - what should the lifecycle state be here? LIFECYCLE.INITIALIZATION_FAILED?
        }
    }
    /** Transfer state from one layer to a newer version */
    _transferLayerState(oldLayer, newLayer) {
        newLayer._transferState(oldLayer);
        newLayer.lifecycle = LIFECYCLE.MATCHED;
        if (newLayer !== oldLayer) {
            oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
        }
    }
    /** Safely updates a single layer, cleaning all flags */
    _updateLayer(layer) {
        try {
            layer._update();
        }
        catch (err) {
            this._handleError('update', err, layer);
        }
    }
    /** Safely finalizes a single layer, removing all resources */
    _finalizeLayer(layer) {
        this._needsRedraw = this._needsRedraw || `finalized ${layer}`;
        layer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;
        try {
            layer._finalize();
            layer.lifecycle = LIFECYCLE.FINALIZED;
        }
        catch (err) {
            this._handleError('finalization', err, layer);
        }
    }
}
//# sourceMappingURL=layer-manager.js.map