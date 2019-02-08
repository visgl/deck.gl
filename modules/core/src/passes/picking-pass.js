import BaseLayersPass from './base-layers-pass';
import {withParameters} from 'luma.gl';

export default class PickingPass extends BaseLayersPass {
  constructor(gl, props) {
    super(gl, props);
  }

  // Draws list of layers and viewports into the picking buffer
  // Note: does not sample the buffer, that has to be done by the caller
  drawPickingBuffer(
    gl,
    {
      layers,
      viewports,
      onViewportActive,
      useDevicePixels,
      pickingFBO,
      deviceRect: {x, y, width, height},
      layerFilter = null,
      redrawReason = ''
    }
  ) {
    // Make sure we clear scissor test and fbo bindings in case of exceptions
    // We are only interested in one pixel, no need to render anything else
    // Note that the callback here is called synchronously.
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    return withParameters(
      gl,
      {
        framebuffer: pickingFBO,
        scissorTest: true,
        scissor: [x, y, width, height],
        clearColor: [0, 0, 0, 0]
      },
      () => {
        this.drawLayers(gl, {
          layers,
          viewports,
          onViewportActive,
          useDevicePixels,
          drawPickingColors: true,
          layerFilter,
          pass: 'picking',
          redrawReason,
          parameters: {
            blend: true,
            blendFunc: [gl.ONE, gl.ZERO, gl.CONSTANT_ALPHA, gl.ZERO],
            blendEquation: gl.FUNC_ADD,
            blendColor: [0, 0, 0, 0]
          }
        });
      }
    );
  }

  // PRIVATE
  shouldDrawLayer(layer, layerFilter, viewport) {
    let shouldDrawLayer = !layer.isComposite && layer.props.visible && layer.props.pickable;

    if (shouldDrawLayer && layerFilter) {
      shouldDrawLayer = layerFilter({layer, viewport, isPicking: true});
    }
    return shouldDrawLayer;
  }

  getModuleParameters(layer, pixelRatio) {
    const moduleParameters = Object.assign(Object.create(layer.props), {
      viewport: layer.context.viewport,
      pickingActive: 1,
      devicePixelRatio: pixelRatio
    });
    return moduleParameters;
  }

  getLayerParameters(layer, layerIndex, glViewport, parameters) {
    // All parameter resolving is done here instead of the layer
    // Blend parameters must not be overridden
    const layerParameters = Object.assign({}, layer.props.parameters || {}, parameters);

    Object.assign(layerParameters, {
      viewport: glViewport,
      blendColor: [0, 0, 0, (layerIndex + 1) / 255]
    });

    return layerParameters;
  }
}
