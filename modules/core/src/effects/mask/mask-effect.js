import {log, Framebuffer, withParameters, Texture2D, ProgramManager} from '@luma.gl/core';
import {Matrix4, Vector3} from '@math.gl/core';
//import {SolidPolygonLayer} from '@deck.gl/layers';
import MaskPass from '../../passes/mask-pass';
import Effect from '../../lib/effect';
import {shaderModuleVs, shaderModuleFs} from '../../shaderlib/mask/mask';
import {getMaskProjectionMatrix, getMaskViewport, splitMaskProjectionMatrix} from './utils';

// Class to manage mask effect
export default class MaskEffect extends Effect {
  constructor(props) {
    super(props);
    this.programManager = null;
    this.dummyMaskMap = null;
  }

  preRender(gl, {layers, layerFilter, viewports, onViewportActive, views}) {
    if (layers.length === 0) return;
    // Hardcode for now
    const maskEnabled = true;
    const maskId = 'county-mask';

    const maskLayer = this.getMaskLayer(maskId, layers);
    if (!this.maskPass) {
      this.maskPass = new MaskPass(gl);
      this.maskMap = this.maskPass.maskMap;
    }
    const {maskPass, maskMap} = this;
    if (!this.programManager) {
      this.programManager = ProgramManager.getDefaultProgramManager(gl);
      if (shaderModuleFs) {
        this.programManager.addDefaultModule(shaderModuleFs);
      }
    }

    if (!this.dummyMaskMap) {
      this.dummyMaskMap = new Texture2D(gl, {
        width: 1,
        height: 1
      });
    }

    // Using the 'positions' attribute will work for the PolygonLayer,
    // but not for all layers
    const {positions} = maskLayer.state.attributeManager.attributes;
    const layerViewport = viewports[0];
    this.maskViewport = getMaskViewport(positions, layerViewport, maskMap);

    maskPass.render({
      layers,
      layerFilter,
      viewports: [this.maskViewport],
      onViewportActive,
      views, // ?? remove?
      moduleParameters: {
        dummyMaskMap: this.dummyMaskMap
      }
    });
  }

  getModuleParameters(layer) {
    return {
      dummyMaskMap: this.dummyMaskMap
    };
  }

  cleanup() {}

  getMaskLayer(maskId, layers) {
    const maskLayer = layers.find(layer => layer.id === maskId);
    log.assert(maskLayer, `{maskId: '${maskId}'} must match the id of another Layer`);
    //log.assert(maskLayer instanceof SolidPolygonLayer, 'Mask Layer must be a SolidPolygonLayer');
    return maskLayer;
  }
}
