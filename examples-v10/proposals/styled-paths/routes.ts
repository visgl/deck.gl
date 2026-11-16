// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import type {Route} from './stroke-layer';

/** Fictional routes in local east/north/up metres, following the river district streets. */
export const ROUTES: Route[] = [
  {
    name: 'West promenade',
    color: [1, 0.64, 0.25],
    path: [
      [-185, -555, 2],
      [-175, -390, 2],
      [-184, -270, 2],
      [-175, -120, 2],
      [-180, 105, 2],
      [-170, 290, 2],
      [-190, 430, 2],
      [-175, 555, 2]
    ]
  },
  {
    name: 'East promenade',
    color: [0.3, 0.85, 1],
    path: [
      [185, -555, 2],
      [175, -390, 2],
      [184, -270, 2],
      [175, -120, 2],
      [180, 105, 2],
      [170, 290, 2],
      [190, 430, 2],
      [175, 555, 2]
    ]
  },
  {
    name: 'South crossing',
    color: [1, 0.46, 0.4],
    path: [
      [-330, -265, 2],
      [-170, -265, 2],
      [-120, -265, 14],
      [120, -265, 14],
      [170, -265, 2],
      [330, -265, 2]
    ]
  },
  {
    name: 'North crossing',
    color: [0.77, 0.64, 1],
    path: [
      [-330, 275, 2],
      [-170, 275, 2],
      [-120, 275, 14],
      [120, 275, 14],
      [170, 275, 2],
      [330, 275, 2]
    ]
  },
  {
    name: 'Garden loop',
    color: [0.6, 1, 0.59],
    closed: true,
    path: [
      [-154, -502, 2],
      [-90, -502, 2],
      [-90, -438, 2],
      [-154, -438, 2]
    ]
  },
  {
    name: 'Garden approach',
    color: [0.6, 1, 0.59],
    path: [
      [-275, -550, 2],
      [-220, -550, 2],
      [-220, -520, 2],
      [-175, -520, 2],
      [-154, -485, 2]
    ]
  }
];
