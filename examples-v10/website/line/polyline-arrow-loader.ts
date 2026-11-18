// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Field, FixedSizeList, Float64, Table, vectorFromArray} from 'apache-arrow';
import type {LoaderOptions, LoaderWithParser} from '@loaders.gl/core/loader-utils';

/** Decimal precision of the Google encoded-polyline coordinates. */
type PolylineLoaderOptions = LoaderOptions & {polyline?: {precision?: number}};

/** Decodes one encoded polyline into longitude/latitude pairs. */
export function decodePolyline(text: string, precision = 5): number[][] {
  if (!Number.isInteger(precision) || precision < 0 || precision > 7) {
    throw new Error('Invalid polyline precision');
  }
  const coordinates: number[][] = [];
  const factor = 10 ** precision;
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  /** Reads one signed variable-length coordinate delta. */
  function readDelta(): number {
    let value = 0;
    let shift = 0;
    while (index < text.length && shift <= 30) {
      const byte = text.charCodeAt(index++) - 63;
      if (byte < 0 || byte > 63) throw new Error('Invalid polyline character');
      value += (byte & 31) * 2 ** shift;
      if (byte < 32) return value % 2 ? -(value + 1) / 2 : value / 2;
      shift += 5;
    }
    throw new Error('Truncated or oversized polyline coordinate');
  }
  while (index < text.length) {
    latitude += readDelta();
    longitude += readDelta();
    coordinates.push([longitude / factor, latitude / factor]);
  }
  return coordinates;
}

/** Packs fixed-width coordinates for direct Arrow layer accessors. */
export function positionVector(points: readonly number[][], size: number) {
  return vectorFromArray(points, new FixedSizeList(size, new Field('item', new Float64(), false)));
}

/** Produces one LineLayer row per adjacent coordinate pair. */
function parsePolyline(text: string, options?: PolylineLoaderOptions): Table {
  const points = decodePolyline(text.trim(), options?.polyline?.precision);
  return new Table({
    start: positionVector(points.slice(0, -1), 2),
    end: positionVector(points.slice(1), 2)
  });
}

/** Internal example loader for a single Google/Mapbox encoded polyline. */
export const PolylineArrowLoader = {
  id: 'polyline',
  name: 'Encoded Polyline Arrow',
  module: 'deck.gl-examples',
  version: '1.0.0',
  extensions: ['polyline'],
  mimeTypes: ['text/plain'],
  text: true,
  options: {polyline: {precision: 5}},
  parse: async (data: ArrayBuffer, options?: PolylineLoaderOptions) =>
    parsePolyline(new TextDecoder().decode(data), options),
  parseTextSync: parsePolyline
} as const satisfies LoaderWithParser<Table, never, PolylineLoaderOptions>;
