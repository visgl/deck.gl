// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Color} from '@deck.gl/core';

export const LANDCOVER_LEGEND = [
  {color: [230, 0, 0], label: 'Urban', selected: true},
  {color: [0, 140, 74], label: 'Evergreen Needleleaf', selected: true},
  {color: [178, 178, 115], label: 'Grasslands', selected: true},
  {color: [0, 200, 76], label: 'Evergreen Broadleaf', selected: true},
  {color: [230, 210, 178], label: 'Croplands', selected: true},
  {color: [178, 211, 156], label: 'Deciduous Needleleaf', selected: true},
  {color: [74, 140, 140], label: 'Wetlands', selected: true},
  {color: [126, 201, 126], label: 'Deciduous Broadleaf', selected: true},
  {color: [178, 178, 178], label: 'Cropland', selected: true},
  {color: [178, 178, 115], label: 'Mixed Forests', selected: true},
  {color: [230, 230, 74], label: 'Savannas', selected: true},
  {color: [178, 140, 74], label: 'Woody Savannas', selected: true},
  {color: [210, 178, 115], label: 'Open Shrublands', selected: true},
  {color: [230, 230, 178], label: 'Closed Shrublands', selected: true},
  {color: [44, 44, 138], label: 'Water', selected: true},
  {color: [230, 230, 230], label: 'Snow and Ice', selected: true},
  {color: [178, 140, 140], label: 'Barren', selected: true}
] as {color: Color; label: string; selected: boolean}[];
