// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  type Color,
  type LayerProps,
  type GetPickingInfoParams,
  type Unit
} from '@deck.gl/core';
import type {GPUVector, VertexList} from '@luma.gl/graph/gpu-data';
import {GPUPathLayer} from '../path-layer/path-layer';
import {GPUSolidPolygonLayer} from '../solid-polygon-layer/solid-polygon-layer';

export type {GPUVectorLayerPickingInfo} from '../utils/gpu-vector-picking';

/** GPUVector-native filled-and-stroked polygon props. All input vectors are borrowed. */
export type GPUPolygonLayerProps = Omit<LayerProps, 'data'> & {
  positions: GPUVector<VertexList<'float32x4'>>;
  rowIndices: GPUVector<VertexList<'uint32'>>;
  indices: GPUVector<VertexList<'uint32'>>;
  fillColors?: Color | GPUVector<VertexList<'unorm8x4'>>;
  paths?: GPUVector<VertexList<'float32x2' | 'float32x3' | 'float32x4'>>;
  lineColors?: Color | GPUVector<'unorm8x4' | VertexList<'unorm8x4'>>;
  lineWidths?: number | GPUVector<'float32'>;
  /** Feature IDs for outline rows when one feature has multiple rings. */
  pathFeatureIds?: readonly number[];
  lineWidthUnits?: Unit;
  lineWidthScale?: number;
  lineWidthMinPixels?: number;
  lineWidthMaxPixels?: number;
  lineMiterLimit?: number;
  filled?: boolean;
  stroked?: boolean;
};

/** Fill-and-outline composite over the specialized polygon and path GPU cores. */
export class GPUPolygonLayer extends CompositeLayer<GPUPolygonLayerProps> {
  static override layerName = 'GPUPolygonLayer';

  override getPickingInfo(params: GetPickingInfoParams) {
    const info = super.getPickingInfo(params);
    if (params.sourceLayer?.id === `${this.id}-stroke` && info.index >= 0) {
      info.index = this.props.pathFeatureIds?.[info.index] ?? info.index;
    }
    return info;
  }

  override renderLayers(): Array<GPUSolidPolygonLayer | GPUPathLayer> {
    const {
      positions,
      rowIndices,
      indices,
      fillColors,
      paths,
      lineColors,
      lineWidths,
      pathFeatureIds,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineMiterLimit,
      filled = true,
      stroked = Boolean(paths),
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
          fillColors
        })
      );
    }
    if (stroked && paths) {
      layers.push(
        new GPUPathLayer({
          ...props,
          id: `${this.props.id}-stroke`,
          paths,
          colors: lineColors,
          widths: lineWidths,
          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          miterLimit: lineMiterLimit
        })
      );
    }
    return layers;
  }
}
