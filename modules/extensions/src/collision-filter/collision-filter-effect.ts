// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Device, Framebuffer, Texture} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {Effect, EffectContext, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollisionFilterPass from './collision-filter-pass';
import {placeTextLabels} from './text-collision-placement';
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
  pickingColorOffsets: Record<string, number>;
  hasText: boolean;
  greedy: boolean;
  objectCount: number;
};

// Sublayers of a composite share source object indices (e.g. text and its background).
function getCollisionSourceId(layer: Layer): string {
  return layer.parent?.id || layer.id;
}

export default class CollisionFilterEffect implements Effect {
  id = 'collision-filter-effect';
  props = null;
  useInPicking = true;
  order = 1;

  private context?: EffectContext;
  private channels: Record<string, RenderInfo> = {};
  private collisionFilterPass?: CollisionFilterPass;
  private collisionFBOs: Record<string, Framebuffer> = {};
  private visibilityFBOs: Record<string, Framebuffer> = {};
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
      ({isComposite, props: {visible, collisionEnabled}}) =>
        !isComposite && visible && collisionEnabled
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
      const [width, height] = device.canvasContext.getDrawingBufferSize();
      const oldWidth = collisionFBO.width;
      const oldHeight = collisionFBO.height;
      collisionFBO.resize({
        width: width / (renderInfo.hasText ? 1 : DOWNSCALE),
        height: height / (renderInfo.hasText ? 1 : DOWNSCALE)
      });
      this._render(renderInfo, {
        effects,
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged:
          viewportChanged || oldWidth !== collisionFBO.width || oldHeight !== collisionFBO.height
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

      const textLayers = renderInfo.layers.filter(
        layer => 'getCollisionRect' in layer.props || 'getBoundingRect' in layer.props
      );
      const otherLayers = renderInfo.layers.filter(layer => !textLayers.includes(layer));
      const renderOptions = {
        pass: 'collision-filter',
        isPicking: true,
        layers: renderInfo.layers,
        effects: [...(effects || []), this],
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
            devicePixelRatio:
              collisionFBO.device.canvasContext!.cssToDeviceRatio() /
              (renderInfo.hasText ? 1 : DOWNSCALE)
          }
        }
      };
      if (!renderInfo.greedy || otherLayers.length) {
        this.collisionFilterPass!.renderCollisionMap(collisionFBO, {
          ...renderOptions,
          layers: renderInfo.greedy ? otherLayers : renderInfo.layers
        });
      }
      if (renderInfo.hasText) {
        const visibilityFBO = this.visibilityFBOs[collisionGroup];
        const pixelRatio = collisionFBO.device.canvasContext!.cssToDeviceRatio();
        this.collisionFilterPass!.renderCollisionVisibility(visibilityFBO, {
          pass: 'collision',
          isPicking: true,
          layers: textLayers,
          effects: [...(effects || []), this],
          layerFilter,
          viewports: [viewport],
          onViewportActive,
          views,
          shaderModuleProps: {
            collision: {
              enabled: true,
              hasColliders: !renderInfo.greedy || otherLayers.length > 0,
              dummyCollisionMap: this.dummyCollisionMap
            },
            project: {devicePixelRatio: pixelRatio}
          }
        });
        if (renderInfo.greedy) {
          const pixels = collisionFBO.device.readPixelsToArrayWebGL(visibilityFBO) as Uint8Array;
          placeTextLabels(
            pixels,
            visibilityFBO.width,
            renderInfo.objectCount,
            viewport.width * pixelRatio,
            viewport.height * pixelRatio
          );
          visibilityFBO.colorAttachments[0].texture.writeData(pixels);
          // Non-text layers retain their existing collision-map sampling. Only accepted
          // labels may write into that map, so rejected labels cannot hide those features.
          if (otherLayers.length) {
            this.collisionFilterPass!.renderCollisionMap(collisionFBO, {
              ...renderOptions,
              shaderModuleProps: {
                ...renderOptions.shaderModuleProps,
                collision: {...renderOptions.shaderModuleProps.collision, filterByVisibility: true}
              }
            });
          }
        }
      }
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
        channelInfo = {
          collisionGroup,
          layers: [],
          layerBounds: [],
          allLayersLoaded: true,
          pickingColorOffsets: {},
          hasText: false,
          greedy: false,
          objectCount: 0
        };
        channelMap[collisionGroup] = channelInfo;
      }
      const isTextLayer = 'getCollisionRect' in layer.props || 'getBoundingRect' in layer.props;
      channelInfo.hasText ||= isTextLayer;
      channelInfo.greedy ||= isTextLayer && Boolean(layer.props.collisionGreedy);
      const sourceId = getCollisionSourceId(layer);
      channelInfo.pickingColorOffsets[sourceId] = Math.max(
        channelInfo.pickingColorOffsets[sourceId] || 0,
        'getCollisionRect' in layer.props && layer.props.startIndices
          ? layer.props.startIndices.length - 1
          : layer.getNumInstances()
      );
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
      if (!layer.isLoaded) {
        channelInfo.allLayersLoaded = false;
      }
    }

    // Create any new passes and remove any old ones
    for (const collisionGroup of Object.keys(channelMap)) {
      // Reserve disjoint picking colors for each source layer. Object 0 from one
      // layer must not match object 0 from another layer in the same group.
      const offsets = channelMap[collisionGroup].pickingColorOffsets;
      let offset = 0;
      for (const sourceId in offsets) {
        const count = offsets[sourceId];
        offsets[sourceId] = offset;
        offset += count;
      }
      channelMap[collisionGroup].objectCount = offset;
      if (channelMap[collisionGroup].hasText) {
        const width = Math.min(
          device.limits.maxTextureDimension2D,
          Math.ceil(Math.sqrt(offset + 1)) * 4
        );
        const height = Math.ceil((offset + 1) / (width / 4)) * 4;
        if (!this.visibilityFBOs[collisionGroup]) {
          this.visibilityFBOs[collisionGroup] = device.createFramebuffer({
            id: `collision-visibility-${collisionGroup}`,
            width,
            height,
            colorAttachments: [
              device.createTexture({
                width,
                height,
                format: 'rgba8unorm',
                sampler: {minFilter: 'nearest', magFilter: 'nearest'}
              })
            ]
          });
        } else {
          this.visibilityFBOs[collisionGroup].resize({width, height});
        }
      }
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
    const props = (layer as Layer<CollisionFilterExtensionProps & Partial<CollisionModuleProps>>)
      .props;
    const {collisionGroup, collisionEnabled} = props;
    const testProps = props.collisionTestProps as Partial<CollisionModuleProps>;
    const {collisionFBOs, dummyCollisionMap} = this;
    const collisionFBO = collisionFBOs[collisionGroup!];
    const enabled = collisionEnabled && Boolean(collisionFBO);
    const isTextLayer = 'getCollisionRect' in props || 'getBoundingRect' in props;
    return {
      collision: {
        enabled,
        greedy: this.channels[collisionGroup!]?.greedy || false,
        isTextLayer,
        pickingColorOffset:
          this.channels[collisionGroup!]?.pickingColorOffsets[getCollisionSourceId(layer)] || 0,
        collisionFBO,
        visibilityFBO: isTextLayer ? this.visibilityFBOs[collisionGroup!] : undefined,
        dummyCollisionMap: dummyCollisionMap!,
        // Match collisionTestProps sizing when projecting text collision bounds.
        sizeScale: testProps?.sizeScale ?? props.sizeScale,
        sizeMinPixels: testProps?.sizeMinPixels ?? props.sizeMinPixels,
        sizeMaxPixels: testProps?.sizeMaxPixels ?? props.sizeMaxPixels,
        sizeUnits: testProps?.sizeUnits ?? props.sizeUnits
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
    const {width, height} = device.getDefaultCanvasContext().canvas;
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

    const depthStencilAttachment = device.createTexture({
      format: 'depth16unorm',
      width,
      height,
      sampler: {minFilter: 'nearest', magFilter: 'nearest'}
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
    const visibilityFBO = this.visibilityFBOs[collisionGroup];
    if (visibilityFBO) {
      visibilityFBO.colorAttachments[0].destroy();
      visibilityFBO.destroy();
      delete this.visibilityFBOs[collisionGroup];
    }
  }
}
