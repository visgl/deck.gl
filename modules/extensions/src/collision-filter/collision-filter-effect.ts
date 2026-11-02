// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Device, Framebuffer, Texture} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import {_deepEqual as deepEqual, log} from '@deck.gl/core';
import type {Effect, EffectContext, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollisionFilterPass from './collision-filter-pass';
import {MaskPreRenderStats} from '../mask/mask-effect';
// import {debugFBO} from '../utils/debug';

import type {CollisionFilterExtensionProps} from './collision-filter-extension';
import type {CollisionModuleProps} from './shader-module';

// Factor by which to downscale Collision FBO relative to canvas
const DOWNSCALE = 2;
// RGB picking colors reserve zero for no object.
const MAX_PICKING_COLOR = 0xffffff;

type RenderInfo = {
  collisionGroup: string;
  layers: Layer<CollisionFilterExtensionProps>[];
  layerBounds: ([number[], number[]] | null)[];
  allLayersLoaded: boolean;
  /** Picking color offset of each layer, by layer id */
  pickingColorOffsets: Record<string, number>;
  hasText: boolean;
  objectCount: number;
};

// A sublayer renders the rows of its parent, or of the highest ancestor with the same data
// (e.g. PointLabelLayer and its two labels). A layer without a parent owns its rows.
function getRowOwner(layer: Layer): Layer {
  let owner = layer.parent;
  if (!owner) {
    return layer;
  }
  while (owner.parent && owner.parent.props.data === owner.props.data) {
    owner = owner.parent;
  }
  return owner;
}

/**
 * Map each layer id to the id of the source whose rows it renders. Layers of one source share
 * picking colors, so that an object does not collide with itself.
 */
function getCollisionSourceIds(layers: Layer[]): Record<string, string> {
  const sourceIds: Record<string, string> = {};
  // Top-level layers that render the same data object share their rows, e.g. icons and their labels
  const dataSourceIds = new Map<unknown, string>();
  const getSourceId = (owner: Layer): string => {
    const {data} = owner.props;
    if (owner.parent || !data || typeof data !== 'object') {
      return owner.id;
    }
    if (!dataSourceIds.has(data)) {
      dataSourceIds.set(data, `${owner.id}:data`);
    }
    return dataSourceIds.get(data)!;
  };

  // Glyphs and backgrounds render their TextLayer's rows, which are usually also the rows of the
  // TextLayer's source (e.g. a GeoJsonLayer's circles and labels). A source with several
  // TextLayers, such as a TileLayer, renders different rows in each, so they stay separate.
  const textLayersBySource: Record<string, Set<string>> = {};
  const textSourceIds: Record<string, string> = {};
  for (const layer of layers) {
    const owner = getRowOwner(layer);
    if (isTextCollisionLayer(layer)) {
      const sourceId = getSourceId(getRowOwner(owner));
      (textLayersBySource[sourceId] ||= new Set()).add(owner.id);
      textSourceIds[layer.id] = sourceId;
      sourceIds[layer.id] = owner.id;
    } else {
      sourceIds[layer.id] = getSourceId(owner);
    }
  }
  for (const layerId in textSourceIds) {
    const sourceId = textSourceIds[layerId];
    if (textLayersBySource[sourceId].size === 1) {
      sourceIds[layerId] = sourceId;
    }
  }
  return sourceIds;
}

// Picking colors are per object. A path, polygon or label spans several instances.
function getObjectCount(layer: Layer): number {
  const startIndices = layer.getStartIndices();
  return startIndices ? startIndices.length - 1 : layer.getNumInstances();
}

// Character and background sublayers expose the bounds used by text collision shaders.
function isTextCollisionLayer(layer: Layer): boolean {
  return 'getCollisionRect' in layer.props || 'getBoundingRect' in layer.props;
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
      const [width, height] = device.canvasContext!.getDrawingBufferSize();
      const {width: oldWidth, height: oldHeight} = collisionFBO;
      // Text bounds are tested per pixel, so groups with text use a full-resolution map
      const downscale = renderInfo.hasText ? 1 : DOWNSCALE;
      collisionFBO.resize({
        width: width / downscale,
        height: height / downscale
      });
      // Resizing clears the collision map, so it must be redrawn
      const sizeChanged = collisionFBO.width !== oldWidth || collisionFBO.height !== oldHeight;
      this._render(renderInfo, {
        effects,
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged: viewportChanged || sizeChanged
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
            // Match the drawing buffer the collision FBO is sized from
            devicePixelRatio:
              collisionFBO.device.canvasContext!.cssToDeviceRatio() /
              (renderInfo.hasText ? 1 : DOWNSCALE)
          }
        }
      });
      if (renderInfo.hasText) {
        // Test each label's projected bounds against the collision map
        const textLayers = renderInfo.layers.filter(isTextCollisionLayer);
        const visibilityFBO = this.visibilityFBOs[collisionGroup];
        const pixelRatio = collisionFBO.device.canvasContext!.cssToDeviceRatio();
        this.collisionFilterPass!.renderCollisionVisibility(visibilityFBO, {
          pass: 'collision',
          isPicking: true,
          layers: textLayers,
          effects: [...(effects || []), this],
          layerFilter,
          viewports: viewport ? [viewport] : [],
          onViewportActive,
          views,
          shaderModuleProps: {
            collision: {
              enabled: true,
              dummyCollisionMap: this.dummyCollisionMap
            },
            project: {devicePixelRatio: pixelRatio}
          }
        });
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
    const sourceIds = getCollisionSourceIds(collisionLayers);
    // Object count of each source, by collision group
    const sourceObjectCounts: Record<string, Record<string, number>> = {};
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
          objectCount: 0
        };
        channelMap[collisionGroup] = channelInfo;
        sourceObjectCounts[collisionGroup] = {};
      }
      const isTextLayer = isTextCollisionLayer(layer);
      channelInfo.hasText ||= isTextLayer;
      const counts = sourceObjectCounts[collisionGroup];
      const sourceId = sourceIds[layer.id];
      counts[sourceId] = Math.max(counts[sourceId] || 0, getObjectCount(layer));
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
      if (!layer.isLoaded) {
        channelInfo.allLayersLoaded = false;
      }
    }

    // Create any new passes and remove any old ones
    for (const collisionGroup of Object.keys(channelMap)) {
      // Reserve disjoint picking colors for each source. Object 0 from one
      // source must not match object 0 from another source in the same group.
      const sourceOffsets: Record<string, number> = {};
      let offset = 0;
      for (const [sourceId, count] of Object.entries(sourceObjectCounts[collisionGroup])) {
        sourceOffsets[sourceId] = offset;
        offset += count;
      }
      const renderInfo: RenderInfo = channelMap[collisionGroup];
      for (const layer of renderInfo.layers) {
        renderInfo.pickingColorOffsets[layer.id] = sourceOffsets[sourceIds[layer.id]];
      }
      renderInfo.objectCount = offset;
      // Each object uses a 4x4 visibility cell, including the reserved zero ID.
      const maxVisibilityColumns = Math.floor(device.limits.maxTextureDimension2D / 4);
      const maxObjectCount = channelMap[collisionGroup].hasText
        ? Math.min(MAX_PICKING_COLOR, maxVisibilityColumns ** 2 - 1)
        : MAX_PICKING_COLOR;
      if (offset > maxObjectCount) {
        log.warn(
          `CollisionFilterExtension: group "${collisionGroup}" exceeds ${maxObjectCount} objects, collision disabled`
        )();
        delete channelMap[collisionGroup];
        delete this.channels[collisionGroup];
        continue;
      }
      if (channelMap[collisionGroup].hasText) {
        const width = Math.min(maxVisibilityColumns * 4, Math.ceil(Math.sqrt(offset + 1)) * 4);
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
    const isTextLayer = isTextCollisionLayer(layer);
    return {
      collision: {
        enabled,
        isTextLayer,
        pickingColorOffset: this.channels[collisionGroup!]?.pickingColorOffsets[layer.id] || 0,
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
