// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import {log} from '@deck.gl/core';

import {terrainModule, TerrainModuleProps} from './shader-module';
import {TerrainCover} from './terrain-cover';
import {TerrainPass} from './terrain-pass';
import {TerrainPickingPass, TerrainPickingPassRenderOptions} from './terrain-picking-pass';
import {HeightMapBuilder} from './height-map-builder';

import type {Effect, EffectContext, PreRenderOptions, Layer, Viewport} from '@deck.gl/core';

/** Class to manage terrain effect */
export class TerrainEffect implements Effect {
  id = 'terrain-effect';
  props = null;
  useInPicking = true;

  /** true if picking in the current pass */
  private isPicking: boolean = false;
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

    deck._addDefaultShaderModule(terrainModule);
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
    if (terrainLayers.length === 0) {
      return;
    }

    if (!isPicking) {
      const offsetLayers = layers.filter(l => l.state.terrainDrawMode === 'offset');
      if (offsetLayers.length > 0) {
        this._updateHeightMap(terrainLayers, viewport, opts);
      }
    }

    const drapeLayers = layers.filter(l => l.state.terrainDrawMode === 'drape');
    this._updateTerrainCovers(terrainLayers, drapeLayers, viewport, opts);
  }

  getShaderModuleProps(
    layer: Layer,
    otherShaderModuleProps: Record<string, any>
  ): {terrain: TerrainModuleProps} {
    const {terrainDrawMode} = layer.state;

    return {
      terrain: {
        project: otherShaderModuleProps.project,
        isPicking: this.isPicking,
        heightMap: this.heightMap?.getRenderFramebuffer()?.colorAttachments[0].texture || null,
        heightMapBounds: this.heightMap?.bounds,
        dummyHeightMap: this.dummyHeightMap!,
        terrainCover: this.isDrapingEnabled ? this.terrainCovers.get(layer.id) : null,
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

    if (this.heightMap) {
      this.heightMap.delete();
      this.heightMap = undefined;
    }

    for (const terrainCover of this.terrainCovers.values()) {
      terrainCover.delete();
    }
    this.terrainCovers.clear();

    deck._removeDefaultShaderModule(terrainModule);
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
