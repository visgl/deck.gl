// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Framebuffer} from '@luma.gl/core';
import type {FilterContext, Layer} from '@deck.gl/core';
import type {Bounds} from '../utils/projection-utils';

/** Draws the layers draped over the ground into a framebuffer of the host, without clearing it. */
export type ExternalTerrainDrapeRenderer = (opts: {
  /** The framebuffer of the host to draw into */
  target: Framebuffer;
  /** The area that `target` covers in Web Mercator common space, with `minY` in its first row */
  bounds: Bounds;
  /** Selects the layers to draw, by the root layer as in `Deck.layerFilter` */
  layerFilter?: (context: FilterContext) => boolean;
  /** Framebuffer pixels per CSS pixel, which sizes layers with pixel units */
  devicePixelRatio?: number;
}) => void;

/**
 * (Experimental) Terrain drawn by another renderer, such as a base map.
 * A layer with `operation: 'terrain'` hands it to the `TerrainEffect` in its `externalTerrain` prop.
 */
export type ExternalTerrain = {
  /** Identifies the surface, and changes whenever it changes other than by camera movement. */
  id: string;
  /**
   * Draws the ground elevation in meters into the red channel of `target`, and 1 into its alpha
   * where the elevation is known. `bounds` is the area that `target` covers in Web Mercator common
   * space, with `minY` in its first row.
   */
  renderHeightMap: (opts: {target: Framebuffer; bounds: Bounds}) => void;
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
