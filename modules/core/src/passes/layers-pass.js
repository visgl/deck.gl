import GL from '@luma.gl/constants';
import Pass from './pass';
import {clear, setParameters, withParameters, cssToDeviceRatio} from '@luma.gl/core';
import log from '../utils/log';

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

      props.view = view;

      // render this viewport
      const subViewports = viewport.subViewports || [viewport];
      for (const subViewport of subViewports) {
        props.viewport = subViewport;

        const stats = this._drawLayersInViewport(gl, props);
        renderStats.push(stats);
      }
    }
    return renderStats;
  }

  // Draws a list of layers in one viewport
  // TODO - when picking we could completely skip rendering viewports that dont
  // intersect with the picking rect
  /* eslint-disable max-depth, max-statements */
  _drawLayersInViewport(
    gl,
    {layers, layerFilter, onError, viewport, view, pass = 'unknown', effects, moduleParameters}
  ) {
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

    const indexResolver = layerIndexResolver();
    // render layers in normal colors
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      // Check if we should draw layer
      const shouldDrawLayer = this._shouldDrawLayer(layer, viewport, pass, layerFilter);

      // This is the "logical" index for ordering this layer in the stack
      // used to calculate polygon offsets
      // It can be the same as another layer
      const layerRenderIndex = indexResolver(layer, shouldDrawLayer);

      // Calculate stats
      if (shouldDrawLayer && layer.props.pickable) {
        renderStatus.pickableCount++;
      }
      if (layer.isComposite) {
        renderStatus.compositeCount++;
      } else if (shouldDrawLayer) {
        // Draw the layer
        renderStatus.visibleCount++;

        const _moduleParameters = this._getModuleParameters(layer, effects, pass, moduleParameters);
        const layerParameters = this.getLayerParameters(layer, layerIndex);
        // overwrite layer.context.viewport with the sub viewport
        _moduleParameters.viewport = viewport;

        try {
          layer.drawLayer({
            moduleParameters: _moduleParameters,
            uniforms: {layerIndex: layerRenderIndex},
            parameters: layerParameters
          });
        } catch (err) {
          if (onError) {
            onError(err, layer);
          } else {
            log.error(`error during drawing of ${layer}`, err)();
          }
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
  _shouldDrawLayer(layer, viewport, pass, layerFilter) {
    let shouldDrawLayer = this.shouldDrawLayer(layer) && layer.props.visible;

    if (shouldDrawLayer && layerFilter) {
      shouldDrawLayer = layerFilter({
        layer,
        viewport,
        isPicking: pass.startsWith('picking'),
        renderPass: pass
      });
    }
    if (shouldDrawLayer) {
      // If a layer is drawn, update its viewportChanged flag
      layer.activateViewport(viewport);
    }

    return shouldDrawLayer;
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

  return (layer, isDrawn) => {
    const indexOverride = layer.props._offset;
    const layerId = layer.id;
    const parentId = layer.parent && layer.parent.id;

    let index;

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
