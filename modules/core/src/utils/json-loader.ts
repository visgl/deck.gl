// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Loader} from '@loaders.gl/loader-utils';

function isJSON(text: string): boolean {
  const firstChar = text[0];
  const lastChar = text[text.length - 1];
  return (firstChar === '{' && lastChar === '}') || (firstChar === '[' && lastChar === ']');
}

// A light weight version instead of @loaders.gl/json (stream processing etc.)
export default {
  dataType: null as any,
  batchType: null as never,
  id: 'JSON',
  name: 'JSON',
  module: '',
  version: '',
  options: {},
  extensions: ['json', 'geojson'],
  mimeTypes: ['application/json', 'application/geo+json'],
  testText: isJSON,
  parseTextSync: JSON.parse
} as Loader;
