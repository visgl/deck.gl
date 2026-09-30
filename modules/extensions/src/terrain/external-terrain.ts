// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Framebuffer} from '@luma.gl/core';
import type {FilterContext, Layer} from '@deck.gl/core';

/** Rectangle in Web Mercator common space: `[minX, minY, maxX, maxY]`. */
export type ExternalTerrainBounds = [minX: number, minY: number, maxX: number, maxY: number];

/**
 * Draws the layers draped over the ground into a framebuffer of the host, covering `bounds`
 * with `minY` in its first row, without clearing it.
 */
export type ExternalTerrainDrapeRenderer = (
  target: Framebuffer,
  bounds: ExternalTerrainBounds,
  options?: {
    /** Selects the layers to draw, by the root layer as in `Deck.layerFilter` */
    layerFilter?: (context: FilterContext) => boolean;
    /** Framebuffer pixels per CSS pixel, which sizes layers with pixel units */
    devicePixelRatio?: number;
  }
) => void;

/**
 * (Experimental) Terrain drawn by another renderer, such as a base map.
 * A layer with `operation: 'terrain'` hands it to the `TerrainEffect` in its `externalTerrain` prop.
 */
export type ExternalTerrain = {
  /** Changes whenever the surface changes other than by camera movement. */
  revision: number;
  /**
   * Draws the ground elevation in meters into the red channel of `target`, and 1 into its alpha
   * where the elevation is known, covering `bounds` with `minY` in the first row.
   */
  renderHeightMap: (target: Framebuffer, bounds: ExternalTerrainBounds) => void;
  /** Receives the function that draws the draped layers, or `null` when they stop following this terrain. */
  setDrapeRenderer?: (render: ExternalTerrainDrapeRenderer | null) => void;
  /** Called with the draped layers when they, or what they draw, change. */
  onDrapeChange?: (layers: Layer[]) => void;
};

/** Props of a layer with `operation: 'terrain'` that stands for terrain drawn by another renderer */
export type ExternalTerrainLayerProps = {
  externalTerrain?: ExternalTerrain | null;
};

/** Returns the terrain drawn by another renderer that the layer stands for, if any */
export function getExternalTerrain(layer: Layer): ExternalTerrain | null {
  return (layer.props as ExternalTerrainLayerProps).externalTerrain ?? null;
}
