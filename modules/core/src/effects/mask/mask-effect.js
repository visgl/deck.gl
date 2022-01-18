import {log, Framebuffer, withParameters, Texture2D, ProgramManager} from '@luma.gl/core';
import {Matrix4, Vector3} from '@math.gl/core';
//import {SolidPolygonLayer} from '@deck.gl/layers';
import DrawLayersPass from '../../passes/draw-layers-pass';
import Effect from '../../lib/effect';
import {shaderModuleVs, shaderModuleFs} from './shader-module';
import {getMaskProjectionMatrix, getMaskViewport, splitMaskProjectionMatrix} from './utils';

// Class to manage mask effect
export default class MaskEffect extends Effect {
  constructor(props) {
    super(props);
  }

  preRender(gl, {layers, layerFilter, viewports, onViewportActive, views}) {
    if (layers.length === 0) return;
    // Hardcode for now
    const maskEnabled = true;
    const maskId = 'county-mask';

    const maskLayer = this.getMaskLayer(maskId, layers);
    if (!this.maskFBO) {
      this.maskFBO = this.createFBO(gl);
    }
    if (!this.drawLayersPass) {
      this.drawLayersPass = new DrawLayersPass(gl);
    }
    const {drawLayersPass, maskFBO} = this;

    // Using the 'positions' attribute will work for the PolygonLayer,
    // but not for all layers
    const {positions} = maskLayer.state.attributeManager.attributes;
    const layerViewport = viewports[0];
    const maskViewport = getMaskViewport(positions, layerViewport, maskFBO);

    withParameters(gl, {framebuffer: maskFBO}, () => {
      drawLayersPass.render({
        target: maskFBO,
        layers: [maskLayer],
        layerFilter,
        viewports: [maskViewport],
        onViewportActive,
        moduleParameters: {
          devicePixelRatio: 1
        }
      });
    });
  }

  getModuleParameters(layer) {
    return {};
  }

  cleanup() {}

  createFBO(gl) {
    const [width, height] = [2048, 2048];
    return new Framebuffer(gl, {width, height, depth: false});
  }

  getShaders() {
    // If `maskByInstance: true`, the entire object is shown/hidden based on its anchor position (done by vertex shader)
    // Otherwise, the object is trimmed by the mask bounds (done by fragment shader)

    // Default behavior: consider a layer instanced if it has attribute `instancePositions`
    let maskByInstance = 'instancePositions' in this.getAttributeManager().attributes;
    // Users can override by setting the `maskByInstance` prop
    if ('maskByInstance' in this.props) {
      maskByInstance = this.props.maskByInstance;
    }

    return {
      modules: [maskByInstance ? shaderModuleVs : shaderModuleFs]
    };
  }

  getMaskLayer(maskId, layers) {
    const maskLayer = layers.find(layer => layer.id === maskId);
    log.assert(maskLayer, `{maskId: '${maskId}'} must match the id of another Layer`);
    //log.assert(maskLayer instanceof SolidPolygonLayer, 'Mask Layer must be a SolidPolygonLayer');
    return maskLayer;
  }
}
