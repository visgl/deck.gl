// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Device, Parameters, RenderPass, Texture} from '@luma.gl/core';
import {log} from '@deck.gl/core';

import {terrainModule, TerrainModuleProps} from './shader-module';
import {TerrainCover} from './terrain-cover';
import {TerrainPass} from './terrain-pass';
import {TerrainPickingPass, TerrainPickingPassRenderOptions} from './terrain-picking-pass';
import {HeightMapBuilder} from './height-map-builder';
import {TerrainPickingSurface} from './terrain-picking-surface';
import {getExternalTerrain} from './external-terrain';
import {makeViewport} from '../utils/projection-utils';

import type {Effect, EffectContext, PreRenderOptions, Layer, Viewport} from '@deck.gl/core';
import type {ExternalTerrain, ExternalTerrainDrapeRenderer} from './external-terrain';

/**
 * Pixels around the offset layers covered by a height map of external terrain, which keeps
 * objects on the edge of the layers' bounds, or a single point, inside the height map
 */
const EXTERNAL_HEIGHT_MAP_PADDING = 32;

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
  /** Terrain drawn by another renderer, which a terrain layer stands for */
  private externalTerrain: ExternalTerrain | null = null;
  /** The layer that stands for the external terrain, which draws it in the picking pass */
  private externalTerrainLayerId: string | null = null;
  /** The `id` of the external terrain that the height map holds */
  private externalHeightMapId: string | null = null;
  /** Layers draped over the external terrain, with the options to draw them */
  private externalDrape: {layers: Layer[]; opts: PreRenderOptions; viewport: Viewport} | null =
    null;
  /** True if a terrain layer is present, which offset and draped layers follow */
  private hasTerrain: boolean = false;
  private device?: Device;
  /** Stands in for the external terrain in the picking buffer, once draped layers are pickable */
  private pickingSurface?: TerrainPickingSurface;
  /** True if the external terrain layer draws the picking surface in the current picking pass */
  private drawsPickingSurface: boolean = false;

  setup({device, deck}: EffectContext) {
    this.device = device;
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
    this.drawsPickingSurface = false;
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

    if (!isPicking) {
      // Includes terrain layers that have not loaded yet, which keep the draped layers hidden
      const allTerrainLayers = opts.layers.filter(l => l.props.operation.includes('terrain'));
      // Terrain layers that deck.gl draws take precedence over terrain drawn by another renderer
      const externalTerrainLayer = allTerrainLayers.every(getExternalTerrain)
        ? allTerrainLayers[0]
        : undefined;
      this._setExternalTerrain(
        externalTerrainLayer ? getExternalTerrain(externalTerrainLayer) : null
      );
      this.externalTerrainLayerId = externalTerrainLayer?.id ?? null;
      this.hasTerrain = allTerrainLayers.length > 0;
    }

    if (this.externalTerrain) {
      if (isPicking) {
        this._updateExternalPickingSurface(layers, viewport, opts);
      } else {
        this._updateExternalHeightMap(this.externalTerrain, opts.layers, viewport);
        this._updateExternalDrape(this.externalTerrain, opts, viewport);
      }
      return;
    }

    const terrainLayers = layers.filter(
      l => l.props.operation.includes('terrain') && !getExternalTerrain(l)
    );
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

    const {terrainDrawMode} = layer.state;
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
        heightMapInMeters: this.externalTerrain !== null,
        dummyHeightMap: this.dummyHeightMap!,
        terrainCover,
        useTerrainHeightMap: terrainDrawMode === 'offset' && this.hasTerrain,
        terrainSkipRender:
          (terrainDrawMode === 'drape' && this.hasTerrain) ||
          !layer.props.operation.includes('draw'),
        drawPickingSurface:
          this.drawsPickingSurface && layer.id === this.externalTerrainLayerId
            ? this._drawPickingSurface
            : null
      }
    };
  }

  cleanup({deck}: EffectContext): void {
    this._setExternalTerrain(null);

    this.pickingSurface?.delete();
    this.pickingSurface = undefined;

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

  /**
   * Hands the draped layers to new external terrain, and takes them back from the previous one.
   * A new object with the same `id` is the same terrain, so it only receives the renderer.
   */
  private _setExternalTerrain(externalTerrain: ExternalTerrain | null) {
    const previous = this.externalTerrain;
    if (externalTerrain === previous) {
      return;
    }
    this.externalTerrain = externalTerrain;
    if (externalTerrain?.id !== previous?.id) {
      previous?.setDrapeRenderer?.(null);
      this.externalHeightMapId = null;
      this.externalDrape = null;
    }
    externalTerrain?.setDrapeRenderer?.(this._renderExternalDrape);
  }

  /**
   * Asks the external terrain for the ground heights under the offset layers and the pickable draped
   * layers, in meters, when the viewport, the layers or the terrain change: the tiles a host draws
   * depend on its camera. It covers the layers of every `layerFilter`, since a host that draws the
   * layers in groups shares one height map between them.
   */
  private _updateExternalHeightMap(
    externalTerrain: ExternalTerrain,
    layers: Layer[],
    viewport: Viewport
  ) {
    const layersOnTerrain = layers.filter(
      l =>
        !l.isComposite &&
        l.props.visible &&
        (l.state.terrainDrawMode === 'offset' ||
          (l.state.terrainDrawMode === 'drape' && l.props.pickable))
    );
    if (!this.heightMap || layersOnTerrain.length === 0) {
      return;
    }
    const shouldUpdate = this.heightMap.shouldUpdate({
      layers: layersOnTerrain,
      viewport,
      padding: EXTERNAL_HEIGHT_MAP_PADDING
    });
    if (!shouldUpdate && externalTerrain.id === this.externalHeightMapId) {
      return;
    }
    const target = this.heightMap.getRenderFramebuffer();
    const {renderViewport, bounds} = this.heightMap;
    if (!target || !renderViewport || !bounds) {
      return;
    }
    target.resize({
      width: Math.ceil(renderViewport.width),
      height: Math.ceil(renderViewport.height)
    });
    externalTerrain.renderHeightMap({target, bounds});
    this.externalHeightMapId = externalTerrain.id;
  }

  /**
   * Draws the picking colors of the draped layers over the height map's bounds, like a terrain cover,
   * for the surface that the external terrain layer draws in its place
   */
  private _updateExternalPickingSurface(
    layers: Layer[],
    viewport: Viewport,
    opts: PreRenderOptions
  ) {
    const drapeLayers = layers.filter(l => l.state.terrainDrawMode === 'drape');
    const bounds = this.heightMap?.renderViewport ? this.heightMap.bounds : null;
    const coverViewport =
      bounds && makeViewport({bounds, zoom: Math.ceil(viewport.zoom + 0.5), viewport});
    if (!drapeLayers.some(l => l.props.pickable) || !bounds || !coverViewport || !this.device) {
      return;
    }
    this.pickingSurface ??= new TerrainPickingSurface(this.device);
    this.pickingSurface.setBounds(bounds);
    const target = this.pickingSurface.getPickingCover(coverViewport.width, coverViewport.height);
    this.terrainPickingPass.renderPickingCover(target, coverViewport, {
      ...opts,
      effects: opts.effects?.filter(e => e !== this),
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
    this.drawsPickingSurface = true;
  }

  /** Draws the picking surface when the external terrain layer draws in the picking pass */
  private _drawPickingSurface = ({
    renderPass,
    parameters,
    shaderModuleProps
  }: {
    renderPass: RenderPass;
    parameters: Parameters;
    shaderModuleProps: Record<string, any>;
  }) => {
    const heightMap = this.heightMap?.getRenderFramebuffer()?.colorAttachments[0].texture;
    if (heightMap) {
      this.pickingSurface?.draw({
        renderPass,
        parameters,
        project: shaderModuleProps.project,
        heightMap
      });
    }
  };

  /** Remembers the draped layers for the external terrain, and tells it when they change */
  private _updateExternalDrape(
    externalTerrain: ExternalTerrain,
    opts: PreRenderOptions,
    viewport: Viewport
  ) {
    const layers = opts.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
    const previousLayers = this.externalDrape?.layers ?? [];
    let changed =
      layers.length !== previousLayers.length ||
      layers.some((l, i) => l.id !== previousLayers[i].id);
    for (const layer of layers) {
      if (layer.state.terrainCoverNeedsRedraw) {
        layer.state.terrainCoverNeedsRedraw = false;
        changed = true;
      }
    }
    this.externalDrape = {
      layers,
      opts: {...opts, effects: opts.effects?.filter(e => e !== this)},
      viewport
    };
    if (changed) {
      externalTerrain.onDrapeChange?.(layers);
    }
  }

  /** Draws the draped layers into a framebuffer of the external terrain's renderer */
  private _renderExternalDrape: ExternalTerrainDrapeRenderer = ({
    target,
    bounds,
    layerFilter,
    devicePixelRatio = 1
  }) => {
    const drape = this.externalDrape;
    // The host may draw before the next preRender, after layers were updated or removed
    const layers = drape?.layers
      .map(layer => layer.getCurrentLayer())
      .filter(layer => layer !== null);
    if (!drape || !layers?.length) {
      return;
    }
    const width = target.width / devicePixelRatio;
    const height = target.height / devicePixelRatio;
    const viewport = makeViewport({
      bounds,
      width,
      height,
      // Given, because makeViewport caps the zoom it derives at 20
      zoom: Math.log2(Math.min(width / (bounds[2] - bounds[0]), height / (bounds[3] - bounds[1]))),
      viewport: drape.viewport
    });
    if (!viewport) {
      return;
    }
    this.terrainPass.renderDrapedLayers(target, viewport, {
      ...drape.opts,
      views: undefined,
      layers,
      layerFilter,
      shaderModuleProps: {
        terrain: {
          dummyHeightMap: this.dummyHeightMap,
          terrainSkipRender: false
        },
        project: {
          devicePixelRatio
        }
      }
    });
  };

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
