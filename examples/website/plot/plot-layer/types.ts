// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';

export type Vec3 = [x: number, y: number, z: number];

export type Axis<Name extends string = 'x' | 'y' | 'z'> = {
  name: Name;
  /** Minimum value to show on this axis */
  min: number;
  /** Maximum value to show on this axis */
  max: number;
  /** Label for the axis, default to the value of `name`
   */
  title?: string;
  /** If specified, will be used to remap input value to model space */
  scale?: (x: number) => number;
  /** A list of input values at which to draw grid lines and labels
   * @default [min, max]
   */
  ticks?: number[];
};

export type Axes = {
  x: Axis<'x'>;
  y: Axis<'y'>;
  z: Axis<'z'>;
};

export type TickFormat = (t: number, axis: Axis) => string;

export type PlotLayerPickingInfo = PickingInfo<
  null,
  {
    uv?: [number, number];
    /** Surface coordinate as defined by the equation z=f(x,y) */
    sample?: [x: number, y: number, z: number];
  }
>;
