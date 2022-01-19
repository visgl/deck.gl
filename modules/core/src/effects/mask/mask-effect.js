import {
  log,
  Framebuffer,
  withParameters,
  Texture2D,
  ProgramManager,
  readPixelsToArray
} from '@luma.gl/core';
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
        dummyMaskMap: this.dummyMaskMap,
        devicePixelRatio: 1
      }
    });

    // Debug show FBO contents on screen
    const color = readPixelsToArray(maskMap);
    let canvas = document.getElementById('fbo-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fbo-canvas';
      canvas.width = maskMap.width;
      canvas.height = maskMap.height;
      canvas.style.zIndex = 100;
      canvas.style.position = 'absolute';
      canvas.style.right = 0;
      canvas.style.border = 'blue 1px solid';
      canvas.style.width = '256px';
      canvas.style.transform = 'scaleY(-1)';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(maskMap.width, maskMap.height);
    for (let i = 0; i < color.length; i += 4) {
      imageData.data[i + 0] = color[i + 0];
      imageData.data[i + 1] = color[i + 1];
      imageData.data[i + 2] = color[i + 2];
      imageData.data[i + 3] = color[i + 3];
    }
    ctx.putImageData(imageData, 0, 0);
  }

  getModuleParameters(layer) {
    const {internalState, props} = layer;
    const parameters = {
      dummyMaskMap: this.dummyMaskMap
    };
    if (props.maskEnabled) {
      // Infer by geometry if 'maskByInstance' prop isn't explictly set
      if (!('maskByInstance' in props)) {
        parameters.maskByInstance = 'instancePositions' in layer.getAttributeManager().attributes;
      }

      const {maskProjectionMatrix, maskProjectCenter} = splitMaskProjectionMatrix(
        getMaskProjectionMatrix(this.maskViewport),
        internalState.viewport,
        props
      );
      parameters.maskMap = this.maskMap;
      parameters.maskProjectCenter = maskProjectCenter;
      parameters.maskProjectionMatrix = maskProjectionMatrix;
    }
    return parameters;
  }

  cleanup() {}

  getMaskLayer(maskId, layers) {
    const maskLayer = layers.find(layer => layer.id === maskId);
    log.assert(maskLayer, `{maskId: '${maskId}'} must match the id of another Layer`);
    //log.assert(maskLayer instanceof SolidPolygonLayer, 'Mask Layer must be a SolidPolygonLayer');
    return maskLayer;
  }
}
