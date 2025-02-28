// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, Parameters, RenderPassParameters} from '@luma.gl/core';
import type {Framebuffer, RenderPass} from '@luma.gl/core';

import Pass from './pass';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type Layer from '../lib/layer';
import type {Effect} from '../lib/effect';
import type {ProjectProps} from '../shaderlib/project/viewport-uniforms';
import type {PickingProps} from '@luma.gl/shadertools';

export type Rect = {x: number; y: number; width: number; height: number};

export type LayersPassRenderOptions = {
  /** @deprecated TODO v9 recommend we rename this to framebuffer to minimize confusion */
  target?: Framebuffer | null;
  isPicking?: boolean;
  pass: string;
  layers: Layer[];
  viewports: Viewport[];
  onViewportActive?: (viewport: Viewport) => void;
  cullRect?: Rect;
  views?: Record<string, View>;
  effects?: Effect[];
  /** If true, recalculates render index (z) from 0. Set to false if a stack of layers are rendered in multiple passes. */
  clearStack?: boolean;
  clearCanvas?: boolean;
  clearColor?: number[];
  colorMask?: number;
  scissorRect?: number[];
  layerFilter?: ((context: FilterContext) => boolean) | null;
  shaderModuleProps?: any;
  /** Stores returned results from Effect.preRender, for use downstream in the render pipeline */
  preRenderStats?: Record<string, any>;
};

export type DrawLayerParameters = {
  shouldDrawLayer: boolean;
  layerRenderIndex: number;
  shaderModuleProps: any;
  layerParameters: Parameters;
};

export type FilterContext = {
  layer: Layer;
  viewport: Viewport;
  isPicking: boolean;
  renderPass: string;
  cullRect?: Rect;
};

export type RenderStats = {
  totalCount: number;
  visibleCount: number;
  compositeCount: number;
  pickableCount: number;
};

/** A Pass that renders all layers */
export default class LayersPass extends Pass {
  _lastRenderIndex: number = -1;

  render(options: LayersPassRenderOptions): any {
    // @ts-expect-error TODO - assuming WebGL context
    const [width, height] = this.device.canvasContext.getDrawingBufferSize();

    // Explicitly specify clearColor and clearDepth, overriding render pass defaults.
    const clearCanvas = options.clearCanvas ?? true;
    const clearColor = options.clearColor ?? (clearCanvas ? [0, 0, 0, 0] : false);
    const clearDepth = clearCanvas ? 1 : false;
    const clearStencil = clearCanvas ? 0 : false;
    const colorMask = options.colorMask ?? 0xf;

    const parameters: RenderPassParameters = {viewport: [0, 0, width, height]};
    if (options.colorMask) {
      parameters.colorMask = colorMask;
    }
    if (options.scissorRect) {
      parameters.scissorRect = options.scissorRect as [number, number, number, number];
    }

    const renderPass = this.device.beginRenderPass({
      framebuffer: options.target,
      parameters,
      clearColor: clearColor as [number, number, number, number],
      clearDepth,
      clearStencil
    });

    try {
      return this._drawLayers(renderPass, options);
    } finally {
      renderPass.end();
    }
  }

  /** Draw a list of layers in a list of viewports */
  private _drawLayers(renderPass: RenderPass, options: LayersPassRenderOptions) {
    const {
      target,
      shaderModuleProps,
      viewports,
      views,
      onViewportActive,
      clearStack = true
    } = options;
    options.pass = options.pass || 'unknown';

    if (clearStack) {
      this._lastRenderIndex = -1;
    }

    const renderStats: RenderStats[] = [];

    for (const viewport of viewports) {
      const view = views && views[viewport.id];

      // Update context to point to this viewport
      onViewportActive?.(viewport);

      const drawLayerParams = this._getDrawLayerParams(viewport, options);

      // render this viewport
      const subViewports = viewport.subViewports || [viewport];
      for (const subViewport of subViewports) {
        const stats = this._drawLayersInViewport(
          renderPass,
          {
            target,
            shaderModuleProps,
            viewport: subViewport,
            view,
            pass: options.pass,
            layers: options.layers
          },
          drawLayerParams
        );
        renderStats.push(stats);
      }
    }
    return renderStats;
  }

  // When a viewport contains multiple subviewports (e.g. repeated web mercator map),
  // this is only done once for the parent viewport
  /* Resolve the parameters needed to draw each layer */
  protected _getDrawLayerParams(
    viewport: Viewport,
    {
      layers,
      pass,
      isPicking = false,
      layerFilter,
      cullRect,
      effects,
      shaderModuleProps
    }: LayersPassRenderOptions,
    /** Internal flag, true if only used to determine whether each layer should be drawn */
    evaluateShouldDrawOnly: boolean = false
  ): DrawLayerParameters[] {
    const drawLayerParams: DrawLayerParameters[] = [];
    const indexResolver = layerIndexResolver(this._lastRenderIndex + 1);
    const drawContext: FilterContext = {
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
      const shouldDrawLayer = this._shouldDrawLayer(
        layer,
        drawContext,
        layerFilter,
        layerFilterCache
      );

      const layerParam = {shouldDrawLayer} as DrawLayerParameters;

      if (shouldDrawLayer && !evaluateShouldDrawOnly) {
        layerParam.shouldDrawLayer = true;

        // This is the "logical" index for ordering this layer in the stack
        // used to calculate polygon offsets
        // It can be the same as another layer
        layerParam.layerRenderIndex = indexResolver(layer, shouldDrawLayer);

        layerParam.shaderModuleProps = this._getShaderModuleProps(
          layer,
          effects,
          pass,
          shaderModuleProps
        );
        layerParam.layerParameters = {
          ...layer.context.deck?.props.parameters,
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
  /* eslint-disable max-depth, max-statements */
  private _drawLayersInViewport(
    renderPass: RenderPass,
    {layers, shaderModuleProps: globalModuleParameters, pass, target, viewport, view},
    drawLayerParams: DrawLayerParameters[]
  ): RenderStats {
    const glViewport = getGLViewport(this.device, {
      shaderModuleProps: globalModuleParameters,
      target,
      viewport
    });

    if (view && view.props.clear) {
      const clearOpts = view.props.clear === true ? {color: true, depth: true} : view.props.clear;
      const clearRenderPass = this.device.beginRenderPass({
        framebuffer: target,
        parameters: {
          viewport: glViewport,
          scissorRect: glViewport
        },
        clearColor: clearOpts.color ? [0, 0, 0, 0] : false,
        clearDepth: clearOpts.depth ? 1 : false
      });
      clearRenderPass.end();
    }

    // render layers in normal colors
    const renderStatus = {
      totalCount: layers.length,
      visibleCount: 0,
      compositeCount: 0,
      pickableCount: 0
    };

    renderPass.setParameters({viewport: glViewport});

    // render layers in normal colors
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex] as Layer;
      const drawLayerParameters = drawLayerParams[layerIndex];
      const {shouldDrawLayer} = drawLayerParameters;

      // Calculate stats
      if (shouldDrawLayer && layer.props.pickable) {
        renderStatus.pickableCount++;
      }
      if (layer.isComposite) {
        renderStatus.compositeCount++;
      }
      if (layer.isDrawable && drawLayerParameters.shouldDrawLayer) {
        const {layerRenderIndex, shaderModuleProps, layerParameters} = drawLayerParameters;
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
            uniforms: {layerIndex: layerRenderIndex},
            parameters: layerParameters
          });
        } catch (err) {
          layer.raiseError(err as Error, `drawing ${layer} to ${pass}`);
        }
      }
    }

    return renderStatus;
  }
  /* eslint-enable max-depth, max-statements */

  /* Methods for subclass overrides */
  shouldDrawLayer(layer: Layer): boolean {
    return true;
  }

  protected getShaderModuleProps(
    layer: Layer,
    effects: Effect[] | undefined,
    otherShaderModuleProps: Record<string, any>
  ): any {
    return null;
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): Parameters {
    return layer.props.parameters;
  }

  /* Private */
  private _shouldDrawLayer(
    layer: Layer,
    drawContext: FilterContext,
    layerFilter: ((params: FilterContext) => boolean) | undefined | null,
    layerFilterCache: Record<string, boolean>
  ) {
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

  private _getShaderModuleProps(
    layer: Layer,
    effects: Effect[] | undefined,
    pass: string,
    overrides: any
  ): any {
    // @ts-expect-error TODO - assuming WebGL context
    const devicePixelRatio = this.device.canvasContext.cssToDeviceRatio();
    const layerProps = layer.internalState?.propsInTransition || layer.props;

    const shaderModuleProps = {
      layer: layerProps,
      picking: {
        isActive: false
      } satisfies PickingProps,
      project: {
        viewport: layer.context.viewport,
        devicePixelRatio,
        modelMatrix: layerProps.modelMatrix,
        coordinateSystem: layerProps.coordinateSystem,
        coordinateOrigin: layerProps.coordinateOrigin,
        autoWrapLongitude: layer.wrapLongitude
      } satisfies ProjectProps
    };

    if (effects) {
      for (const effect of effects) {
        mergeModuleParameters(
          shaderModuleProps,
          effect.getShaderModuleProps?.(layer, shaderModuleProps)
        );
      }
    }

    return mergeModuleParameters(
      shaderModuleProps,
      this.getShaderModuleProps(layer, effects, shaderModuleProps),
      overrides
    );
  }
}

// If the _index prop is defined, return a layer index that's relative to its parent
// Otherwise return the index of the layer among all rendered layers
// This is done recursively, i.e. if the user overrides a layer's default index,
// all its descendants will be resolved relative to that index.
// This implementation assumes that parent layers always appear before its children
// which is true if the layer array comes from the LayerManager
export function layerIndexResolver(
  startIndex: number = 0,
  layerIndices: Record<string, number> = {}
): (layer: Layer, isDrawn: boolean) => number {
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
    } else if (Number.isFinite(indexOverride)) {
      index = indexOverride + (layerIndices[parentId] || 0);
      // Mark layer as needing its own resolver
      // We don't actually create it until it's used for the first time
      resolvers[layerId] = null;
    } else {
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
function getGLViewport(
  device: Device,
  {
    shaderModuleProps,
    target,
    viewport
  }: {
    shaderModuleProps: any;
    target?: Framebuffer;
    viewport: Viewport;
  }
): [number, number, number, number] {
  const pixelRatio =
    shaderModuleProps?.project?.devicePixelRatio ??
    // @ts-expect-error TODO - assuming WebGL context
    device.canvasContext.cssToDeviceRatio();

  // Default framebuffer is used when writing to canvas
  // @ts-expect-error TODO - assuming WebGL context
  const [, drawingBufferHeight] = device.canvasContext.getDrawingBufferSize();
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

function mergeModuleParameters(
  target: Record<string, any>,
  ...sources: Record<string, any>[]
): Record<string, any> {
  for (const source of sources) {
    if (source) {
      for (const key in source) {
        if (target[key]) {
          Object.assign(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}
