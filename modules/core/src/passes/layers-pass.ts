import type {Device} from '@luma.gl/core';
import type {Framebuffer, RenderPass} from '@luma.gl/core';

import Pass from './pass';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type Layer from '../lib/layer';
import type {Effect} from '../lib/effect';

export type Rect = {x: number; y: number; width: number; height: number};

export type LayersPassRenderOptions = {
  /** @deprecated TODO v9 recommend we rename this to framebuffer to minimize confusion */
  target?: Framebuffer;
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
  layerFilter?: ((context: FilterContext) => boolean) | null;
  moduleParameters?: any;
  /** Stores returned results from Effect.preRender, for use downstream in the render pipeline */
  preRenderStats?: Record<string, any>;
};

type DrawLayerParameters = {
  shouldDrawLayer: boolean;
  layerRenderIndex?: number;
  moduleParameters?: any;
  layerParameters?: any;
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
    const [width, height] = this.device.canvasContext.getDrawingBufferSize();

    const renderPass = this.device.beginRenderPass({
      framebuffer: options.target,
      parameters: {
        viewport: [0, 0, width, height]
      },
      // clear depth and color buffers, restoring transparency
      clearColor: options.clearCanvas ? [0, 0, 0, 0] : undefined,
      clearDepth: options.clearCanvas ? 1 : undefined
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
      moduleParameters,
      viewports,
      views,
      onViewportActive,
      clearStack = true,
      clearCanvas = true
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
            moduleParameters,
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
      moduleParameters
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

      const layerParam: DrawLayerParameters = {
        shouldDrawLayer
      };

      if (shouldDrawLayer && !evaluateShouldDrawOnly) {
        // This is the "logical" index for ordering this layer in the stack
        // used to calculate polygon offsets
        // It can be the same as another layer
        layerParam.layerRenderIndex = indexResolver(layer, shouldDrawLayer);

        layerParam.moduleParameters = this._getModuleParameters(
          layer,
          effects,
          pass,
          moduleParameters
        );
        layerParam.layerParameters = this.getLayerParameters(layer, layerIndex, viewport);
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
    {layers, moduleParameters: globalModuleParameters, pass, target, viewport, view},
    drawLayerParams
  ): RenderStats {
    const glViewport = getGLViewport(this.device, {
      moduleParameters: globalModuleParameters,
      target,
      viewport
    });

    // TODO v9 - since clearing is done in renderPass construction in luma.gl v9
    // we have a choice
    if (view && view.props.clear) {
      console.warn(`${view.id}: Per view clearing not yet implemented in deck.gl v9`);

      // const clearOpts = view.props.clear === true ? {color: true, depth: true} : view.props.clear;
      // withParameters(
      //   device,
      //   {
      //     scissorTest: true,
      //     scissor: glViewport
      //   },
      //   () => clear(device, clearOpts)
      // );
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
      const {shouldDrawLayer, layerRenderIndex, moduleParameters, layerParameters} =
        drawLayerParams[layerIndex];

      // Calculate stats
      if (shouldDrawLayer && layer.props.pickable) {
        renderStatus.pickableCount++;
      }
      if (layer.isComposite) {
        renderStatus.compositeCount++;
      } else if (shouldDrawLayer) {
        // Draw the layer
        renderStatus.visibleCount++;

        this._lastRenderIndex = Math.max(this._lastRenderIndex, layerRenderIndex);

        // overwrite layer.context.viewport with the sub viewport
        moduleParameters.viewport = viewport;

        // TODO v9 - we are sending renderPass both as a parameter and through the context.
        // Long-term, it is likely better not to have user defined layer methods have to access
        // the "global" layer context.
        layer.context.renderPass = renderPass;

        try {
          layer._drawLayer({
            renderPass,
            moduleParameters,
            uniforms: {layerIndex: layerRenderIndex},
            parameters: layerParameters
          });
        } catch (err) {
          layer.raiseError(err, `drawing ${layer} to ${pass}`);
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

  protected getModuleParameters(layer: Layer, effects?: Effect[]): any {
    return null;
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): any {
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

  private _getModuleParameters(
    layer: Layer,
    effects: Effect[] | undefined,
    pass: string,
    overrides: any
  ): any {
    const devicePixelRatio = this.device.canvasContext.cssToDeviceRatio();

    const moduleParameters = Object.assign(
      Object.create(layer.internalState?.propsInTransition || layer.props),
      {
        autoWrapLongitude: layer.wrapLongitude,
        viewport: layer.context.viewport,
        mousePosition: layer.context.mousePosition,
        pickingActive: 0,
        devicePixelRatio
      }
    );

    if (effects) {
      for (const effect of effects) {
        Object.assign(moduleParameters, effect.getModuleParameters?.(layer));
      }
    }

    return Object.assign(moduleParameters, this.getModuleParameters(layer, effects), overrides);
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
    moduleParameters,
    target,
    viewport
  }: {
    moduleParameters: any;
    target?: Framebuffer;
    viewport: Viewport;
  }
): [number, number, number, number] {
  const pixelRatio =
    (moduleParameters && moduleParameters.devicePixelRatio) ||
    device.canvasContext.cssToDeviceRatio();

  // Default framebuffer is used when writing to canvas
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
