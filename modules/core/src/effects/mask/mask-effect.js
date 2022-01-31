import {Texture2D} from '@luma.gl/core';
// import {readPixelsToArray} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import MaskPass from '../../passes/mask-pass';
import Effect from '../../lib/effect';
import {OPERATION} from '../../lib/constants';
import {getMaskBounds, getMaskViewport} from './utils';
import log from '../../utils/log';

// Class to manage mask effect
export default class MaskEffect extends Effect {
  constructor(props) {
    super(props);
    this.dummyMaskMap = null;
    this.useInPicking = true;
    this.channels = [];
    this.masks = null;
  }

  preRender(gl, {layers, layerFilter, viewports, onViewportActive, views}) {
    if (!this.dummyMaskMap) {
      this.dummyMaskMap = new Texture2D(gl, {
        width: 1,
        height: 1
      });
    }

    const maskLayers = layers.filter(l => l.props.operation === OPERATION.MASK && l.props.visible);
    if (maskLayers.length === 0) {
      this.masks = null;
      this.channels.length = 0;
      return;
    }
    this.masks = {};

    if (!this.maskPass) {
      this.maskPass = new MaskPass(gl, {id: 'default-mask'});
      this.maskMap = this.maskPass.maskMap;
    }

    // Map layers to channels
    const channelMap = this._sortMaskChannels(maskLayers);
    // TODO - support multiple views
    const viewport = viewports[0];
    const viewportChanged = !this.lastViewport || !this.lastViewport.equals(viewport);

    for (const maskId in channelMap) {
      this._renderChannel(channelMap[maskId], {
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged
      });
    }

    // // Debug show FBO contents on screen
    // const color = readPixelsToArray(this.maskMap);
    // let canvas = document.getElementById('fbo-canvas');
    // if (!canvas) {
    //   canvas = document.createElement('canvas');
    //   canvas.id = 'fbo-canvas';
    //   canvas.width = this.maskMap.width;
    //   canvas.height = this.maskMap.height;
    //   canvas.style.zIndex = 100;
    //   canvas.style.position = 'absolute';
    //   canvas.style.right = 0;
    //   canvas.style.border = 'blue 1px solid';
    //   canvas.style.width = '256px';
    //   canvas.style.transform = 'scaleY(-1)';
    //   document.body.appendChild(canvas);
    // }
    // const ctx = canvas.getContext('2d');
    // const imageData = ctx.createImageData(this.maskMap.width, this.maskMap.height);
    // for (let i = 0; i < color.length; i += 4) {
    //   imageData.data[i + 0] = color[i + 0];
    //   imageData.data[i + 1] = color[i + 1];
    //   imageData.data[i + 2] = color[i + 2];
    //   imageData.data[i + 3] = color[i + 3] + 128;
    // }
    // ctx.putImageData(imageData, 0, 0);
  }

  _renderChannel(channelInfo, {layerFilter, onViewportActive, views, viewport, viewportChanged}) {
    const oldChannelInfo = this.channels[channelInfo.index];
    const maskChanged =
      // If a channel is new
      channelInfo === oldChannelInfo ||
      // If sublayers have changed
      oldChannelInfo.layers.length !== channelInfo.layers.length ||
      // If a sublayer's positions have been updated, the cached bounds will change shallowly
      channelInfo.layerBounds.some((b, i) => b !== oldChannelInfo.layerBounds[i]);

    channelInfo.bounds = oldChannelInfo.bounds;
    channelInfo.maskBounds = oldChannelInfo.maskBounds;
    this.channels[channelInfo.index] = channelInfo;

    if (maskChanged || viewportChanged) {
      // Recalculate mask bounds
      this.lastViewport = viewport;

      channelInfo.bounds = getMaskBounds({layers: channelInfo.layers, viewport});

      if (maskChanged || !equals(channelInfo.bounds, oldChannelInfo.bounds)) {
        // Rerender mask FBO
        const {maskPass, maskMap} = this;

        const maskViewport = getMaskViewport({
          bounds: channelInfo.bounds,
          viewport,
          width: maskMap.width,
          height: maskMap.height
        });

        channelInfo.maskBounds = maskViewport ? maskViewport.getBounds() : [0, 0, 1, 1];

        maskPass.render({
          channel: channelInfo.index,
          layers: channelInfo.layers,
          layerFilter,
          viewports: maskViewport ? [maskViewport] : [],
          onViewportActive,
          views,
          moduleParameters: {
            devicePixelRatio: 1
          }
        });
      }
    }

    this.masks[channelInfo.id] = {
      index: channelInfo.index,
      bounds: channelInfo.maskBounds,
      coordinateOrigin: channelInfo.coordinateOrigin,
      coordinateSystem: channelInfo.coordinateSystem
    };
  }

  /**
   * Find a channel to render each mask into
   * If a maskId already exists, diff and update the existing channel
   * Otherwise replace a removed mask
   * Otherwise create a new channel
   */
  _sortMaskChannels(maskLayers) {
    const channelMap = {};
    let channelCount = 0;
    for (const layer of maskLayers) {
      const {id} = layer.root;
      let channelInfo = channelMap[id];
      if (!channelInfo) {
        if (++channelCount > 4) {
          log.warn('Too many mask layers. The max supported is 4')();
          continue; // eslint-disable-line no-continue
        }
        channelInfo = {
          id,
          index: this.channels.findIndex(c => c?.id === id),
          layers: [],
          layerBounds: [],
          coordinateOrigin: layer.root.props.coordinateOrigin,
          coordinateSystem: layer.root.props.coordinateSystem
        };
        channelMap[id] = channelInfo;
      }
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
    }

    for (let i = 0; i < 4; i++) {
      const channelInfo = this.channels[i];
      if (!channelInfo || !(channelInfo.id in channelMap)) {
        // The mask id at this channel no longer exists
        this.channels[i] = null;
      }
    }

    for (const maskId in channelMap) {
      const channelInfo = channelMap[maskId];

      if (channelInfo.index < 0) {
        channelInfo.index = this.channels.findIndex(c => !c);
        this.channels[channelInfo.index] = channelInfo;
      }
    }
    return channelMap;
  }

  getModuleParameters() {
    return {
      maskMap: this.masks ? this.maskMap : this.dummyMaskMap,
      maskChannels: this.masks
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
    this.masks = null;
    this.channels.length = 0;
  }
}
