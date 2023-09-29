import {Device, Framebuffer, Texture} from '@luma.gl/core';
import {WEBGLRenderbuffer} from '@luma.gl/webgl';
import {equals} from '@math.gl/core';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {Effect, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollisionFilterPass from './collision-filter-pass';
import MaskEffect, {MaskPreRenderStats} from '../mask/mask-effect';
// import {debugFBO} from '../utils/debug';

type CollisionFilterExtensionProps = {
  collisionTestProps?: {};
  collisionGroup: string;
};

// Factor by which to downscale Collision FBO relative to canvas
const DOWNSCALE = 2;

type RenderInfo = {
  collisionGroup: string;
  layers: Layer<CollisionFilterExtensionProps>[];
  layerBounds: ([number[], number[]] | null)[];
  allLayersLoaded: boolean;
};

export default class CollisionFilterEffect implements Effect {
  id = 'collision-filter-effect';
  props = null;
  useInPicking = true;
  order = 1;

  private channels: Record<string, RenderInfo> = {};
  private collisionFilterPass?: CollisionFilterPass;
  private collisionFBOs: Record<string, Framebuffer> = {};
  private dummyCollisionMap?: Texture;
  private lastViewport?: Viewport;

  preRender(
    device: Device,
    {
      effects: allEffects,
      layers,
      layerFilter,
      viewports,
      onViewportActive,
      views,
      isPicking,
      preRenderStats = {}
    }: PreRenderOptions
  ): void {
    if (!this.dummyCollisionMap) {
      this.dummyCollisionMap = device.createTexture({width: 1, height: 1});
    }

    if (isPicking) {
      // Do not update on picking pass
      return;
    }

    const collisionLayers = layers.filter(
      // @ts-ignore
      ({props: {visible, collisionEnabled}}) => visible && collisionEnabled
    ) as Layer<CollisionFilterExtensionProps>[];
    if (collisionLayers.length === 0) {
      this.channels = {};
      return;
    }

    if (!this.collisionFilterPass) {
      this.collisionFilterPass = new CollisionFilterPass(device, {id: 'default-collision-filter'});
    }

    // Detect if mask has rendered. TODO: better dependency system for Effects
    const effects = allEffects?.filter(e => e.constructor === MaskEffect);
    const maskEffectRendered = (preRenderStats['mask-effect'] as MaskPreRenderStats)?.didRender;

    // Collect layers to render
    const channels = this._groupByCollisionGroup(device, collisionLayers);

    const viewport = viewports[0];
    const viewportChanged =
      !this.lastViewport || !this.lastViewport.equals(viewport) || maskEffectRendered;

    // Resize framebuffers to match canvas
    for (const collisionGroup in channels) {
      const collisionFBO = this.collisionFBOs[collisionGroup];
      const renderInfo = channels[collisionGroup];
      const [width, height] = device.canvasContext.getPixelSize();
      collisionFBO.resize({
        // @ts-expect-error
        width: device.gl.canvas.width / DOWNSCALE,
        // @ts-expect-error
        height: device.gl.canvas.height / DOWNSCALE
      });
      this._render(renderInfo, {
        effects,
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged
      });
    }

    // debugFBO(this.collisionFBOs[Object.keys(channels)[0]], {minimap: true});
  }

  private _render(
    renderInfo: RenderInfo,
    {
      effects,
      layerFilter,
      onViewportActive,
      views,
      viewport,
      viewportChanged
    }: {
      effects: PreRenderOptions['effects'];
      layerFilter: PreRenderOptions['layerFilter'];
      onViewportActive: PreRenderOptions['onViewportActive'];
      views: PreRenderOptions['views'];
      viewport: Viewport;
      viewportChanged: boolean;
    }
  ) {
    const {collisionGroup} = renderInfo;
    const oldRenderInfo = this.channels[collisionGroup];
    if (!oldRenderInfo) {
      return;
    }

    const needsRender =
      viewportChanged ||
      // If render info is new
      renderInfo === oldRenderInfo ||
      // If sublayers have changed
      !deepEqual(oldRenderInfo.layers, renderInfo.layers, 1) ||
      // If a sublayer's bounds have been updated
      renderInfo.layerBounds.some((b, i) => !equals(b, oldRenderInfo.layerBounds[i])) ||
      // If a sublayer's isLoaded state has been updated
      renderInfo.allLayersLoaded !== oldRenderInfo.allLayersLoaded ||
      // Some prop is in transition
      renderInfo.layers.some(layer => layer.props.transitions);

    this.channels[collisionGroup] = renderInfo;

    if (needsRender) {
      this.lastViewport = viewport;
      const collisionFBO = this.collisionFBOs[collisionGroup];

      // Rerender collision FBO
      this.collisionFilterPass.renderCollisionMap(collisionFBO, {
        pass: 'collision-filter',
        isPicking: true,
        layers: renderInfo.layers,
        effects,
        layerFilter,
        viewports: viewport ? [viewport] : [],
        onViewportActive,
        views,
        moduleParameters: {
          // To avoid feedback loop forming between Framebuffer and active Texture.
          dummyCollisionMap: this.dummyCollisionMap,
          devicePixelRatio: collisionFBO.device.canvasContext.getDevicePixelRatio() / DOWNSCALE
        }
      });
    }
  }

  /**
   * Group layers by collisionGroup
   * Returns a map from collisionGroup to render info
   */
  private _groupByCollisionGroup(
    device: Device,
    collisionLayers: Layer<CollisionFilterExtensionProps>[]
  ): Record<string, RenderInfo> {
    const channelMap = {};
    for (const layer of collisionLayers) {
      const {collisionGroup} = layer.props;
      let channelInfo = channelMap[collisionGroup];
      if (!channelInfo) {
        channelInfo = {collisionGroup, layers: [], layerBounds: [], allLayersLoaded: true};
        channelMap[collisionGroup] = channelInfo;
      }
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
      if (!layer.isLoaded) {
        channelInfo.allLayersLoaded = false;
      }
    }

    // Create any new passes and remove any old ones
    for (const collisionGroup of Object.keys(channelMap)) {
      if (!this.collisionFBOs[collisionGroup]) {
        this.createFBO(device, collisionGroup);
      }
      if (!this.channels[collisionGroup]) {
        this.channels[collisionGroup] = channelMap[collisionGroup];
      }
    }
    for (const collisionGroup of Object.keys(this.collisionFBOs)) {
      if (!channelMap[collisionGroup]) {
        this.destroyFBO(collisionGroup);
      }
    }

    return channelMap;
  }

  getModuleParameters(layer: Layer): {
    collisionFBO: Framebuffer;
    dummyCollisionMap: Texture;
  } {
    const {collisionGroup} = (layer as Layer<CollisionFilterExtensionProps>).props;
    const {collisionFBOs, dummyCollisionMap} = this;
    return {collisionFBO: collisionFBOs[collisionGroup], dummyCollisionMap};
  }

  cleanup(): void {
    if (this.dummyCollisionMap) {
      this.dummyCollisionMap.delete();
      this.dummyCollisionMap = undefined;
    }
    this.channels = {};
    for (const collisionGroup of Object.keys(this.collisionFBOs)) {
      this.destroyFBO(collisionGroup);
    }
    this.collisionFBOs = {};
    this.lastViewport = undefined;
  }

  createFBO(device: Device, collisionGroup: string) {
    // @ts-expect-error
    const {width, height} = device.gl.canvas;
    const collisionMap = device.createTexture({
      format: 'rgba8unorm',
      width,
      height,
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge'
      }
    });

    const depthBuffer = new WEBGLRenderbuffer(
      // @ts-expect-error TODO v9 needs to be WebGLDevice
      device,
      {format: 'depth16', width, height}
    );
    this.collisionFBOs[collisionGroup] = device.createFramebuffer({
      id: `collision-${collisionGroup}`,
      width,
      height,
      colorAttachments: [collisionMap],
      // @ts-expect-error TODO v9 doesn't handle renderbuffers well
      depthStencilAttachment: depthBuffer
    });
  }

  destroyFBO(collisionGroup: string) {
    const fbo = this.collisionFBOs[collisionGroup];
    // @ts-expect-error
    const attachments = fbo.attachments as Texture[];
    for (const attachment of Object.values(attachments)) {
      attachment.delete();
    }
    fbo.delete();
    delete this.collisionFBOs[collisionGroup];
  }
}
