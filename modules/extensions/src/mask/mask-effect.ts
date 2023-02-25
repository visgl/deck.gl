import {Layer, Viewport, Effect, PreRenderOptions, CoordinateSystem, log} from '@deck.gl/core';
import {Texture2D} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import MaskPass from './mask-pass';
import {joinLayerBounds, getRenderBounds, makeViewport, Bounds} from '../utils/projection-utils';
// import {debugFBO} from '../utils/debug';

type Mask = {
  /** The channel index */
  index: number;
  bounds: Bounds;
  coordinateOrigin: [number, number, number];
  coordinateSystem: CoordinateSystem;
};

type Channel = {
  id: string;
  index: number;
  layers: Layer[];
  bounds: Bounds | null;
  maskBounds: Bounds;
  layerBounds: Bounds[];
  coordinateOrigin: [number, number, number];
  coordinateSystem: CoordinateSystem;
};

export type MaskPreRenderStats = {
  didRender: boolean;
};

// Class to manage mask effect
export default class MaskEffect implements Effect {
  id = 'mask-effect';
  props = null;
  useInPicking = true;
  order = 0;

  private dummyMaskMap?: Texture2D;
  private channels: (Channel | null)[] = [];
  private masks: Record<string, Mask> | null = null;
  private maskPass?: MaskPass;
  private maskMap?: Texture2D;
  private lastViewport?: Viewport;

  preRender(
    gl: WebGLRenderingContext,
    {layers, layerFilter, viewports, onViewportActive, views, isPicking}: PreRenderOptions
  ): MaskPreRenderStats {
    let didRender = false;
    if (!this.dummyMaskMap) {
      this.dummyMaskMap = new Texture2D(gl, {
        width: 1,
        height: 1
      });
    }

    if (isPicking) {
      // Do not update on picking pass
      return {didRender};
    }

    const maskLayers = layers.filter(l => l.props.visible && l.props.operation.includes('mask'));
    if (maskLayers.length === 0) {
      this.masks = null;
      this.channels.length = 0;
      return {didRender};
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

    if (viewport.resolution !== undefined) {
      log.warn('MaskExtension is not supported in GlobeView')();
      return {didRender};
    }

    for (const maskId in channelMap) {
      const result = this._renderChannel(channelMap[maskId], {
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged
      });
      didRender ||= result;
    }

    // debugFBO(this.maskMap, {opaque: true});
    return {didRender};
  }

  private _renderChannel(
    channelInfo: Channel,
    {
      layerFilter,
      onViewportActive,
      views,
      viewport,
      viewportChanged
    }: {
      layerFilter: PreRenderOptions['layerFilter'];
      onViewportActive: PreRenderOptions['onViewportActive'];
      views: PreRenderOptions['views'];
      viewport: Viewport;
      viewportChanged: boolean;
    }
  ): boolean {
    let didRender = false;
    const oldChannelInfo = this.channels[channelInfo.index];
    if (!oldChannelInfo) {
      return didRender;
    }

    const maskChanged =
      // If a channel is new
      channelInfo === oldChannelInfo ||
      // If sublayers have changed
      channelInfo.layers.length !== oldChannelInfo.layers.length ||
      channelInfo.layers.some(
        (layer, i) =>
          // Layer instance is updated
          // Layer props might have changed
          // Undetermined props could have an effect on the output geometry of a mask layer,
          // for example getRadius+updateTriggers, radiusScale, modelMatrix
          layer !== oldChannelInfo.layers[i] ||
          // Some prop is in transition
          layer.props.transitions
      ) ||
      // If a sublayer's positions have been updated, the cached bounds will change shallowly
      channelInfo.layerBounds.some((b, i) => b !== oldChannelInfo.layerBounds[i]);

    channelInfo.bounds = oldChannelInfo.bounds;
    channelInfo.maskBounds = oldChannelInfo.maskBounds;
    this.channels[channelInfo.index] = channelInfo;

    if (maskChanged || viewportChanged) {
      // Recalculate mask bounds
      this.lastViewport = viewport;

      const layerBounds = joinLayerBounds(channelInfo.layers, viewport);
      channelInfo.bounds = layerBounds && getRenderBounds(layerBounds, viewport);

      if (maskChanged || !equals(channelInfo.bounds, oldChannelInfo.bounds)) {
        // Rerender mask FBO
        const {maskPass, maskMap} = this;

        const maskViewport =
          layerBounds &&
          makeViewport({
            bounds: channelInfo.bounds!,
            viewport,
            width: maskMap.width,
            height: maskMap.height,
            border: 1
          });

        channelInfo.maskBounds = maskViewport ? maskViewport.getBounds() : [0, 0, 1, 1];

        // @ts-ignore (2532) This method is only called from preRender where maskPass is defined
        maskPass.render({
          pass: 'mask',
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

        didRender = true;
      }
    }

    // @ts-ignore (2532) This method is only called from preRender where masks is defined
    this.masks[channelInfo.id] = {
      index: channelInfo.index,
      bounds: channelInfo.maskBounds,
      coordinateOrigin: channelInfo.coordinateOrigin,
      coordinateSystem: channelInfo.coordinateSystem
    };

    return didRender;
  }

  /**
   * Find a channel to render each mask into
   * If a maskId already exists, diff and update the existing channel
   * Otherwise replace a removed mask
   * Otherwise create a new channel
   * Returns a map from mask layer id to channel info
   */
  private _sortMaskChannels(maskLayers: Layer[]): Record<string, Channel> {
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

  getModuleParameters(): {
    maskMap: Texture2D;
    maskChannels: Record<string, Mask> | null;
  } {
    return {
      maskMap: this.masks ? this.maskMap : this.dummyMaskMap,
      maskChannels: this.masks
    };
  }

  cleanup(): void {
    if (this.dummyMaskMap) {
      this.dummyMaskMap.delete();
      this.dummyMaskMap = undefined;
    }

    if (this.maskPass) {
      this.maskPass.delete();
      this.maskPass = undefined;
      this.maskMap = undefined;
    }

    this.lastViewport = undefined;
    this.masks = null;
    this.channels.length = 0;
  }
}
