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

    const gl = this.gl;
    if (clearCanvas) {
      clearGLCanvas(gl);
    }

    const renderStats = [];

    viewports.forEach((viewportOrDescriptor, i) => {
      // Get a viewport from a viewport descriptor (which can be a plain viewport)
      const viewport = viewportOrDescriptor.viewport || viewportOrDescriptor;
      const view = views && views[viewport.id];

      // Update context to point to this viewport
      onViewportActive(viewport);

      props.viewport = viewport;
      props.view = view;

      // render this viewport
      const stats = this._drawLayersInViewport(gl, props);
      renderStats.push(stats);
    });
    return renderStats;
  }

  // Draws a list of layers in one viewport
  // TODO - when picking we could completely skip rendering viewports that dont
  // intersect with the picking rect
  _drawLayersInViewport(
    gl,
    {layers, layerFilter, viewport, view, pass = 'unknown', effects, moduleParameters}
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

    // render layers in normal colors
    layers.forEach((layer, layerIndex) => {
      // Check if we should draw layer
      const shouldDrawLayer = this._shouldDrawLayer(layer, viewport, pass, layerFilter);

      // Calculate stats
      if (shouldDrawLayer && layer.props.pickable) {
        renderStatus.pickableCount++;
      }
      if (layer.isComposite) {
        renderStatus.compositeCount++;
      }

      // Draw the layer
      if (shouldDrawLayer) {
        renderStatus.visibleCount++;

        const _moduleParameters = this._getModuleParameters(layer, effects, pass, moduleParameters);
        const uniforms = Object.assign({}, layer.context.uniforms, {layerIndex});
        const layerParameters = this.getLayerParameters(layer, layerIndex);

        layer.drawLayer({
          moduleParameters: _moduleParameters,
          uniforms,
          parameters: layerParameters
        });
      }
    });

    return renderStatus;
  }

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
    let shouldDrawLayer = this.shouldDrawLayer(layer) && !layer.isComposite && layer.props.visible;

    if (shouldDrawLayer && layerFilter) {
      shouldDrawLayer = layerFilter({
        layer,
        viewport,
        isPicking: pass.startsWith('picking'),
        renderPass: pass
      });
    }
    return shouldDrawLayer;
  }

  _getModuleParameters(layer, effects, pass, overrides) {
    const moduleParameters = Object.assign(Object.create(layer.props), {
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
