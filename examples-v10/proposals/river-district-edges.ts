// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Geometry, makeEdgeGeometry, type MakeEdgeGeometryOptions} from '@luma.gl/engine';
import {makeCityFeatures, makeCityMesh, type CityFeature} from './river-district-data';
export {CITY_ORIGIN as ORIGIN} from './river-district-data';

export type BuildingFeature = CityFeature & {id: number};

export function makeBuildings(): BuildingFeature[] {
  return makeCityFeatures()
    .map((feature, index) => ({...feature, id: index}))
    .filter(feature => feature.kind === 'building');
}

/** Extract actual face boundaries and creases from the same triangles used by the fill layer. */
export function makeEdges(
  features: readonly BuildingFeature[],
  options: MakeEdgeGeometryOptions = {}
): Float32Array {
  const segments: number[] = [];
  features.forEach((feature, featureIndex) => {
    const mesh = makeCityMesh([feature]);
    const positions = new Float32Array((mesh.length / 10) * 3);
    for (let offset = 0; offset < mesh.length; offset += 10) {
      positions.set(mesh.subarray(offset, offset + 3), (offset / 10) * 3);
    }
    const geometry = new Geometry({topology: 'triangle-list', attributes: {POSITION: positions}});
    const edges = makeEdgeGeometry(geometry, options);
    const indices = edges.indices!.value;
    for (let offset = 0; offset < indices.length; offset += 2) {
      const start = indices[offset] * 3;
      const end = indices[offset + 1] * 3;
      segments.push(
        ...positions.subarray(start, start + 3),
        ...positions.subarray(end, end + 3),
        featureIndex,
        feature.id * 37 + offset / 2 + 1
      );
    }
  });
  return new Float32Array(segments);
}
