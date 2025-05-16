// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type CoordPair} from '../h3-js-bigint/h3-js-bigint';

// normalize longitudes w.r.t center (refLng), when not provided first vertex
export function normalizeLongitudes(vertices: CoordPair[], refLng?: number): void {
  refLng = refLng === undefined ? vertices[0][0] : refLng;
  for (const pt of vertices) {
    const deltaLng = pt[0] - refLng;
    if (deltaLng > 180) {
      pt[0] -= 360;
    } else if (deltaLng < -180) {
      pt[0] += 360;
    }
  }
}
