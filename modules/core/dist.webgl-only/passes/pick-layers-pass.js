// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import LayersPass from "./layers-pass.js";
import log from "../utils/log.js";
const PICKING_BLENDING = {
    blendColorOperation: 'add',
    blendColorSrcFactor: 'one',
    blendColorDstFactor: 'zero',
    blendAlphaOperation: 'add',
    blendAlphaSrcFactor: 'constant',
    blendAlphaDstFactor: 'zero'
};
export default class PickLayersPass extends LayersPass {
    constructor() {
        super(...arguments);
        this._colorEncoderState = null;
    }
    render(props) {
        if ('pickingFBO' in props) {
            // When drawing into an off-screen buffer, use the alpha channel to encode layer index
            return this._drawPickingBuffer(props);
        }
        // When drawing to screen (debug mode), do not use the alpha channel so that result is always visible
        const stats = super._render(props);
        return { decodePickingColor: null, stats };
    }
    // Private
    // Draws list of layers and viewports into the picking buffer
    // Note: does not sample the buffer, that has to be done by the caller
    _drawPickingBuffer({ layers, layerFilter, views, viewports, onViewportActive, pickingFBO, deviceRect: { x, y, width, height }, cullRect, effects, pass = 'picking', pickZ, canvasContext, shaderModuleProps, clearColor }) {
        this.pickZ = pickZ;
        const colorEncoderState = this._resetColorEncoder(pickZ);
        const scissorRect = [x, y, width, height];
        // Make sure we clear scissor test and fbo bindings in case of exceptions
        // We are only interested in one pixel, no need to render anything else
        // Note that the callback here is called synchronously.
        // Set blend mode for picking
        // always overwrite existing pixel with [r,g,b,layerIndex]
        const renderStatus = super._render({
            target: pickingFBO,
            layers,
            layerFilter,
            views,
            viewports,
            onViewportActive,
            cullRect,
            effects: effects?.filter(e => e.useInPicking),
            pass,
            canvasContext,
            isPicking: true,
            shaderModuleProps,
            clearColor: clearColor ?? [0, 0, 0, 0],
            colorMask: 0xf,
            scissorRect
        });
        // Clear the temp field
        this._colorEncoderState = null;
        const decodePickingColor = colorEncoderState && decodeColor.bind(null, colorEncoderState);
        return { decodePickingColor, stats: renderStatus };
    }
    shouldDrawLayer(layer) {
        const { pickable, operation } = layer.props;
        return ((pickable && operation.includes('draw')) ||
            operation.includes('terrain') ||
            operation.includes('mask'));
    }
    getShaderModuleProps(layer, effects, otherShaderModuleProps) {
        return {
            picking: {
                isActive: 1,
                isAttribute: this.pickZ,
                disabledPickingIndices: layer.internalState?.disabledPickingIndices
            },
            lighting: { enabled: false }
        };
    }
    getLayerParameters(layer, layerIndex, viewport) {
        // TODO use Parameters type
        const pickParameters = {
            ...layer.props.parameters
        };
        const { pickable, operation } = layer.props;
        if (!this._colorEncoderState) {
            pickParameters.blend = false;
        }
        else if (pickable && operation.includes('draw')) {
            // Encode pickable layers that include 'draw' operation (including 'terrain+draw')
            Object.assign(pickParameters, PICKING_BLENDING);
            pickParameters.blend = true;
            if (false) {
                // WebGPU uses render-pass dynamic state for constant blending.
                pickParameters.blendConstant = encodeColor(this._colorEncoderState, layer, viewport);
            }
            else {
                pickParameters.blendColor = encodeColor(this._colorEncoderState, layer, viewport);
            }
            if (operation.includes('terrain') && layer.state?._hasPickingCover) {
                // For terrain+draw layers with a valid cover FBO, the terrain shader outputs the
                // cover FBO pixel which already has correctly encoded alpha from the cover encoder.
                // Use srcFactor 'one' to pass through the cover alpha without double-encoding.
                // Without a cover FBO, keep 'constant' so the layer's own picking colors encode correctly.
                pickParameters.blendAlphaSrcFactor = 'one';
            }
        }
        else if (operation.includes('terrain')) {
            // Pure terrain layers (without 'draw') don't need picking colors
            pickParameters.blend = false;
        }
        return pickParameters;
    }
    _resetColorEncoder(pickZ) {
        // Track encoded layer indices
        this._colorEncoderState = pickZ
            ? null
            : {
                byLayer: new Map(),
                byAlpha: []
            };
        // Temporarily store it on the instance so that it can be accessed by this.getLayerParameters
        return this._colorEncoderState;
    }
}
// Assign an unique alpha value for each pickable layer and track the encoding in the cache object
// Returns normalized blend color
function encodeColor(encoded, layer, viewport) {
    const { byLayer, byAlpha } = encoded;
    let a;
    // Encode layerIndex in the alpha channel
    // TODO - combine small layers to better utilize the picking color space
    let entry = byLayer.get(layer);
    if (entry) {
        entry.viewports.push(viewport);
        a = entry.a;
    }
    else {
        a = byLayer.size + 1;
        if (a <= 255) {
            entry = { a, layer, viewports: [viewport] };
            byLayer.set(layer, entry);
            byAlpha[a] = entry;
        }
        else {
            log.warn('Too many pickable layers, only picking the first 255')();
            a = 0;
        }
    }
    return [0, 0, 0, a / 255];
}
// Given a picked color, retrieve the corresponding layer and viewports from cache
function decodeColor(encoded, pickedColor) {
    const entry = encoded.byAlpha[pickedColor[3]];
    return (entry && {
        pickedLayer: entry.layer,
        pickedViewports: entry.viewports,
        pickedObjectIndex: entry.layer.decodePickingColor(pickedColor)
    });
}
//# sourceMappingURL=pick-layers-pass.js.map