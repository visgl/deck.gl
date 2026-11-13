// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import {log} from '@deck.gl/core';

import {terrainPlugin, TerrainModuleProps} from './shader-module';
import {TerrainCover} from './terrain-cover';
import {TerrainPass} from './terrain-pass';
import {TerrainPickingPass, TerrainPickingPassRenderOptions} from './terrain-picking-pass';
import {HeightMapBuilder} from './height-map-builder';
import TerrainExtension from './terrain-extension';

import type {Effect, EffectContext, PreRenderOptions, Layer, Viewport} from '@deck.gl/core';

/** Class to manage terrain effect */
export class TerrainEffect implements Effect {
  id = 'terrain-effect';
  props = null;
  useInPicking = true;

  /** true if picking in the current pass */
  private isPicking: boolean = false;
  /** Picking reuses the terrain availability of the frame it picks from. */
  private hasTerrain: boolean = false;
  /** true if should use in the current pass */
  private isDrapingEnabled: boolean = false;
  /** An empty texture as placeholder */
  private dummyHeightMap?: Texture;
  /** A texture encoding the ground elevation, updated once per redraw. Used by layers with offset mode */
  private heightMap?: HeightMapBuilder;
  private terrainPass!: TerrainPass;
  private terrainPickingPass!: TerrainPickingPass;
  /** One texture for each primitive terrain layer, into which the draped layers render */
  private terrainCovers: Map<string, TerrainCover> = new Map();

  setup({device, deck}: EffectContext) {
    this.dummyHeightMap = device.createTexture({
      width: 1,
      height: 1,
      data: new Uint8Array([0, 0, 0, 0])
    });

    this.terrainPass = new TerrainPass(device, {id: 'terrain'});
    this.terrainPickingPass = new TerrainPickingPass(device, {id: 'terrain-picking'});

    if (HeightMapBuilder.isSupported(device)) {
      this.heightMap = new HeightMapBuilder(device);
    } else {
      log.warn('Terrain offset mode is not supported by this browser')();
    }

    deck._addDefaultShaderPlugin(terrainPlugin);
  }

  preRender(opts: PreRenderOptions): void {
    // @ts-expect-error pickZ only defined in picking pass
    if (opts.pickZ) {
      // Do not update if picking attributes
      this.isDrapingEnabled = false;
      return;
    }

    const {viewports} = opts;
    const isPicking = opts.pass.startsWith('picking');
    this.isPicking = isPicking;
    this.isDrapingEnabled = true;

    // TODO - support multiple views?
    const viewport = viewports[0];
    const layers = (isPicking ? this.terrainPickingPass : this.terrainPass).getRenderableLayers(
      viewport,
      opts as TerrainPickingPassRenderOptions
    );

    const terrainLayers = layers.filter(l => l.props.operation.includes('terrain'));
    if (!isPicking) {
      this.hasTerrain = terrainLayers.length > 0;
    }
    if (terrainLayers.length === 0) {
      if (!isPicking) {
        this._releaseTerrainTargets();
      }
      return;
    }

    if (!isPicking) {
      const offsetLayers = layers.filter(l => getTerrainDrawMode(l) === 'offset');
      if (offsetLayers.length > 0) {
        this._updateHeightMap(terrainLayers, viewport, opts);
      }
    }

    const drapeLayers = layers.filter(l => getTerrainDrawMode(l) === 'drape');
    // Filter out the terrain effect itself to avoid feedback loops when rendering terrain covers
    // (the terrain cover FBO would be both read and written to). Other effects like MaskEffect
    // need to be passed through so they can apply to draped layers.
    const nonTerrainEffects = opts.effects?.filter(e => e !== this);
    this._updateTerrainCovers(terrainLayers, drapeLayers, viewport, {
      ...opts,
      effects: nonTerrainEffects
    });
  }

  getShaderModuleProps(
    layer: Layer,
    otherShaderModuleProps: Record<string, any>
  ): {terrain: Partial<TerrainModuleProps>} {
    // Mask layers need the terrain_map binding satisfied but shouldn't use terrain features
    if (layer.props.operation.includes('mask')) {
      return {
        terrain: {
          dummyHeightMap: this.dummyHeightMap!
        }
      };
    }

    const terrainDrawMode = this.hasTerrain ? getTerrainDrawMode(layer) : undefined;
    const terrainCover = this.isDrapingEnabled ? (this.terrainCovers.get(layer.id) ?? null) : null;

    // Communicate cover FBO availability to getLayerParameters for blend factor selection
    if (this.isPicking && layer.props.operation.includes('terrain')) {
      layer.state._hasPickingCover = Boolean(terrainCover?.getPickingFramebuffer());
    }

    return {
      terrain: {
        project: otherShaderModuleProps.project,
        isPicking: this.isPicking,
        heightMap: this.heightMap?.getRenderFramebuffer()?.colorAttachments[0].texture || null,
        heightMapBounds: this.heightMap?.bounds,
        dummyHeightMap: this.dummyHeightMap!,
        terrainCover,
        useTerrainHeightMap: terrainDrawMode === 'offset',
        terrainSkipRender: terrainDrawMode === 'drape' || !layer.props.operation.includes('draw')
      }
    };
  }

  cleanup({deck}: EffectContext): void {
    if (this.dummyHeightMap) {
      this.dummyHeightMap.delete();
      this.dummyHeightMap = undefined;
    }

    this._releaseTerrainTargets();
    this.heightMap = undefined;

    deck._removeDefaultShaderPlugin(terrainPlugin);
  }

  private _releaseTerrainTargets(): void {
    this.heightMap?.reset();
    for (const terrainCover of this.terrainCovers.values()) {
      terrainCover.delete();
    }
    this.terrainCovers.clear();
  }

  private _updateHeightMap(terrainLayers: Layer[], viewport: Viewport, opts: PreRenderOptions) {
    if (!this.heightMap) {
      // Not supported
      return;
    }

    const shouldUpdate = this.heightMap.shouldUpdate({layers: terrainLayers, viewport});
    if (!shouldUpdate) {
      return;
    }

    this.terrainPass.renderHeightMap(this.heightMap, {
      ...opts,
      layers: terrainLayers,
      shaderModuleProps: {
        terrain: {
          heightMapBounds: this.heightMap.bounds,
          dummyHeightMap: this.dummyHeightMap,
          drawToTerrainHeightMap: true
        },
        project: {
          devicePixelRatio: 1
        }
      }
    });
  }

  private _updateTerrainCovers(
    terrainLayers: Layer[],
    drapeLayers: Layer[],
    viewport: Viewport,
    opts: PreRenderOptions
  ) {
    // Mark a terrain cover as dirty if one of the drape layers needs redraw
    const layerNeedsRedraw: Record<string, boolean> = {};
    for (const layer of drapeLayers) {
      if (layer.state.terrainCoverNeedsRedraw) {
        layerNeedsRedraw[layer.id] = true;
        layer.state.terrainCoverNeedsRedraw = false;
      }
    }
    for (const terrainCover of this.terrainCovers.values()) {
      terrainCover.isDirty = terrainCover.isDirty || terrainCover.shouldUpdate({layerNeedsRedraw});
    }

    for (const layer of terrainLayers) {
      this._updateTerrainCover(layer, drapeLayers, viewport, opts);
    }

    if (!this.isPicking) {
      this._pruneTerrainCovers();
    }
  }

  private _updateTerrainCover(
    terrainLayer: Layer,
    drapeLayers: Layer[],
    viewport: Viewport,
    opts: PreRenderOptions
  ) {
    const renderPass = this.isPicking ? this.terrainPickingPass : this.terrainPass;
    let terrainCover = this.terrainCovers.get(terrainLayer.id);
    if (!terrainCover) {
      terrainCover = new TerrainCover(terrainLayer);
      this.terrainCovers.set(terrainLayer.id, terrainCover);
    }
    try {
      const isDirty = terrainCover.shouldUpdate({
        targetLayer: terrainLayer,
        viewport,
        layers: drapeLayers
      });
      if (this.isPicking || terrainCover.isDirty || isDirty) {
        renderPass.renderTerrainCover(terrainCover, {
          ...opts,
          layers: drapeLayers,
          shaderModuleProps: {
            terrain: {
              dummyHeightMap: this.dummyHeightMap,
              terrainSkipRender: false
            },
            project: {
              devicePixelRatio: 1
            }
          }
        });

        if (!this.isPicking) {
          // IsDirty refers to the normal fbo, not the picking fbo.
          // Only mark it as not dirty if the normal fbo was updated.
          terrainCover.isDirty = false;
        }
      }
    } catch (err) {
      terrainLayer.raiseError(err as Error, `Error rendering terrain cover ${terrainCover.id}`);
    }
  }

  private _pruneTerrainCovers() {
    /** Prune the cache, remove textures for layers that have been removed */
    const idsToRemove: string[] = [];
    for (const [id, terrainCover] of this.terrainCovers) {
      if (!terrainCover.isActive) {
        idsToRemove.push(id);
      }
    }
    for (const id of idsToRemove) {
      this.terrainCovers.delete(id);
    }
  }
}

// A live layer can keep its previous state after its extensions change.
function getTerrainDrawMode(layer: Layer): 'drape' | 'offset' | undefined {
  if (layer.props.extensions.some(extension => extension instanceof TerrainExtension)) {
    return layer.state.terrainDrawMode as 'drape' | 'offset' | undefined;
  }
}
