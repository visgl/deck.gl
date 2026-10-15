// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {projectionEngine} from '@math.gl/projection';
import type {CRSConversion, CRSDescriptor} from '@math.gl/projection/core';
import {GLOBE_CRS} from '../viewports/globe-util';
import {OSM_TILE_CRS} from '../viewports/web-mercator-util';

const identity: CRSConversion = ((coordinate, output?) => {
  if (!output) return Array.from(coordinate);
  for (let i = 0; i < coordinate.length; i++) output[i] = coordinate[i];
  return output;
}) as CRSConversion;

/** Canonical longitude/latitude/elevation attribute CRS, in degrees/degrees/meters. */
export const WGS84_CRS: CRSDescriptor = {
  signature: 'WGS84',
  projection: 'longlat',
  parameters: {proj: 'longlat', datum: 'WGS84'},
  coordinateFrame: 'geographic',
  ellipsoid: {semiMajorAxis: 6378137, semiMinorAxis: 6356752.314245179},
  axis: 'enu',
  xUnit: {name: 'degrees', degreesPerUnit: 1},
  yUnit: {name: 'degrees', degreesPerUnit: 1},
  zUnit: {name: 'meters', metersPerUnit: 1},
  lossy: false,
  renderingBounds: [
    [-180, -90, 0],
    [180, 90, 0]
  ],
  // This descriptor identifies attributes; built-in cameras supply their geographic scales.
  renderingScale: () => null,
  getRenderingScale: () => null,
  converter: {WGS84: {from: identity, to: identity, normalize: identity}}
};

const resolvedCRS = new Map<string, CRSDescriptor | Promise<CRSDescriptor>>([
  [WGS84_CRS.signature, WGS84_CRS],
  [GLOBE_CRS.signature, GLOBE_CRS],
  [OSM_TILE_CRS.signature, OSM_TILE_CRS]
]);

/** Resolve built-in attribute CRSs synchronously, sharing loading and loaded math.gl descriptors.
 * Cartesian positions and meter offsets do not declare an absolute source CRS.
 */
export function resolveCRS(
  coordinateSystem: string
): CRSDescriptor | Promise<CRSDescriptor> | null {
  let definition = coordinateSystem;
  switch (coordinateSystem.toLowerCase()) {
    case 'lnglat':
    case 'longlat':
    case 'wgs84':
    case 'epsg:4326':
    case 'epsg:4979':
    case 'lnglat-offsets':
      return WGS84_CRS;
    case 'globe':
      return GLOBE_CRS;
    case 'cartesian':
    case 'meter-offsets':
      return null;
    case 'epsg:4328':
      definition = 'EPSG:4978';
      break;
  }
  const existing = resolvedCRS.get(definition);
  if (existing) return existing;
  const pending = projectionEngine.getCRS(definition).then(crs => {
    resolvedCRS.set(definition, crs);
    resolvedCRS.set(crs.signature, crs);
    return crs;
  });
  resolvedCRS.set(definition, pending);
  return pending;
}
