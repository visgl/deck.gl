// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {cellToBoundary} from 'h3-js';

/**
 * Get the center position of an H3 cell
 * @param cellId H3 cell ID
 * @returns [longitude, latitude] coordinates of the cell center
 */
export function getH3Position(cellId: string): [number, number] {
  const boundary = cellToBoundary(cellId);
  const latitudes = boundary.map(coord => coord[0]);
  const longitudes = boundary.map(coord => coord[1]);
  
  // Calculate centroid
  const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
  const centerLon = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;
  
  return [centerLon, centerLat];
}