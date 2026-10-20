// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {normalizeCRS, ProjectionTransform} from '@math.gl/projection/core';
import type {ProjectionTransformCreateOptions, NormalizedCRS} from '@math.gl/projection/core';
import type {ProjectionConverter} from './viewports/custom-projection-viewport';

/** Options for a prepared planar converter. Source coordinates use longitude/latitude or
 * easting/northing order. The target must use east/north/up axes and meters, including altitude.
 * CRS descriptors from loaders.gl are accepted through math.gl's from and to options.
 */
export type ProjectionConverterOptions = Omit<ProjectionTransformCreateOptions, 'enforceAxis'>;

/** Prepare a math.gl transform for CustomProjectionView. Import from @deck.gl/core/projection.
 * Loading finishes before this promise resolves; rendering and picking remain synchronous.
 * Unsupported CRS definitions, missing plugins/grids, lossy transforms and nonplanar targets
 * reject the promise. Inverse failures return null, as required by deck's converter contract.
 * @experimental
 */
export async function createProjectionConverter(
  options: ProjectionConverterOptions
): Promise<ProjectionConverter> {
  const source = normalizeCRS(options.from ?? 'WGS84', options);
  const target = normalizeCRS(options.to ?? 'WGS84', options);
  validateCoordinates(source);
  validateCoordinates(target);
  if (target.kind !== 'projected' || target.toMeter !== 1 || target.verticalUnit !== 1) {
    throw new Error('Projection target must be planar XYZ in meters');
  }
  const transform = await ProjectionTransform.create({...options, enforceAxis: false});
  if (transform.lossy) throw new Error('Projection converter requires a lossless transform');
  return {
    sourceCoordinates: {
      kind: source.kind as 'geographic' | 'projected',
      unitScale: source.kind === 'geographic' ? source.angularUnit : source.toMeter,
      semiMajorAxis: source.ellipsoid.semiMajorAxis,
      eccentricitySquared: source.ellipsoid.eccentricitySquared
    },
    forward: position => transform.projectSync(position),
    inverse: position => {
      try {
        const result = transform.unprojectSync(position);
        return result.every(Number.isFinite) ? result : null;
      } catch {
        return null;
      }
    }
  };
}

function validateCoordinates(crs: NormalizedCRS): void {
  if (
    (crs.kind !== 'geographic' && crs.kind !== 'projected') ||
    (crs.storedAxis ?? 'enu') !== 'enu'
  ) {
    throw new Error('Projection converter requires longitude/latitude or east/north/up order');
  }
}
