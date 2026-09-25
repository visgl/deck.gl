// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {CustomProjectionViewportOptions} from '@deck.gl/core';

export type ProjectionConfig = Pick<
  CustomProjectionViewportOptions,
  'projection' | 'fromBounds' | 'fromCrs' | 'toCrs' | 'getDistanceScale'
> & {
  note: string;
};
