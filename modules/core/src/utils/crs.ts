// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getCRSExecutionKey} from '@math.gl/geospatial/crs';
import {projectionEngine} from '@math.gl/geospatial/projection';
import type {
  CRSEngine,
  CRSConversion,
  CRSDescriptor,
  TypeScriptCRSInput
} from '@math.gl/geospatial/projection/core';
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

/** Default shared math.gl engine; injected engines remain caller-owned. */
export const defaultProjectionEngine = projectionEngine;

/** Validate the descriptor-capable math.gl factory before changing rendering state. */
export function getProjectionEngine(engine?: CRSEngine | null): CRSEngine {
  const resolved = engine ?? defaultProjectionEngine;
  if (
    typeof resolved.getCRS !== 'function' ||
    typeof resolved.createProjection !== 'function' ||
    typeof resolved.createProjectionAsync !== 'function'
  ) {
    throw new Error('projectionEngine requires getCRS, createProjection and createProjectionAsync');
  }
  return resolved;
}

const engineCaches = new WeakMap<CRSEngine, Map<string, CRSDescriptor | Promise<CRSDescriptor>>>();
const engineIds = new WeakMap<CRSEngine, number>();
const descriptorEngines = new WeakMap<CRSDescriptor, number>();
let nextEngineId = 0;

const defaultResolvedCRS = new Map<string, CRSDescriptor | Promise<CRSDescriptor>>([
  [WGS84_CRS.signature, WGS84_CRS],
  [GLOBE_CRS.signature, GLOBE_CRS],
  [OSM_TILE_CRS.signature, OSM_TILE_CRS]
]);

/** Compare supplied CRS definitions synchronously, using the resolver's key convention. */
export function areCRSEqual(a: TypeScriptCRSInput, b: TypeScriptCRSInput): boolean {
  if (a === b) return true;
  const keyA = typeof a === 'string' ? a : JSON.stringify(a);
  const keyB = typeof b === 'string' ? b : JSON.stringify(b);
  return keyA === keyB;
}

/** Resolve built-in attribute CRSs synchronously, sharing loading and loaded math.gl descriptors.
 * Accepts the same CRS definitions and spatial-reference objects as math.gl.
 * Cartesian positions and meter offsets do not declare an absolute source CRS.
 */
export function resolveCRS(
  coordinateSystem: TypeScriptCRSInput,
  engine: CRSEngine = defaultProjectionEngine
): CRSDescriptor | Promise<CRSDescriptor> | null {
  let definition = coordinateSystem;
  switch (typeof coordinateSystem === 'string' ? coordinateSystem.toLowerCase() : null) {
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
  let resolvedCRS = engineCaches.get(engine);
  if (!resolvedCRS) {
    resolvedCRS = engine === defaultProjectionEngine ? defaultResolvedCRS : new Map();
    engineCaches.set(engine, resolvedCRS);
    engineIds.set(engine, nextEngineId++);
  }
  // Key structured definitions by their contents so newly allocated equivalent inputs share loading.
  const key = typeof definition === 'string' ? definition : JSON.stringify(definition);
  const existing = resolvedCRS.get(key);
  if (existing) return existing;
  const pending = engine.getCRS(definition).then(
    crs => {
      // Keep caller metadata untouched while namespacing rendering caches by factory.
      if (engine !== defaultProjectionEngine) {
        crs = {...crs, getRenderingScale: crs.getRenderingScale.bind(crs)};
        descriptorEngines.set(crs, engineIds.get(engine)!);
      }
      resolvedCRS.set(key, crs);
      resolvedCRS.set(crs.signature, crs);
      return crs;
    },
    error => {
      // Allow a fresh request after a transient load failure without evicting a newer result.
      if (resolvedCRS.get(key) === pending) resolvedCRS.delete(key);
      throw error;
    }
  );
  resolvedCRS.set(key, pending);
  return pending;
}

/** Prepared descriptors carry the actual conversion functions, unlike CRS definitions. */
export function isCRSDescriptor(crs: TypeScriptCRSInput | CRSDescriptor): crs is CRSDescriptor {
  if (typeof crs !== 'object' || crs === null || !('converter' in crs)) return false;
  const converter = (crs as CRSDescriptor).converter?.WGS84;
  return (
    typeof converter?.from === 'function' &&
    typeof converter.to === 'function' &&
    typeof converter.normalize === 'function'
  );
}

const descriptorIds = new WeakMap<CRSDescriptor, number>();
let nextDescriptorId = 0;

/** Unknown execution identity permits reuse only for the same descriptor object. */
export function getProjectionExecutionKey(crs: CRSDescriptor): string | number {
  const key = getCRSExecutionKey(crs);
  const engineId = descriptorEngines.get(crs);
  if (engineId !== undefined)
    return JSON.stringify(['engine', engineId, key ?? getDescriptorId(crs)]);
  if (key !== null) return key;
  return getDescriptorId(crs);
}

function getDescriptorId(crs: CRSDescriptor): number {
  let id = descriptorIds.get(crs);
  if (id === undefined) {
    id = nextDescriptorId++;
    descriptorIds.set(crs, id);
  }
  return id;
}
