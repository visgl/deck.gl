// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {geoEquirectangular, geoOrthographic} from 'd3-geo';
import {geoInterruptedMollweide} from 'd3-geo-polygon';
import {createProjectionRegistry} from '@ateliercartographie/geoarrow-deck-stream/worker';
import type {SimpleProjectionSpec} from '@ateliercartographie/geoarrow-deck-stream/worker';

export const registry = createProjectionRegistry({geoInterruptedMollweide});
export const projections: Record<string, SimpleProjectionSpec> = {
  equirectangular: {projection: 'geoEquirectangular'},
  orthographic: {projection: 'geoOrthographic', rotate: [-20, 30], clipAngle: 90},
  interrupted: {projection: 'geoInterruptedMollweide'}
};
export function projectionSpec(name: string): SimpleProjectionSpec {
  return {...projections[name], scale: 140, translate: [0, 0], precision: 0.2};
}
// Factories are also explicit here so the raster inverse has a typed interface.
export function createProjection(name: string) {
  const p =
    name === 'orthographic'
      ? geoOrthographic().rotate([-20, 30]).clipAngle(90)
      : name === 'interrupted'
        ? geoInterruptedMollweide()
        : geoEquirectangular();
  return p.scale(140).translate([0, 0]).precision(0.2);
}
