// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ArrowPolygonSourceVectorSelectors} from '@luma.gl/arrow';
import {CompositeLayer, type LayerProps} from '@deck.gl/core';
import {
  ArrowPolygonLayer,
  type ArrowPolygonColorInput,
  type ArrowPolygonLayerProps
} from './arrow-polygon-layer';

/** SolidPolygon-compatible names over the luma-native Arrow polygon renderer. */
export type ArrowSolidPolygonLayerProps = Omit<LayerProps, 'data'> &
  Omit<ArrowPolygonLayerProps, 'polygons' | 'color'> & {
    /** GeoArrow polygon column, matching deck's getPolygon semantic. */
    getPolygon?: ArrowPolygonSourceVectorSelectors['polygons'];
    /** Filled polygon color, matching deck's getFillColor semantic. */
    getFillColor?: ArrowPolygonColorInput;
  };

/** Deck SolidPolygon naming adapter; tessellation and buffers remain Arrow-native. */
export class ArrowSolidPolygonLayer extends CompositeLayer<ArrowSolidPolygonLayerProps> {
  static override layerName = 'ArrowSolidPolygonLayer';

  override renderLayers(): ArrowPolygonLayer {
    const {getPolygon, getFillColor, ...props} = this.props;
    return new ArrowPolygonLayer({
      ...props,
      id: `${this.props.id}-polygon`,
      polygons: getPolygon,
      color: getFillColor
    } as ArrowPolygonLayerProps);
  }
}
