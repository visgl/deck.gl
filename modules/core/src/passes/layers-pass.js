import GL from '@luma.gl/constants';
import Pass from './pass';
import {clear, setParameters, withParameters, cssToDeviceRatio} from '@luma.gl/core';

export default class LayersPass extends Pass {
  render(props) {
    const gl = this.gl;

    setParameters(gl, {framebuffer: props.target});
    return this._drawLayers(props);
  }

  // PRIVATE
  // Draw a list of layers in a list of viewports
  _drawLayers(props) {
    const {viewports, views, onViewportActive, clearCanvas = true} = props;
    props.pass = props.pass || 'unknown';

    const gl = this.gl;
    if (clearCanvas) {
      clearGLCanvas(gl);
    }

    const renderStats = [];

    for (const viewportOrDescriptor of viewports) {
      // Get a viewport from a viewport descriptor (which can be a plain viewport)
      const viewport = viewportOrDescriptor.viewport || viewportOrDescriptor;
      const view = views && views[viewport.id];

      // Update context to point to this viewport
      onViewportActive(viewport);

      const drawLayerParams = this._getDrawLayerParams(viewport, props);

      props.view = view;

      // render this viewport
      const subViewports = viewport.subViewports || [viewport];
      for (const subViewport of subViewports) {
        props.viewport = subViewport;

        const stats = this._drawLayersInViewport(gl, props, drawLayerParams);
        renderStats.push(stats);
      }
    }
    return renderStats;
  }

  // Resolve the parameters needed to draw each layer
  // When a viewport contains multiple subviewports (e.g. repeated web mercator map),
  // this is only done once for the parent viewport
  _getDrawLayerParams(viewport, {layers, pass, layerFilter, effects, moduleParameters}) {
    const drawLayerParams = [];
    const indexResolver = layerIndexResolver();
    const drawContext = {
      viewport,
      isPicking: pass.startsWith('picking'),
      renderPass: pass
    };
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      // Check if we should draw layer
      const shouldDrawLayer = this._shouldDrawLayer(layer, drawContext, layerFilter);

      // This is the "logical" index for ordering this layer in the stack
      // used to calculate polygon offsets
      // It can be the same as another layer
      const layerRenderIndex = indexResolver(layer, shouldDrawLayer);

      const layerParam = {
        shouldDrawLayer,
        layerRenderIndex
      };

      if (shouldDrawLayer) {
        layerParam.moduleParameters = this._getModuleParameters(
          layer,
          effects,
          pass,
          moduleParameters
        );
        layerParam.layerParameters = this.getLayerParameters(layer, layerIndex);
      }
      drawLayerParams[layerIndex] = layerParam;
    }
    return drawLayerParams;
  }

  // Draws a list of layers in one viewport
  // TODO - when picking we could completely skip rendering viewports that dont
  // intersect with the picking rect
  /* eslint-disable max-depth, max-statements */
  _drawLayersInViewport(gl, {layers, pass, viewport, view}, drawLayerParams) {
    const glViewport = getGLViewport(gl, {viewport});

    if (view && view.props.clear) {
      const clearOpts = view.props.clear === true ? {color: true, depth: true} : view.props.clear;
      withParameters(
        gl,
        {
          scissorTest: true,
          scissor: glViewport
        },
        () => clear(gl, clearOpts)
      );
    }

    // render layers in normal colors
    const renderStatus = {
      totalCount: layers.length,
      visibleCount: 0,
      compositeCount: 0,
      pickableCount: 0
    };

    setParameters(gl, {viewport: glViewport});

    // render layers in normal colors
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      const {
        shouldDrawLayer,
        layerRenderIndex,
        moduleParameters,
        layerParameters
      } = drawLayerParams[layerIndex];

      // Calculate stats
      if (shouldDrawLayer && layer.props.pickable) {
        renderStatus.pickableCount++;
      }
      if (layer.isComposite) {
        renderStatus.compositeCount++;
      } else if (shouldDrawLayer) {
        // Draw the layer
        renderStatus.visibleCount++;

        // overwrite layer.context.viewport with the sub viewport
        moduleParameters.viewport = viewport;

        try {
          layer.drawLayer({
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
  shouldDrawLayer(layer) {
    return true;
  }

  getModuleParameters(layer, effects) {
    return null;
  }

  getLayerParameters(layer, layerIndex) {
    return layer.props.parameters;
  }

  /* Private */
  _shouldDrawLayer(layer, drawContext, layerFilter) {
    const shouldDrawLayer = this.shouldDrawLayer(layer) && layer.props.visible;

    if (!shouldDrawLayer) {
      return false;
    }

    drawContext.layer = layer;

    if (layerFilter && !layerFilter(drawContext)) {
      return false;
    }

    let parent = layer.parent;
    while (parent) {
      if (!parent.filterSubLayer(drawContext)) {
        return false;
      }
      drawContext.layer = parent;
      parent = parent.parent;
    }

    // If a layer is drawn, update its viewportChanged flag
    layer.activateViewport(drawContext.viewport);

    return true;
  }

  _getModuleParameters(layer, effects, pass, overrides) {
    const moduleParameters = Object.assign(Object.create(layer.props), {
      autoWrapLongitude: layer.wrapLongitude,
      viewport: layer.context.viewport,
      mousePosition: layer.context.mousePosition,
      pickingActive: 0,
      devicePixelRatio: cssToDeviceRatio(this.gl)
    });

    if (effects) {
      for (const effect of effects) {
        Object.assign(moduleParameters, effect.getModuleParameters(layer));
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
function getGLViewport(gl, {viewport}) {
  // TODO - dummy default for node
  // Fallback to width/height when clientWidth/clientHeight are 0 or undefined.
  const height = gl.canvas ? gl.canvas.clientHeight || gl.canvas.height : 100;
  // Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
  const dimensions = viewport;
  const pixelRatio = cssToDeviceRatio(gl);
  return [
    dimensions.x * pixelRatio,
    (height - dimensions.y - dimensions.height) * pixelRatio,
    dimensions.width * pixelRatio,
    dimensions.height * pixelRatio
  ];
}

function clearGLCanvas(gl) {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  // clear depth and color buffers, restoring transparency
  setParameters(gl, {viewport: [0, 0, width, height]});
  gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
}
