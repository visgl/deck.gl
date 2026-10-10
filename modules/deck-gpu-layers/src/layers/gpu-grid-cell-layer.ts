// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type LayerProps} from '@deck.gl/core';
import type {GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {GPUColumnLayer} from './gpu-column-layer';

/** GPUVector-native square grid-cell props. Input vectors are borrowed. */
export type GPUGridCellLayerProps = Omit<LayerProps, 'data'> & {
  getPosition: GPUVector<'float32x2'>;
  getFillColor?: Color | GPUVector<'unorm8x4'>;
  getCellSize?: number | GPUVector<'float32'>;
  getElevation?: number | GPUVector<'float32'>;
  cellSizeScale?: number;
  elevationScale?: number;
};

/** Square-cell specialization of the GPUVector column core. */
export class GPUGridCellLayer extends CompositeLayer<GPUGridCellLayerProps> {
  static override layerName = 'GPUGridCellLayer';

  override renderLayers(): GPUColumnLayer {
    const {getCellSize, cellSizeScale, ...props} = this.props;
    return new GPUColumnLayer({
      ...props,
      id: `${this.props.id}-column`,
      getRadius: getCellSize,
      radiusScale: (cellSizeScale ?? 1) / Math.SQRT2,
      diskResolution: 4,
      angle: 45
    });
  }
}
