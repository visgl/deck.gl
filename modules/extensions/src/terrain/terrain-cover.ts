// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer} from '@luma.gl/core';

import type {Layer, Viewport} from '@deck.gl/core';

import {createRenderTarget} from './utils';
import {
  getMercatorReferenceViewport,
  joinLayerBounds,
  lngLatToMercatorCommon,
  makeViewport,
  getRenderBounds,
  Bounds
} from '../utils/projection-utils';

type TileHeader = {
  boundingBox: [min: number[], max: number[]];
};

/**
 * Manages the lifecycle of the terrain cover (draped textures over a terrain mesh).
 * One terrain cover is created for each unique terrain layer (primitive layer with operation:terrain).
 * It is updated when the terrain source layer's mesh changes or when any of the terrainDrawMode:drape
 * layers requires redraw.
 * During the draw call of a terrain layer, the drape texture is overlaid on top of the layer's own color.
 */
export class TerrainCover {
  isDirty: boolean = true;
  /** The terrain layer that this instance belongs to */
  targetLayer: Layer;
  /** Viewport used to draw into the texture */
  renderViewport: Viewport | null = null;
  /** Bounds of the terrain cover texture, in cartesian space */
  bounds: Bounds | null = null;

  private fbo?: Framebuffer;
  private pickingFbo?: Framebuffer;
  private layers: string[] = [];
  private tile: TileHeader | null;
  /** Cached version of targetLayer.getBounds() */
  private targetBounds: [number[], number[]] | null = null;
  /** targetBounds in cartesian space */
  private targetBoundsCommon: Bounds | null = null;

  constructor(targetLayer: Layer) {
    this.targetLayer = targetLayer;
    this.tile = getTile(targetLayer);
  }

  get id() {
    return this.targetLayer.id;
  }

  /** returns true if the target layer is still in use (i.e. not finalized) */
  get isActive(): boolean {
    return Boolean(this.targetLayer.getCurrentLayer());
  }

  shouldUpdate({
    targetLayer,
    viewport,
    layers,
    layerNeedsRedraw
  }: {
    targetLayer?: Layer;
    viewport?: Viewport;
    layers?: Layer[];
    layerNeedsRedraw?: Record<string, boolean>;
  }): boolean {
    if (targetLayer) {
      this.targetLayer = targetLayer;
    }
    const sizeChanged = viewport ? this._updateViewport(viewport) : false;

    let layersChanged = layers ? this._updateLayers(layers) : false;

    if (layerNeedsRedraw) {
      for (const id of this.layers) {
        if (layerNeedsRedraw[id]) {
          layersChanged = true;
          // console.log('layer needs redraw', id);
          break;
        }
      }
    }

    return layersChanged || sizeChanged;
  }

  /** Compare layers with the last version. Only rerender if necessary. */
  private _updateLayers(layers: Layer[]): boolean {
    let needsRedraw = false;
    layers = this.tile ? getIntersectingLayers(this.tile, layers) : layers;

    if (layers.length !== this.layers.length) {
      needsRedraw = true;
      // console.log('layers count changed', this.layers.length, '>>', layers.length);
    } else {
      for (let i = 0; i < layers.length; i++) {
        const id = layers[i].id;
        if (id !== this.layers[i]) {
          needsRedraw = true;
          // console.log('layer added/removed', id);
          break;
        }
      }
    }
    if (needsRedraw) {
      this.layers = layers.map(layer => layer.id);
    }
    return needsRedraw;
  }

  /** Compare viewport and terrain bounds with the last version. Only rerender if necesary. */
  // eslint-disable-next-line max-statements
  private _updateViewport(viewport: Viewport): boolean {
    const targetLayer = this.targetLayer;
    let shouldRedraw = false;

    // Bounds are computed in ABSOLUTE Mercator common space — NOT the live
    // viewport's common space. The terrain cover FBO is rendered via a
    // WebMercatorViewport regardless of the screen viewport, so UVs must also
    // live in Mercator. This is what lets the same cover texture be sampled
    // from MapView and GlobeView.
    if (this.tile && 'boundingBox' in this.tile) {
      if (!this.targetBounds) {
        shouldRedraw = true;
        this.targetBounds = this.tile.boundingBox;

        const bottomLeftCommon = lngLatToMercatorCommon(this.targetBounds[0]);
        const topRightCommon = lngLatToMercatorCommon(this.targetBounds[1]);
        this.targetBoundsCommon = [
          bottomLeftCommon[0],
          bottomLeftCommon[1],
          topRightCommon[0],
          topRightCommon[1]
        ];
      }
    } else if (this.targetBounds !== targetLayer.getBounds()) {
      // console.log('bounds changed', this.bounds, '>>', newBounds);
      shouldRedraw = true;
      this.targetBounds = targetLayer.getBounds();
      // Non-tile terrain layer: project layer bounds through the Mercator
      // reference so the cover is projection-invariant. joinLayerBounds uses
      // layer.projectPosition() internally, which honors the layer's
      // coordinateSystem (LNGLAT / CARTESIAN / METER_OFFSETS).
      this.targetBoundsCommon = joinLayerBounds(
        [targetLayer],
        getMercatorReferenceViewport(viewport)
      );
    }

    if (!this.targetBoundsCommon) {
      return false;
    }

    const newZoom = Math.ceil(viewport.zoom + 0.5);
    // If the terrain layer is bound to a tile, always render a texture that cover the whole tile.
    // Otherwise, use the smaller of layer bounds and the viewport bounds.
    if (this.tile) {
      this.bounds = this.targetBoundsCommon;
    } else {
      const oldZoom = this.renderViewport?.zoom;
      shouldRedraw = shouldRedraw || newZoom !== oldZoom;
      // getRenderBounds intersects layer bounds (Mercator) with viewport bounds
      // derived via viewport.projectPosition. On GlobeView that yields sphere
      // cartesian coords, which would corrupt the intersection. Fall back to
      // full layer bounds on non-Mercator geospatial viewports — resolution
      // is reduced but output stays correct.
      const isGlobe = Boolean(viewport.resolution && viewport.resolution! > 0);
      const newBounds = isGlobe
        ? this.targetBoundsCommon
        : getRenderBounds(this.targetBoundsCommon, viewport);
      const oldBounds = this.bounds;
      shouldRedraw = shouldRedraw || !oldBounds || newBounds.some((x, i) => x !== oldBounds[i]);
      this.bounds = newBounds;
    }

    if (shouldRedraw) {
      this.renderViewport = makeViewport({
        bounds: this.bounds,
        zoom: newZoom,
        viewport
      });
    }

    return shouldRedraw;
  }

  getRenderFramebuffer(): Framebuffer | null {
    if (!this.renderViewport || this.layers.length === 0) {
      return null;
    }
    if (!this.fbo) {
      this.fbo = createRenderTarget(this.targetLayer.context.device, {id: this.id});
    }
    return this.fbo;
  }

  getPickingFramebuffer(): Framebuffer | null {
    if (!this.renderViewport || (this.layers.length === 0 && !this.targetLayer.props.pickable)) {
      return null;
    }
    if (!this.pickingFbo) {
      this.pickingFbo = createRenderTarget(this.targetLayer.context.device, {
        id: `${this.id}-picking`,
        interpolate: false
      });
    }
    return this.pickingFbo;
  }

  filterLayers(layers: Layer[]) {
    return layers.filter(({id}) => this.layers.includes(id));
  }

  delete() {
    const {fbo, pickingFbo} = this;
    if (fbo) {
      fbo.colorAttachments[0].destroy();
      fbo.destroy();
    }
    if (pickingFbo) {
      pickingFbo.colorAttachments[0].destroy();
      pickingFbo.destroy();
    }
  }
}

/**
 * Remove layers that do not overlap with the current terrain cover.
 * This implementation only has effect when a TileLayer is overlaid on top of a TileLayer
 */
function getIntersectingLayers(sourceTile: TileHeader, layers: Layer[]): Layer[] {
  return layers.filter(layer => {
    const tile = getTile(layer);
    if (tile) {
      return intersect(sourceTile.boundingBox, tile.boundingBox);
    }
    return true;
  });
}

/** If layer is the descendent of a TileLayer, return the corresponding tile. */
function getTile(layer: Layer): TileHeader | null {
  while (layer) {
    // @ts-expect-error tile may not exist
    const {tile} = layer.props;
    if (tile) {
      return tile;
    }
    layer = layer.parent as Layer;
  }
  return null;
}

function intersect(b1?: [number[], number[]], b2?: [number[], number[]]): boolean {
  if (b1 && b2) {
    return b1[0][0] < b2[1][0] && b2[0][0] < b1[1][0] && b1[0][1] < b2[1][1] && b2[0][1] < b1[1][1];
  }
  return false;
}
