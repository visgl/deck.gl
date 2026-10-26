// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {CRSDescriptor} from '@math.gl/projection/core';
import {resolveCRS} from '../../utils/crs';
import type {CoordinateSystem} from '../../lib/constants';
import type Viewport from '../../viewports/viewport';
import {PROJECTION_MODE} from './constants';

/** Whether a projection shader can consume attributes in a source CRS directly. */
export function supportsSourceCRS(
  projectionMode: number,
  sourceCrs: CRSDescriptor | null,
  targetCrs?: CRSDescriptor
): boolean {
  if (!sourceCrs) return true;
  switch (projectionMode) {
    case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
      return sourceCrs.signature === targetCrs?.signature;
    case PROJECTION_MODE.WEB_MERCATOR:
    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
    case PROJECTION_MODE.GLOBE:
    case PROJECTION_MODE.IDENTITY:
      // Mercator and globe shaders accept geographic attributes, not geocentric
      // meters or southward tile coordinates, even when those match the target CRS.
      return sourceCrs.signature === 'WGS84';
    default:
      return false;
  }
}

/** Resolve the absolute input CRS of a project operation after default/offset aliases. */
export function getSourceCRS(
  coordinateSystem: CoordinateSystem,
  viewport: Viewport
): CRSDescriptor | null {
  coordinateSystem ??= 'default';
  if (typeof coordinateSystem !== 'string' && typeof coordinateSystem !== 'object') {
    throw new Error(`Invalid coordinateSystem: ${coordinateSystem}`);
  }
  let name = coordinateSystem;
  switch (coordinateSystem) {
    case 'default':
      name = viewport.isGeospatial ? 'WGS84' : 'cartesian';
      break;
  }
  if (name === viewport.crs?.signature) return viewport.crs;
  const crs = resolveCRS(name);
  if (crs instanceof Promise) throw new Error(`Coordinate system not loaded: ${coordinateSystem}`);
  return crs;
}

/** Describe packed attributes in the legacy shader coordinate-system vocabulary. */
export function getPackedCoordinateSystem(
  coordinateSystem: CoordinateSystem,
  viewport: Viewport,
  sourceCrs = getSourceCRS(coordinateSystem, viewport)
): {
  coordinateSystem: string;
  preprojected: boolean;
} {
  // Explicit local modes bypass CRS conversion on both CPU and GPU paths.
  switch (coordinateSystem) {
    case 'cartesian':
    case 'meter-offsets':
      return {coordinateSystem, preprojected: false};
  }
  const preprojected = !supportsSourceCRS(viewport.projectionMode, sourceCrs, viewport.crs);
  if (preprojected) {
    switch (viewport.projectionMode) {
      case PROJECTION_MODE.CUSTOM_GEOSPATIAL:
        return {coordinateSystem: 'cartesian', preprojected};
      default:
        return {coordinateSystem: 'lnglat', preprojected};
    }
  }
  switch (coordinateSystem) {
    case 'default':
      return {coordinateSystem: sourceCrs ? 'lnglat' : 'cartesian', preprojected};
    case 'lnglat-offsets':
      return {coordinateSystem, preprojected};
  }
  switch (sourceCrs?.signature) {
    case 'WGS84':
      return {coordinateSystem: 'lnglat', preprojected};
    default:
      return {coordinateSystem: 'cartesian', preprojected};
  }
}
