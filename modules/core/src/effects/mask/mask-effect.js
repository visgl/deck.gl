import {
  log,
  Texture2D,
  ProgramManager
  // readPixelsToArray
} from '@luma.gl/core';
import MaskPass from '../../passes/mask-pass';
import Effect from '../../lib/effect';
import {default as mask} from '../../shaderlib/mask/mask';
import {getDataViewport, getMaskProjectionMatrix, getMaskViewport} from './utils';

// Class to manage mask effect
export default class MaskEffect extends Effect {
  constructor(props) {
    super(props);
    this.programManager = null;
    this.dummyMaskMap = null;
    this.mask = false;
    this.enableForPicking = true;
  }

  preRender(gl, {layers, layerFilter, viewports, onViewportActive, views}) {
    const maskIds = new Set(
      layers.map(({props}) => props.maskId).filter(maskId => maskId !== undefined)
    );
    if (maskIds.size === 0) {
      return;
    }
    log.assert(maskIds.size === 1, 'Only one mask layer supported, but multiple maskIds specified');

    this.mask = true;
    const maskId = [...maskIds][0];

    const maskLayer = this.getMaskLayer(maskId, layers);
    if (!this.maskPass) {
      this.maskPass = new MaskPass(gl);
      this.maskMap = this.maskPass.maskMap;
    }
    if (!this.programManager) {
      this.programManager = ProgramManager.getDefaultProgramManager(gl);
      this.programManager.addDefaultModule(mask);
    }

    if (!this.dummyMaskMap) {
      this.dummyMaskMap = new Texture2D(gl, {
        width: 1,
        height: 1
      });
    }

    // Using the 'positions' attribute will work for the SolidPolygonLayer,
    // but not for all layers
    const {dummyMaskMap, maskPass, maskMap} = this;
    const layerViewport = viewports[0];
    const maskChanged = maskLayer.getChangeFlags().propsOrDataChanged;

    if (!this.dataViewport || maskChanged) {
      this.dataViewport = getDataViewport(maskLayer, maskMap);
    }

    const maskViewport = getMaskViewport(this.dataViewport, layerViewport, maskMap);
    if (!maskViewport.equals(this.maskViewport) || maskChanged) {
      this.maskViewport = maskViewport;
      this.maskProjectionMatrix = getMaskProjectionMatrix(this.maskViewport);

      maskPass.render({
        layers,
        layerFilter,
        viewports: [this.maskViewport],
        onViewportActive,
        views,
        moduleParameters: {
          dummyMaskMap,
          devicePixelRatio: 1
        }
      });

      // // Debug show FBO contents on screen
      // const color = readPixelsToArray(maskMap);
      // let canvas = document.getElementById('fbo-canvas');
      // if (!canvas) {
      //   canvas = document.createElement('canvas');
      //   canvas.id = 'fbo-canvas';
      //   canvas.width = maskMap.width;
      //   canvas.height = maskMap.height;
      //   canvas.style.zIndex = 100;
      //   canvas.style.position = 'absolute';
      //   canvas.style.right = 0;
      //   canvas.style.border = 'blue 1px solid';
      //   canvas.style.width = '256px';
      //   canvas.style.transform = 'scaleY(-1)';
      //   document.body.appendChild(canvas);
      // }
      // const ctx = canvas.getContext('2d');
      // const imageData = ctx.createImageData(maskMap.width, maskMap.height);
      // for (let i = 0; i < color.length; i += 4) {
      //   imageData.data[i + 0] = color[i + 0];
      //   imageData.data[i + 1] = color[i + 1];
      //   imageData.data[i + 2] = color[i + 2];
      //   imageData.data[i + 3] = color[i + 3];
      // }
      // ctx.putImageData(imageData, 0, 0);
    }
  }

  getModuleParameters(layer) {
    if (!this.mask) {
      return {};
    }

    const {props} = layer;
    const parameters = {
      dummyMaskMap: this.dummyMaskMap
    };
    if (props.maskId) {
      // Infer by geometry if 'maskByInstance' prop isn't explictly set
      const attributeManager = layer.getAttributeManager();
      if (attributeManager && !('maskByInstance' in props)) {
        parameters.maskByInstance = 'instancePositions' in attributeManager.attributes;
      }
      if (!('maskEnabled' in props)) {
        parameters.maskEnabled = true;
      }

      parameters.maskMap = this.maskMap;
      parameters.maskProjectionMatrix = this.maskProjectionMatrix;
    }
    return parameters;
  }

  cleanup() {
    if (this.dummyMaskMap) {
      this.dummyMaskMap.delete();
      this.dummyMaskMap = null;
    }

    if (this.maskPass) {
      this.maskPass.delete();
      this.maskPass = null;
      this.maskMap = null;
    }
    if (this.mask && this.programManager) {
      this.programManager.removeDefaultModule(mask);
      this.programManager = null;
    }

    this.dataViewport = null;
    this.maskViewport = null;
    this.maskProjectionMatrix = null;
  }

  getMaskLayer(maskId, layers) {
    const maskLayer = layers.find(layer => layer.id === maskId);
    log.assert(maskLayer, `{maskId: '${maskId}'} must match the id of another Layer`);
    log.assert(
      maskLayer.constructor.layerName === 'SolidPolygonLayer',
      'Mask Layer must be a SolidPolygonLayer'
    );
    return maskLayer;
  }
}
