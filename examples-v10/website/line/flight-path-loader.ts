// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Table, Utf8, vectorFromArray} from 'apache-arrow';
import type {LoaderWithParser} from '@loaders.gl/core/loader-utils';
import {decodePolyline, positionVector} from './polyline-arrow-loader';

/** Decodes the example's tab-separated metadata and paired polyline streams. */
function parseFlightPaths(text: string): Table {
  const names: string[] = [];
  const countries: string[] = [];
  const starts: number[][] = [];
  const ends: number[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const parts = line.split('\t');
    if (parts.length !== 4) throw new Error('Invalid flight path record');
    const [name, country, positions, elevations] = parts;
    const paths = positions.split('\x01');
    const altitudePaths = elevations.split('\x01');
    if (paths.length !== altitudePaths.length) throw new Error('Mismatched flight path streams');
    for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
      const points = decodePolyline(paths[pathIndex], 5);
      const altitudes = decodePolyline(altitudePaths[pathIndex], 1);
      if (points.length !== altitudes.length) throw new Error('Mismatched flight path coordinates');
      for (let index = 1; index < points.length; index++) {
        names.push(name);
        countries.push(country);
        starts.push([...points[index - 1], altitudes[index - 1][0]]);
        ends.push([...points[index], altitudes[index][0]]);
      }
    }
  }
  return new Table({
    name: vectorFromArray(names, new Utf8()),
    country: vectorFromArray(countries, new Utf8()),
    start: positionVector(starts, 3),
    end: positionVector(ends, 3)
  });
}

/** Internal adapter for the Heathrow dataset's custom encoded-polyline envelope. */
export const FlightPathArrowLoader = {
  id: 'flight-path',
  name: 'Flight Path Arrow',
  module: 'deck.gl-examples',
  version: '1.0.0',
  extensions: ['txt'],
  mimeTypes: ['text/plain'],
  text: true,
  options: {},
  parse: async (data: ArrayBuffer) => parseFlightPaths(new TextDecoder().decode(data)),
  parseTextSync: parseFlightPaths
} as const satisfies LoaderWithParser<Table>;
