import {Framebuffer} from '@luma.gl/core';

import type {Layer, Viewport} from '@deck.gl/core';

import {createRenderTarget} from './utils';
import {joinLayerBounds, makeViewport, getRenderBounds, Bounds} from '../common/projection-utils';

// TODO - import from loaders when Tileset2D is split out
type GeoBoundingBox = {west: number; north: number; east: number; south: number};
type NonGeoBoundingBox = {left: number; top: number; right: number; bottom: number};
type Tile2DHeader = {
  bbox: GeoBoundingBox | NonGeoBoundingBox;
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
  private tile: Tile2DHeader | null;
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
  private _updateViewport(viewport: Viewport): boolean {
    const targetLayer = this.targetLayer;
    let shouldRedraw = false;

    if (this.targetBounds !== targetLayer.getBounds()) {
      // console.log('bounds changed', this.bounds, '>>', newBounds);
      shouldRedraw = true;
      this.targetBounds = targetLayer.getBounds();
      this.targetBoundsCommon = joinLayerBounds([targetLayer], viewport);
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
      const newBounds = getRenderBounds(this.targetBoundsCommon, viewport);
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
      this.fbo = createRenderTarget(this.targetLayer.context.gl, {id: this.id});
    }
    return this.fbo;
  }

  getPickingFramebuffer(): Framebuffer | null {
    if (!this.renderViewport || (this.layers.length === 0 && !this.targetLayer.props.pickable)) {
      return null;
    }
    if (!this.pickingFbo) {
      this.pickingFbo = createRenderTarget(this.targetLayer.context.gl, {id: `${this.id}-picking`});
    }
    return this.pickingFbo;
  }

  filterLayers(layers: Layer[]) {
    return layers.filter(({id}) => this.layers.includes(id));
  }

  delete() {
    const {fbo, pickingFbo} = this;
    if (fbo) {
      fbo.texture.delete();
      fbo.delete();
    }
    if (pickingFbo) {
      pickingFbo.texture.delete();
      pickingFbo.delete();
    }
  }
}

/**
 * Remove layers that do not overlap with the current terrain cover.
 * This implementation only has effect when a TileLayer is overlaid on top of a TileLayer
 */
function getIntersectingLayers(sourceTile: Tile2DHeader, layers: Layer[]): Layer[] {
  return layers.filter(layer => {
    const tile = getTile(layer);
    if (tile) {
      return intersect(sourceTile.bbox, tile.bbox);
    }
    return true;
  });
}

/** If layer is the descendent of a TileLayer, return the corresponding tile. */
function getTile(layer: Layer): Tile2DHeader | null {
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

function intersect(
  b1: GeoBoundingBox | NonGeoBoundingBox,
  b2: GeoBoundingBox | NonGeoBoundingBox
): boolean {
  if ('west' in b1 && 'west' in b2) {
    return b1.west < b2.east && b2.west < b1.east && b1.south < b2.north && b2.south < b1.north;
  }
  if ('left' in b1 && 'left' in b2) {
    return b1.left < b2.right && b2.left < b1.right && b1.top < b2.bottom && b2.top < b1.bottom;
  }
  return false;
}
