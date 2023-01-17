// deck.gl, MIT license

import {TileIndex} from './tile-index-utils';

/**
 * Returns true if s is a valid URL template
 */
export function isURLTemplate(s: string): boolean {
  return /(?=.*{z})(?=.*{x})(?=.*({y}|{-y}))/.test(s);
}

/**
 * Create a loadable URL to a tile from a URL template and a tile index
 */
export function getURLFromTemplate(
  template: string | string[],
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
    const i = stringHash(id) % template.length;
    template = template[i];
  }

  let url = template;
  for (const key of Object.keys(index)) {
    const regex = new RegExp(`{${key}}`, 'g');
    url = url.replace(regex, String(index[key]));
  }

  // Back-compatible support for {-y}
  if (Number.isInteger(index.y) && Number.isInteger(index.z)) {
    url = url.replace(/\{-y\}/g, String(Math.pow(2, index.z) - index.y - 1));
  }
  return url;
}

/**
 * Generate a hash for a string
 */
function stringHash(s: string): number {
  return Math.abs(s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
}
