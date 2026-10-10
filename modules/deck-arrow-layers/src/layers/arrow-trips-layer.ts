// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ArrowPathSourceVectorSelectors} from '@luma.gl/arrow';
import {ArrowPathLayer, type ArrowPathLayerProps} from './arrow-path-layer';
import {DECK_ARROW_ALPHA_BLEND_PARAMETERS} from './arrow-layer-types';

/** Trips specialization backed by aligned Arrow path and timestamp columns. */
export type ArrowTripsLayerProps = Omit<
  ArrowPathLayerProps,
  'model' | 'temporalEnabled' | 'timestamps'
> & {
  /** Per-path temporal values aligned with path vertices. */
  timestamps: NonNullable<ArrowPathSourceVectorSelectors['timestamps']>;
  /** Current animation time in the prepared timestamp unit. */
  currentTime: number;
  /** Visible trail length in the prepared timestamp unit. */
  trailLength: number;
  /** Whether older trail vertices fade across the trail window. Defaults to true. */
  fadeTrail?: boolean;
};

/** WebGPU Arrow TripsLayer that never appends timestamps to CPU coordinate arrays. */
export class ArrowTripsLayer extends ArrowPathLayer {
  static override layerName = 'ArrowTripsLayer';
  static override defaultProps = {
    ...ArrowPathLayer.defaultProps,
    model: 'storage',
    temporalEnabled: true,
    fadeTrail: true,
    parameters: DECK_ARROW_ALPHA_BLEND_PARAMETERS
  };
}
