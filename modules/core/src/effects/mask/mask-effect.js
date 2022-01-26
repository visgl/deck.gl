import {
  Texture2D
  // , readPixelsToArray
} from '@luma.gl/core';
import MaskPass from '../../passes/mask-pass';
import Effect from '../../lib/effect';
import {OPERATION} from '../../lib/constants';
import {getMaskBounds, getMaskViewport} from './utils';

// Class to manage mask effect
export default class MaskEffect extends Effect {
  constructor(props) {
    super(props);
    this.dummyMaskMap = null;
    this.empty = true;
    this.useInPicking = true;
  }

  preRender(gl, {layers, layerFilter, viewports, onViewportActive, views}) {
    if (!this.dummyMaskMap) {
      this.dummyMaskMap = new Texture2D(gl, {
        width: 1,
        height: 1
      });
    }

    const maskLayers = layers.filter(l => l.props.operation === OPERATION.MASK);
    if (maskLayers.length === 0) {
      this.empty = true;
      return;
    }
    this.empty = false;

    if (!this.maskPass) {
      // TODO - support multiple masks
      this.maskPass = new MaskPass(gl, {id: 'default-mask'});
      this.maskMap = this.maskPass.maskMap;
    }

    // When the mask layer is changed the LayerManager will create a new instance
    const oldMaskLayers = this.maskLayers;
    const maskChanged =
      !oldMaskLayers ||
      oldMaskLayers.length !== maskLayers.length ||
      maskLayers.some((l, i) => l !== oldMaskLayers[i]);

    // To do: support multiple views
    const viewport = viewports[0];

    if (maskChanged || !this.lastViewport || !viewport.equals(this.lastViewport)) {
      // Update mask FBO
      const {maskPass, maskMap} = this;
      this.lastViewport = viewport;
      this.maskLayers = maskLayers;

      const bounds = getMaskBounds({layers: maskLayers, viewport});

      const maskViewport = getMaskViewport({
        bounds,
        viewport,
        width: maskMap.width,
        height: maskMap.height
      });
      this.maskBounds = maskViewport.getBounds();

      maskPass.render({
        layers,
        layerFilter,
        viewports: [maskViewport],
        onViewportActive,
        views,
        moduleParameters: {
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

  getModuleParameters() {
    return {
      maskMap: this.empty ? this.dummyMaskMap : this.maskMap,
      maskBounds: this.maskBounds
    };
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

    this.lastViewport = null;
    this.maskBounds = null;
    this.empty = true;
  }
}
