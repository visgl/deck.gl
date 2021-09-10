import LayersPass from './layers-pass';
import {withParameters} from '@luma.gl/core';
import GL from '@luma.gl/constants';
import log from '../utils/log';

const PICKING_PARAMETERS = {
  blendFunc: [GL.ONE, GL.ZERO, GL.CONSTANT_ALPHA, GL.ZERO],
  blendEquation: GL.FUNC_ADD
};

export default class PickLayersPass extends LayersPass {
  render(props) {
    if (props.pickingFBO) {
      // When drawing into an off-screen buffer, use the alpha channel to encode layer index
      return this._drawPickingBuffer(props);
    }
    // When drawing to screen (debug mode), do not use the alpha channel so that result is always visible
    return super.render(props);
  }

  // Private
  // Draws list of layers and viewports into the picking buffer
  // Note: does not sample the buffer, that has to be done by the caller
  _drawPickingBuffer({
    layers,
    layerFilter,
    views,
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

    // Track encoded layer indices
    const encodedColors = !pickZ && {
      byLayer: new Map(),
      byAlpha: []
    };
    // Temporarily store it on the instance so that it can be accessed by this.getLayerParameters
    this._colors = encodedColors;

    // Make sure we clear scissor test and fbo bindings in case of exceptions
    // We are only interested in one pixel, no need to render anything else
    // Note that the callback here is called synchronously.
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    const renderStatus = withParameters(
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
      () =>
        super.render({
          target: pickingFBO,
          layers,
          layerFilter,
          views,
          viewports,
          onViewportActive,
          pass,
          redrawReason
        })
    );

    // Clear the temp field
    this._colors = null;
    const decodePickingColor =
      encodedColors &&
      (pickedColor => {
        const entry = encodedColors.byAlpha[pickedColor[3]];
        return (
          entry && {
            pickedLayer: entry.layer,
            pickedViewports: entry.viewports,
            pickedObjectIndex: entry.layer.decodePickingColor(pickedColor)
          }
        );
      });
    return {decodePickingColor, stats: renderStatus};
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

  getLayerParameters(layer, layerIndex, viewport) {
    let a = 255;
    const encodedColors = this._colors;

    if (encodedColors) {
      // Encode layerIndex in the alpha channel
      if (encodedColors.byLayer.has(layer)) {
        const entry = encodedColors.byLayer.get(layer);
        a = entry.a;
        entry.viewports.push(viewport);
      } else {
        a = encodedColors.byLayer.size + 1;
        if (a <= 255) {
          const entry = {a, layer, viewports: [viewport]};
          encodedColors.byLayer.set(layer, entry);
          encodedColors.byAlpha[a] = entry;
        } else {
          log.warn('Too many pickable layers, only picking the first 255')();
          a = 0;
        }
      }
    }

    // These will override any layer parameters
    const pickParameters = this.pickZ
      ? {blend: false}
      : {
          ...PICKING_PARAMETERS,
          blend: true,
          blendColor: [0, 0, 0, a / 255]
        };

    // Override layer parameters with pick parameters
    return {
      ...layer.props.parameters,
      ...pickParameters
    };
  }
}
