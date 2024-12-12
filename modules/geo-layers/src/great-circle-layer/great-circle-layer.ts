// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {DefaultProps} from '@deck.gl/core';
import {ArcLayer, ArcLayerProps} from '@deck.gl/layers';

const defaultProps: DefaultProps<ArcLayerProps> = {
  getHeight: {type: 'accessor', value: 0},
  greatCircle: true
};

/** All properties supported by GreatCircleLayer. */
export type GreatCircleLayerProps<DataT = unknown> = ArcLayerProps<DataT>;

// This layer has been merged into the core ArcLayer
// Keeping for backward-compatibility
/** @deprecated Use ArcLayer with `greatCircle: true` instead */
export default class GreatCircleLayer<DataT = any, ExtraProps extends {} = {}> extends ArcLayer<
  DataT,
  ExtraProps
> {
  static layerName = 'GreatCircleLayer';
  static defaultProps = defaultProps;
}
