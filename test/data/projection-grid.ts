// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type ProjectionGridPoint = {position: [number, number]; value: number};

export const projectionGridBounds = [-135, 30, -45, 75] as const;

// Include every boundary, with no randomness or external data dependencies.
// Two smooth peaks make misplaced bins and weight textures easy to spot.
export const projectionGrid: ProjectionGridPoint[] = [];
for (let longitude = projectionGridBounds[0]; longitude <= projectionGridBounds[2]; longitude++) {
  for (let latitude = projectionGridBounds[1]; latitude <= projectionGridBounds[3]; latitude++) {
    const westPeak = Math.exp(-(((longitude + 112) / 13) ** 2) - ((latitude - 43) / 8) ** 2);
    const eastPeak = Math.exp(-(((longitude + 65) / 15) ** 2) - ((latitude - 61) / 9) ** 2);
    projectionGrid.push({
      position: [longitude, latitude],
      value: 1 + 8 * westPeak + 6 * eastPeak
    });
  }
}
