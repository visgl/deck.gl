import {Texture2D, ProgramManager, Framebuffer} from '@luma.gl/core';
import {OPERATION} from '@deck.gl/core';

import shaderModule from './shader-module';
import TerrainCover from './terrain-cover';
import TerrainPass from './terrain-pass';
import TerrainPickingPass, {TerrainPickingPassRenderOptions} from './terrain-picking-pass';
import {createRenderTarget} from './utils';

import type {TerrainModuleSettings} from './shader-module';
import type {Effect, PreRenderOptions, Layer, Viewport} from '@deck.gl/core';

/** Class to manage terrain effect */
export default class TerrainEffect implements Effect {
  id = 'terrain-effect';
  props = null;
  useInPicking = true;

  /** true if inside a picking pass */
  private isPicking: boolean = false;
  /** An empty texture as placeholder */
  private dummyHeightMap: Texture2D;
  /** A texture encoding the ground elevation, updated once per redraw. Used by layers with offset mode */
  private heightMap?: Framebuffer;
  private terrainPass!: TerrainPass;
  private terrainPickingPass!: TerrainPickingPass;
  /** One texture for each primitive terrain layer, into which the draped layers render */
  private terrainCovers: Map<string, TerrainCover> = new Map();

  initialize(gl: WebGLRenderingContext) {
    this.dummyHeightMap = new Texture2D(gl, {
      width: 1,
      height: 1
    });
    this.terrainPass = new TerrainPass(gl, {id: 'terrain'});
    this.terrainPickingPass = new TerrainPickingPass(gl, {id: 'terrain-picking'});

    ProgramManager.getDefaultProgramManager(gl).addDefaultModule(shaderModule);
  }

  preRender(gl: WebGLRenderingContext, opts: PreRenderOptions): void {
    if (!this.dummyHeightMap) {
      // First time this effect is in use, initialize resources and register the shader module
      this.initialize(gl);
      for (const layer of opts.layers) {
        // Force the terrain layer (and its descendents) to rebuild their models with the new shader
        if (layer.props.operation.includes(OPERATION.TERRAIN)) {
          layer.setChangeFlags({extensionsChanged: true});
        }
      }
    }

    const {viewports, pass} = opts;
    const isPicking = pass.includes('picking');
    this.isPicking = isPicking;
    // Disable this effect when rendering into height map or terrain cover
    const renderOpts: TerrainPickingPassRenderOptions = {
      ...(opts as TerrainPickingPassRenderOptions),
      effects: []
    };
    // TODO - support multiple views?
    const viewport = viewports[0];
    const layers = (isPicking ? this.terrainPickingPass : this.terrainPass).getRenderableLayers(
      viewport,
      renderOpts
    );

    const terrainLayers = layers.filter(l => l.props.operation.includes(OPERATION.TERRAIN));
    if (terrainLayers.length === 0) {
      return;
    }

    if (!isPicking) {
      const offsetLayers = layers.filter(l => l.state.terrainFittingMode === 'offset');
      if (offsetLayers.length > 0) {
        this._renderHeightMap(gl, terrainLayers, viewport, renderOpts);
      }
    }

    const drapeLayers = layers.filter(l => l.state.terrainFittingMode === 'drape');
    if (drapeLayers.length > 0) {
      this._updateTerrainCovers(terrainLayers, drapeLayers, viewport, renderOpts);
    }
    if (!isPicking) {
      this._pruneTerrainCovers();
    }
  }

  getModuleParameters(layer: Layer): TerrainModuleSettings {
    const terrainCover = this.terrainCovers.get(layer.id);
    const {terrainFittingMode} = layer.state;

    let terrainCoverTexture: Texture2D | null;
    if (!terrainCover) {
      terrainCoverTexture = null;
    } else if (this.isPicking) {
      terrainCoverTexture = terrainCover.pickingTexture;
    } else {
      terrainCoverTexture = terrainCover.renderTexture;
    }

    return {
      heightMap: this.heightMap?.color,
      dummyHeightMap: this.dummyHeightMap,
      terrainCover: terrainCoverTexture,
      terrainCoverBounds: terrainCover?.commonBounds,
      useTerrainHeightMap: terrainFittingMode === 'offset',
      terrainSkipRender: terrainFittingMode === 'drape'
    };
  }

  cleanup(): void {
    if (this.dummyHeightMap) {
      this.dummyHeightMap.delete();
      this.dummyHeightMap = undefined;
    }

    if (this.heightMap) {
      this.heightMap.color.delete();
      this.heightMap.delete();
      this.heightMap = undefined;
    }

    for (const terrainCover of this.terrainCovers.values()) {
      terrainCover.delete();
    }
    this.terrainCovers.clear();
  }

  private _renderHeightMap(
    gl: WebGLRenderingContext,
    terrainLayers: Layer[],
    viewport: Viewport,
    opts: PreRenderOptions
  ) {
    if (!this.heightMap) {
      try {
        this.heightMap = createRenderTarget(gl, {id: 'height-map', float: true});
      } catch {
        throw new Error('Terrain is not supported by this browser');
      }
    }

    this.heightMap.resize(viewport);

    this.terrainPass.renderHeightMap(this.heightMap, {
      ...opts,
      pass: 'terrain-height-map',
      viewports: [viewport],
      layers: terrainLayers,
      moduleParameters: {
        heightMap: this.heightMap.color,
        dummyHeightMap: this.dummyHeightMap,
        devicePixelRatio: 1,
        drawToTerrainHeightMap: true
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

    const renderPass = this.isPicking ? this.terrainPickingPass : this.terrainPass;
    for (const layer of terrainLayers) {
      let terrainCover = this.terrainCovers.get(layer.id);
      if (terrainCover) {
        terrainCover.owner = layer;
      } else {
        terrainCover = new TerrainCover(layer);
        this.terrainCovers.set(layer.id, terrainCover);
      }
      try {
        const isDirty = terrainCover.shouldUpdate({viewport, layers: drapeLayers});
        if (this.isPicking || terrainCover.isDirty || isDirty) {
          renderPass.renderTerrainCover(terrainCover, {
            ...opts,
            layers: drapeLayers,
            moduleParameters: {
              dummyHeightMap: this.dummyHeightMap,
              terrainSkipRender: false,
              devicePixelRatio: 1
            }
          });
          terrainCover.isDirty = false;
        }
      } catch (err) {
        layer.raiseError(err as Error, `Error rendering terrain cover ${terrainCover.id}`);
      }
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
