import {Framebuffer} from '@luma.gl/core';

import {WebMercatorViewport, OrthographicViewport} from '@deck.gl/core';
import type {Layer, Viewport} from '@deck.gl/core';

import {createRenderTarget} from './utils';

const unitGeospatialViewport = new WebMercatorViewport({width: 1, height: 1});
const unitNonGeospatialViewport = new OrthographicViewport({width: 1, height: 1});

const MAX_SIZE = 2048;

// TODO - import from loaders when Tileset2D is split out
type GeoBoundingBox = {west: number; north: number; east: number; south: number};
type NonGeoBoundingBox = {left: number; top: number; right: number; bottom: number};
type Tile2DHeader = {
  bbox: GeoBoundingBox | NonGeoBoundingBox;
};

/** Class to manage draped texture for each terrain layer */
export default class TerrainCover {
  private fbo?: Framebuffer;
  private pickingFbo?: Framebuffer;
  private zoom: number = 0;
  private bounds: [number[], number[]] | null = null;
  private layers: string[] = [];
  private tile: Tile2DHeader | null;

  isDirty: boolean = true;
  owner: Layer;
  renderViewport: Viewport | null = null;
  commonBounds: [number[], number[]] | null = null;

  constructor(owner: Layer) {
    this.owner = owner;
    this.tile = getTile(owner);
  }

  get id() {
    return this.owner.id;
  }

  get isActive(): boolean {
    const owner = this.owner.getCurrentLayer();
    return owner !== null && !owner.lifecycle.startsWith('Finalized');
  }

  shouldUpdate({
    owner,
    viewport,
    layers,
    layerNeedsRedraw
  }: {
    owner?: Layer;
    viewport?: Viewport;
    layers?: Layer[];
    layerNeedsRedraw?: Record<string, boolean>;
  }): boolean {
    if (owner) {
      this.owner = owner;
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
    layers = getIntersectingLayers(this.tile, layers);

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
    const owner = this.owner;
    let needsRedraw = false;
    const newBounds = owner.getBounds();
    if (
      // The terrain layer's bounds has changed
      this.bounds !== newBounds ||
      // If the terrain layer is not bound to a tile, increase texture size based on zoom
      (!this.tile && Math.abs(viewport.zoom - this.zoom) >= 1)
    ) {
      needsRedraw = true;
      // console.log('bounds changed', this.bounds, '>>', newBounds);
      this.bounds = newBounds;
      // console.log('zoom changed', this.zoom, '>>', Math.ceil(viewport.zoom));
      this.zoom = Math.ceil(viewport.zoom);
    }

    if (newBounds) {
      const leftBottomCommon = owner.projectPosition(newBounds[0], {viewport});
      const topRightCommon = owner.projectPosition(newBounds[1], {viewport});
      this.commonBounds = [leftBottomCommon, topRightCommon];
    } else {
      this.commonBounds = null;
    }

    if (needsRedraw) {
      this.renderViewport = getRenderViewport(owner, this.zoom, viewport.isGeospatial);
    }
    return needsRedraw;
  }

  get renderTexture(): Framebuffer | null {
    if (!this.renderViewport || this.layers.length === 0) {
      return null;
    }
    if (!this.fbo) {
      this.fbo = createRenderTarget(this.owner.context.gl, {id: this.id});
    }
    return this.fbo;
  }

  get pickingTexture(): Framebuffer | null {
    if (!this.renderViewport || this.layers.length === 0) {
      return null;
    }
    if (!this.pickingFbo) {
      this.pickingFbo = createRenderTarget(this.owner.context.gl, {id: `${this.id}-picking`});
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

function getRenderViewport(layer: Layer, zoom: number, isGeospatial: boolean): Viewport | null {
  // Construct a viewport that just covers the owner layer's bounds
  const bounds = layer.getBounds();
  if (!bounds) {
    return null;
  }

  const refViewport: Viewport = isGeospatial ? unitGeospatialViewport : unitNonGeospatialViewport;
  const leftBottomCommon = layer.projectPosition(bounds[0], {viewport: refViewport});
  const topRightCommon = layer.projectPosition(bounds[1], {viewport: refViewport});

  const center = refViewport.unprojectPosition([
    (leftBottomCommon[0] + topRightCommon[0]) / 2,
    (leftBottomCommon[1] + topRightCommon[1]) / 2,
    0
  ]);

  const scale = 2 ** zoom;
  let width = Math.round(Math.abs(topRightCommon[0] - leftBottomCommon[0]) * scale);
  let height = Math.round(Math.abs(topRightCommon[1] - leftBottomCommon[1]) * scale);
  if (width > MAX_SIZE || height > MAX_SIZE) {
    const r = MAX_SIZE / Math.max(width, height);
    width = Math.round(width * r);
    height = Math.round(height * r);
  }

  return isGeospatial
    ? new WebMercatorViewport({
        width,
        height,
        longitude: center[0],
        latitude: center[1],
        zoom,
        orthographic: true
      })
    : new OrthographicViewport({width, height, target: center, zoom, flipY: false});
}

/**
 * Remove layers that do not overlap with the current terrain cover.
 * This implementation only has effect when a TileLayer is overlaid on top of a TileLayer
 */
function getIntersectingLayers(sourceTile: Tile2DHeader | null, layers: Layer[]): Layer[] {
  if (sourceTile) {
    return layers.filter(layer => {
      const tile = getTile(layer);
      if (tile) {
        return intersect(sourceTile.bbox, tile.bbox);
      }
      return true;
    });
  }
  return layers;
}

/** If layer is the descendent of a TileLayer, return the corresponding tile. */
function getTile(layer: Layer | null): Tile2DHeader | null {
  while (layer) {
    // @ts-expect-error tile may not exist
    const {tile} = layer.props;
    if (tile) {
      return tile;
    }
    layer = layer.parent;
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
