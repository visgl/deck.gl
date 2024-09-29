// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Device, Framebuffer, Texture} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {Effect, EffectContext, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollisionFilterPass from './collision-filter-pass';
import {MaskPreRenderStats} from '../mask/mask-effect';
// import {debugFBO} from '../utils/debug';

import type {CollisionFilterExtensionProps} from './collision-filter-extension';
import type {CollisionModuleProps} from './shader-module';

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

  private context?: EffectContext;
  private channels: Record<string, RenderInfo> = {};
  private collisionFilterPass?: CollisionFilterPass;
  private collisionFBOs: Record<string, Framebuffer> = {};
  private dummyCollisionMap?: Texture;
  private lastViewport?: Viewport;

  setup(context: EffectContext) {
    this.context = context;
    const {device} = context;
    this.dummyCollisionMap = device.createTexture({width: 1, height: 1});
    this.collisionFilterPass = new CollisionFilterPass(device, {id: 'default-collision-filter'});
  }

  preRender({
    effects: allEffects,
    layers,
    layerFilter,
    viewports,
    onViewportActive,
    views,
    isPicking,
    preRenderStats = {}
  }: PreRenderOptions): void {
    // This can only be called in preRender() after setup() where context is populated
    const {device} = this.context!;

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

    // Detect if mask has rendered. TODO: better dependency system for Effects
    const effects = allEffects?.filter(e => e.useInPicking && preRenderStats[e.id]);
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
      // @ts-expect-error TODO - assuming WebGL context
      const [width, height] = device.canvasContext.getPixelSize();
      collisionFBO.resize({
        width: width / DOWNSCALE,
        height: height / DOWNSCALE
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
      this.collisionFilterPass!.renderCollisionMap(collisionFBO, {
        pass: 'collision-filter',
        isPicking: true,
        layers: renderInfo.layers,
        effects,
        layerFilter,
        viewports: viewport ? [viewport] : [],
        onViewportActive,
        views,
        shaderModuleProps: {
          collision: {
            enabled: true,
            // To avoid feedback loop forming between Framebuffer and active Texture.
            dummyCollisionMap: this.dummyCollisionMap
          },
          project: {
            // @ts-expect-error TODO - assuming WebGL context
            devicePixelRatio: collisionFBO.device.canvasContext.getDevicePixelRatio() / DOWNSCALE
          }
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
      const collisionGroup = layer.props.collisionGroup!;
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

  getShaderModuleProps(layer: Layer): {
    collision: CollisionModuleProps;
  } {
    const {collisionGroup, collisionEnabled} = (layer as Layer<CollisionFilterExtensionProps>)
      .props;
    const {collisionFBOs, dummyCollisionMap} = this;
    const collisionFBO = collisionFBOs[collisionGroup!];
    const enabled = collisionEnabled && Boolean(collisionFBO);
    return {
      collision: {
        enabled,
        collisionFBO,
        dummyCollisionMap: dummyCollisionMap!
      }
    };
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

    // @ts-ignore
    const depthStencilAttachment = device.createTexture({
      format: 'depth16unorm',
      width,
      height,
      mipmaps: false
    });
    this.collisionFBOs[collisionGroup] = device.createFramebuffer({
      id: `collision-${collisionGroup}`,
      width,
      height,
      colorAttachments: [collisionMap],
      depthStencilAttachment
    });
  }

  destroyFBO(collisionGroup: string) {
    const fbo = this.collisionFBOs[collisionGroup];
    fbo.colorAttachments[0]?.destroy();
    fbo.depthStencilAttachment?.destroy();
    fbo.destroy();
    delete this.collisionFBOs[collisionGroup];
  }
}
