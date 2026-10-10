// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type LayerProps} from '@deck.gl/core';
import type {GPUVector, VertexList} from '@luma.gl/gpgpu/gpu-data';
import {GPUPathLayer} from './gpu-path-layer';
import {GPUSolidPolygonLayer} from './gpu-solid-polygon-layer';

/** GPUVector-native filled-and-stroked polygon props. All input vectors are borrowed. */
export type GPUPolygonLayerProps = Omit<LayerProps, 'data'> & {
  positions: GPUVector<VertexList<'float32x4'>>;
  rowIndices: GPUVector<VertexList<'uint32'>>;
  indices: GPUVector<VertexList<'uint32'>>;
  getFillColor?: Color | GPUVector<VertexList<'unorm8x4'>>;
  getPath?: GPUVector<VertexList<'float32x2' | 'float32x3' | 'float32x4'>>;
  getLineColor?: Color | GPUVector<'unorm8x4' | VertexList<'unorm8x4'>>;
  getLineWidth?: number | GPUVector<'float32'>;
  filled?: boolean;
  stroked?: boolean;
};

/** Fill-and-outline composite over the specialized polygon and path GPU cores. */
export class GPUPolygonLayer extends CompositeLayer<GPUPolygonLayerProps> {
  static override layerName = 'GPUPolygonLayer';

  override renderLayers(): Array<GPUSolidPolygonLayer | GPUPathLayer> {
    const {
      positions,
      rowIndices,
      indices,
      getFillColor,
      getPath,
      getLineColor,
      getLineWidth,
      filled = true,
      stroked = Boolean(getPath),
      ...props
    } = this.props;
    const layers: Array<GPUSolidPolygonLayer | GPUPathLayer> = [];
    if (filled) {
      layers.push(
        new GPUSolidPolygonLayer({
          ...props,
          id: `${this.props.id}-fill`,
          positions,
          rowIndices,
          indices,
          getFillColor
        })
      );
    }
    if (stroked && getPath) {
      layers.push(
        new GPUPathLayer({
          ...props,
          id: `${this.props.id}-stroke`,
          getPath,
          getColor: getLineColor,
          getWidth: getLineWidth
        })
      );
    }
    return layers;
  }
}
