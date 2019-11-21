import LayersPass from './layers-pass';
import {withParameters} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const PICKING_PARAMETERS = {
  blendFunc: [GL.ONE, GL.ZERO, GL.CONSTANT_ALPHA, GL.ZERO],
  blendEquation: GL.FUNC_ADD
};

export default class PickLayersPass extends LayersPass {
  render(props) {
    if (props.pickingFBO) {
      this._drawPickingBuffer(props);
    } else {
      super.render(props);
    }
  }

  // Private
  // Draws list of layers and viewports into the picking buffer
  // Note: does not sample the buffer, that has to be done by the caller
  _drawPickingBuffer({
    layers,
    layerFilter,
    viewports,
    onViewportActive,
    pickingFBO,
    deviceRect: {x, y, width, height},
    pass = 'picking',
    redrawReason,
    pickZ
  }) {
    const gl = this.gl;
    this.pickZ = pickZ;

    // Make sure we clear scissor test and fbo bindings in case of exceptions
    // We are only interested in one pixel, no need to render anything else
    // Note that the callback here is called synchronously.
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    return withParameters(
      gl,
      {
        scissorTest: true,
        scissor: [x, y, width, height],
        clearColor: [0, 0, 0, 0],
        // When used as Mapbox custom layer, the context state may be dirty
        // TODO - Remove when mapbox fixes this issue
        // https://github.com/mapbox/mapbox-gl-js/issues/7801
        depthMask: true,
        depthTest: true,
        depthRange: [0, 1],
        colorMask: [true, true, true, true],
        // Blending
        ...PICKING_PARAMETERS,
        blend: !pickZ
      },
      () => {
        super.render({
          target: pickingFBO,
          layers,
          layerFilter,
          viewports,
          onViewportActive,
          pass,
          redrawReason
        });
      }
    );
  }

  // PRIVATE
  shouldDrawLayer(layer) {
    return layer.props.pickable;
  }

  getModuleParameters() {
    return {
      pickingActive: 1,
      pickingAttribute: this.pickZ,
      // turn off lighting by adding empty light source object
      // lights shader module relies on the `lightSources` to turn on/off lighting
      lightSources: {}
    };
  }

  getLayerParameters(layer, layerIndex) {
    // These will override any layer parameters
    const pickParameters = this.pickZ
      ? {blend: false}
      : {...PICKING_PARAMETERS, blend: true, blendColor: [0, 0, 0, (layerIndex + 1) / 255]};

    // Override layer parameters with pick parameters
    return Object.assign({}, layer.props.parameters, pickParameters);
  }
}
