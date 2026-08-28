// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Pass from "./pass.js";
// WebGPU complication: Matching attachment state of the renderpass requires including a depth buffer
const WEBGPU_DEFAULT_DRAW_PARAMETERS = {
    depthWriteEnabled: true,
    depthCompare: 'less-equal',
    blendColorOperation: 'add',
    blendColorSrcFactor: 'one',
    blendColorDstFactor: 'one-minus-src-alpha',
    blendAlphaOperation: 'add',
    blendAlphaSrcFactor: 'one',
    blendAlphaDstFactor: 'one-minus-src-alpha'
};
/** A Pass that renders all layers */
export default class LayersPass extends Pass {
    constructor() {
        super(...arguments);
        this._lastRenderIndex = -1;
    }
    render(options) {
        this._render(options);
    }
    _render(options) {
        const { canvasContext = this.device.canvasContext } = options;
        const framebuffer = options.target ?? canvasContext.getCurrentFramebuffer();
        const [width, height] = canvasContext.getDrawingBufferSize();
        // Explicitly specify clearColor and clearDepth, overriding render pass defaults.
        const clearCanvas = options.clearCanvas ?? true;
        let clearColor = options.clearColor ?? (clearCanvas ? [0, 0, 0, 0] : false);
        let clearDepth = clearCanvas ? 1 : false;
        let clearStencil = clearCanvas ? 0 : false;
        const colorMask = options.colorMask ?? 0xf;
        const parameters = { viewport: [0, 0, width, height] };
        if (options.colorMask) {
            parameters.colorMask = colorMask;
        }
        if (options.scissorRect) {
            parameters.scissorRect = options.scissorRect;
        }
        const { shaderModuleProps, viewports, views, onViewportActive, clearStack = true } = options;
        const pass = options.pass || 'unknown';
        const submitEachRenderPass = false;
        if (clearStack) {
            this._lastRenderIndex = -1;
        }
        const renderStats = [];
        try {
            for (const viewport of viewports) {
                onViewportActive?.(viewport);
                const drawLayerParams = this._getDrawLayerParams(viewport, options);
                const view = views && views[viewport.id];
                const subViewports = viewport.subViewports || [viewport];
                // WebGL renders one logical viewport per pass. WebGPU must submit each physical
                // viewport before shared model uniforms are updated for the next one.
                const renderGroups = submitEachRenderPass
                    ? subViewports.map(subViewport => [subViewport])
                    : [subViewports];
                for (const renderGroup of renderGroups) {
                    const renderPass = this.device.beginRenderPass({
                        framebuffer,
                        parameters,
                        clearColor: clearColor,
                        clearDepth,
                        clearStencil
                    });
                    try {
                        for (const subViewport of renderGroup) {
                            const stats = this._drawLayersInViewport(renderPass, {
                                target: framebuffer,
                                canvasContext,
                                shaderModuleProps,
                                viewport: subViewport,
                                view,
                                pass,
                                layers: options.layers,
                                isPicking: options.isPicking
                            }, drawLayerParams);
                            renderStats.push(stats);
                        }
                    }
                    finally {
                        renderPass.end();
                        if (submitEachRenderPass) {
                            this.device.submit();
                        }
                    }
                    clearColor = false;
                    clearDepth = false;
                    clearStencil = false;
                }
            }
            return renderStats;
        }
        finally {
            if (!submitEachRenderPass) {
                this.device.submit();
            }
        }
    }
    // When a viewport contains multiple subviewports (e.g. repeated web mercator map),
    // this is only done once for the parent viewport
    /* Resolve the parameters needed to draw each layer */
    _getDrawLayerParams(viewport, { layers, pass, isPicking = false, layerFilter, cullRect, views, effects, canvasContext = this.device.canvasContext, shaderModuleProps }, 
    /** Internal flag, true if only used to determine whether each layer should be drawn */
    evaluateShouldDrawOnly = false) {
        const drawLayerParams = [];
        const indexResolver = layerIndexResolver(this._lastRenderIndex + 1);
        const drawContext = {
            layer: layers[0],
            viewport,
            isPicking,
            renderPass: pass,
            cullRect
        };
        const layerFilterCache = {};
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            const layer = layers[layerIndex];
            // Check if we should draw layer
            const shouldDrawLayer = this._shouldDrawLayer(layer, drawContext, layerFilter, layerFilterCache);
            const layerParam = { shouldDrawLayer };
            if (shouldDrawLayer && !evaluateShouldDrawOnly) {
                layerParam.shouldDrawLayer = true;
                // This is the "logical" index for ordering this layer in the stack
                // used to calculate polygon offsets
                // It can be the same as another layer
                layerParam.layerRenderIndex = indexResolver(layer, shouldDrawLayer);
                layerParam.shaderModuleProps = this._getShaderModuleProps(layer, effects, pass, canvasContext, shaderModuleProps);
                const defaultParams = null;
                layerParam.layerParameters = {
                    ...defaultParams,
                    ...layer.context.deck?.props.parameters,
                    ...views?.[viewport.id]?.props.parameters,
                    ...this.getLayerParameters(layer, layerIndex, viewport)
                };
            }
            drawLayerParams[layerIndex] = layerParam;
        }
        return drawLayerParams;
    }
    // Draws a list of layers in one viewport
    // TODO - when picking we could completely skip rendering viewports that dont
    // intersect with the picking rect
    /* eslint-disable max-depth, max-statements, complexity */
    _drawLayersInViewport(renderPass, { layers, shaderModuleProps: globalModuleParameters, pass, target, canvasContext, viewport, view, isPicking }, drawLayerParams) {
        const glViewport = getGLViewport(this.device, {
            canvasContext,
            shaderModuleProps: globalModuleParameters,
            target,
            viewport
        });
        if (view) {
            const { clear, clearColor, clearDepth, clearStencil } = view.props;
            if (clear) {
                // If clear option is set, clear all buffers by default.
                let colorToUse = [0, 0, 0, 0];
                let depthToUse = 1.0;
                let stencilToUse = 0;
                // While picking, ignore the view's clearColor: the picking buffer encodes object
                // references as colors and is already cleared to transparent black.
                // `clearColor: false` below still means "don't clear color" in both modes.
                if (Array.isArray(clearColor) && !isPicking) {
                    colorToUse = [...clearColor.slice(0, 3), clearColor[3] || 255].map(c => c / 255);
                }
                else if (clearColor === false) {
                    colorToUse = false;
                }
                if (clearDepth !== undefined) {
                    depthToUse = clearDepth;
                }
                if (clearStencil !== undefined) {
                    stencilToUse = clearStencil;
                }
                const clearRenderPass = this.device.beginRenderPass({
                    framebuffer: target,
                    parameters: {
                        viewport: glViewport,
                        scissorRect: glViewport
                    },
                    clearColor: colorToUse,
                    clearDepth: depthToUse,
                    clearStencil: stencilToUse
                });
                clearRenderPass.end();
            }
        }
        // render layers in normal colors
        const renderStatus = {
            totalCount: layers.length,
            visibleCount: 0,
            compositeCount: 0,
            pickableCount: 0
        };
        renderPass.setParameters({ viewport: glViewport });
        // render layers in normal colors
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            const layer = layers[layerIndex];
            const drawLayerParameters = drawLayerParams[layerIndex];
            const { shouldDrawLayer } = drawLayerParameters;
            // Calculate stats
            if (shouldDrawLayer && layer.props.pickable) {
                renderStatus.pickableCount++;
            }
            if (layer.isComposite) {
                renderStatus.compositeCount++;
            }
            if (layer.isDrawable && drawLayerParameters.shouldDrawLayer) {
                const { layerRenderIndex, shaderModuleProps, layerParameters } = drawLayerParameters;
                // Draw the layer
                renderStatus.visibleCount++;
                this._lastRenderIndex = Math.max(this._lastRenderIndex, layerRenderIndex);
                // overwrite layer.context.viewport with the sub viewport
                if (shaderModuleProps.project) {
                    shaderModuleProps.project.viewport = viewport;
                }
                // TODO v9 - we are sending renderPass both as a parameter and through the context.
                // Long-term, it is likely better not to have user defined layer methods have to access
                // the "global" layer context.
                layer.context.renderPass = renderPass;
                try {
                    layer._drawLayer({
                        renderPass,
                        shaderModuleProps,
                        uniforms: { layerIndex: layerRenderIndex },
                        parameters: layerParameters
                    });
                }
                catch (err) {
                    layer.raiseError(err, `drawing ${layer} to ${pass}`);
                }
            }
        }
        return renderStatus;
    }
    /* eslint-enable max-depth, max-statements */
    /* Methods for subclass overrides */
    shouldDrawLayer(layer) {
        return true;
    }
    getShaderModuleProps(layer, effects, otherShaderModuleProps) {
        return null;
    }
    getLayerParameters(layer, layerIndex, viewport) {
        return layer.props.parameters;
    }
    /* Private */
    _shouldDrawLayer(layer, drawContext, layerFilter, layerFilterCache) {
        const shouldDrawLayer = layer.props.visible && this.shouldDrawLayer(layer);
        if (!shouldDrawLayer) {
            return false;
        }
        drawContext.layer = layer;
        let parent = layer.parent;
        while (parent) {
            // @ts-ignore
            if (!parent.props.visible || !parent.filterSubLayer(drawContext)) {
                return false;
            }
            drawContext.layer = parent;
            parent = parent.parent;
        }
        if (layerFilter) {
            const rootLayerId = drawContext.layer.id;
            if (!(rootLayerId in layerFilterCache)) {
                layerFilterCache[rootLayerId] = layerFilter(drawContext);
            }
            if (!layerFilterCache[rootLayerId]) {
                return false;
            }
        }
        // If a layer is drawn, update its viewportChanged flag
        layer.activateViewport(drawContext.viewport);
        return true;
    }
    _getShaderModuleProps(layer, effects, pass, canvasContext, overrides) {
        const devicePixelRatio = canvasContext.cssToDeviceRatio();
        const layerProps = layer.internalState?.propsInTransition || layer.props;
        const shaderModuleProps = {
            layer: layerProps,
            picking: {
                isActive: false
            },
            project: {
                viewport: layer.context.viewport,
                devicePixelRatio,
                modelMatrix: layerProps.modelMatrix,
                coordinateSystem: layerProps.coordinateSystem,
                coordinateOrigin: layerProps.coordinateOrigin,
                autoWrapLongitude: layer.wrapLongitude
            }
        };
        if (effects) {
            for (const effect of effects) {
                mergeModuleParameters(shaderModuleProps, effect.getShaderModuleProps?.(layer, shaderModuleProps));
            }
        }
        // Ensure all default shader modules have an entry so their getUniforms is called.
        // Without this, default modules added by effects (e.g. terrain) may not get their
        // bindings set when rendered in passes that don't include those effects (e.g. mask pass).
        for (const module of layer.context.defaultShaderModules) {
            if (!(module.name in shaderModuleProps)) {
                shaderModuleProps[module.name] = {};
            }
        }
        return mergeModuleParameters(shaderModuleProps, this.getShaderModuleProps(layer, effects, shaderModuleProps), overrides);
    }
}
// If the _index prop is defined, return a layer index that's relative to its parent
// Otherwise return the index of the layer among all rendered layers
// This is done recursively, i.e. if the user overrides a layer's default index,
// all its descendants will be resolved relative to that index.
// This implementation assumes that parent layers always appear before its children
// which is true if the layer array comes from the LayerManager
export function layerIndexResolver(startIndex = 0, layerIndices = {}) {
    const resolvers = {};
    const resolveLayerIndex = (layer, isDrawn) => {
        const indexOverride = layer.props._offset;
        const layerId = layer.id;
        const parentId = layer.parent && layer.parent.id;
        let index;
        if (parentId && !(parentId in layerIndices)) {
            // Populate layerIndices with the parent layer's index
            resolveLayerIndex(layer.parent, false);
        }
        if (parentId in resolvers) {
            const resolver = (resolvers[parentId] =
                resolvers[parentId] || layerIndexResolver(layerIndices[parentId], layerIndices));
            index = resolver(layer, isDrawn);
            resolvers[layerId] = resolver;
        }
        else if (Number.isFinite(indexOverride)) {
            index = indexOverride + (layerIndices[parentId] || 0);
            // Mark layer as needing its own resolver
            // We don't actually create it until it's used for the first time
            resolvers[layerId] = null;
        }
        else {
            index = startIndex;
        }
        if (isDrawn && index >= startIndex) {
            startIndex = index + 1;
        }
        layerIndices[layerId] = index;
        return index;
    };
    return resolveLayerIndex;
}
// Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
function getGLViewport(device, { canvasContext = device.canvasContext, shaderModuleProps, target, viewport }) {
    const pixelRatio = shaderModuleProps?.project?.devicePixelRatio ?? canvasContext.cssToDeviceRatio();
    // Default framebuffer is used when writing to canvas
    const [, drawingBufferHeight] = canvasContext.getDrawingBufferSize();
    const height = target ? target.height : drawingBufferHeight;
    // Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
    const dimensions = viewport;
    return [
        dimensions.x * pixelRatio,
        height - (dimensions.y + dimensions.height) * pixelRatio,
        dimensions.width * pixelRatio,
        dimensions.height * pixelRatio
    ];
}
function mergeModuleParameters(target, ...sources) {
    for (const source of sources) {
        if (source) {
            for (const key in source) {
                if (target[key]) {
                    Object.assign(target[key], source[key]);
                }
                else {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}
//# sourceMappingURL=layers-pass.js.map