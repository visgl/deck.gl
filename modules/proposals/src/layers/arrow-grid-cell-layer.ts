// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type LayerProps} from '@deck.gl/core';
import type {FixedSizeList, Float32, Uint8} from 'apache-arrow';
import {ArrowColumnLayer} from './arrow-column-layer';
import type {ArrowGPUVectorColumnSelector, ArrowGPUVectorLayerData} from './arrow-gpu-layer-utils';

type PositionType = FixedSizeList<Float32>;
type ColorType = FixedSizeList<Uint8>;

/** Arrow adapter props retaining deck's standard GridCell accessor names. */
export type ArrowGridCellLayerProps = Omit<LayerProps, 'data'> & {
  data: ArrowGPUVectorLayerData;
  getPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getFillColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
  getCellSize?: number | ArrowGPUVectorColumnSelector<Float32>;
  getElevation?: number | ArrowGPUVectorColumnSelector<Float32>;
  cellSizeScale?: number;
  elevationScale?: number;
};

/** Square-cell Arrow specialization that delegates conversion to ArrowColumnLayer. */
export class ArrowGridCellLayer extends CompositeLayer<ArrowGridCellLayerProps> {
  static override layerName = 'ArrowGridCellLayer';

  override renderLayers(): ArrowColumnLayer {
    const {getCellSize, cellSizeScale, ...props} = this.props;
    return new ArrowColumnLayer({
      ...props,
      id: `${this.props.id}-column`,
      getRadius: getCellSize,
      radiusScale: (cellSizeScale ?? 1) / Math.SQRT2,
      diskResolution: 4,
      angle: 45
    });
  }
}
