// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {TileIndex} from '../shared-tileset-2d/types';

/** URL template accepted by {@link SharedTile2DLayer} when loading tiles directly by URL. */
export type URLTemplate = string | string[] | null;

function stringHash(s: string): number {
  return Math.abs(s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
}

/** Expands one tile URL template for a given tile index. */
export function getURLFromTemplate(
  template: URLTemplate,
  tile: {
    index: TileIndex;
    id: string;
  }
): string | null {
  if (!template || !template.length) {
    return null;
  }
  const {index, id} = tile;

  if (Array.isArray(template)) {
    template = template[stringHash(id) % template.length];
  }

  let url = template;
  for (const key of Object.keys(index)) {
    url = url.replace(new RegExp(`{${key}}`, 'g'), String(index[key as keyof TileIndex]));
  }

  if (Number.isInteger(index.y) && Number.isInteger(index.z)) {
    url = url.replace(/\{-y\}/g, String(Math.pow(2, index.z) - index.y - 1));
  }
  return url;
}
