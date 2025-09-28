// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, Layer, LayersList, DefaultProps} from '@deck.gl/core';
import {PolygonLayer, PolygonLayerProps} from '@deck.gl/layers';

const defaultProps: DefaultProps<GeoCellLayerProps> = {
  ...PolygonLayer.defaultProps
};

/** All properties supported by GeoCellLayer. */
export type GeoCellLayerProps<DataT = unknown> = PolygonLayerProps<DataT>;

export default class GeoCellLayer<DataT = any, ExtraProps extends {} = {}> extends CompositeLayer<
  Required<GeoCellLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'GeoCellLayer';
  static defaultProps: DefaultProps = defaultProps;

  /** Implement to generate props to create geometry. */
  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    return null;
  }

  renderLayers(): Layer | null | LayersList {
    // Rendering props underlying layer
    const {
      elevationScale,
      extruded,
      wireframe,
      filled,
      stroked,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      lineDashJustified,
      getElevation,
      getFillColor,
      getLineColor,
      getLineWidth
    } = this.props;

    // Accessor props for underlying layers
    const {updateTriggers, material, transitions} = this.props;

    // Filled Polygon Layer
    const CellLayer = this.getSubLayerClass('cell', PolygonLayer);
    const {updateTriggers: boundsUpdateTriggers, ...boundsProps} = this.indexToBounds() || {};
    return new CellLayer(
      {
        filled,
        wireframe,

        extruded,
        elevationScale,

        stroked,
        lineWidthUnits,
        lineWidthScale,
        lineWidthMinPixels,
        lineWidthMaxPixels,
        lineJointRounded,
        lineMiterLimit,
        lineDashJustified,

        material,
        transitions,

        getElevation,
        getFillColor,
        getLineColor,
        getLineWidth
      },
      this.getSubLayerProps({
        id: 'cell',
        updateTriggers: updateTriggers && {
          ...boundsUpdateTriggers,
          getElevation: updateTriggers.getElevation,
          getFillColor: updateTriggers.getFillColor,
          getLineColor: updateTriggers.getLineColor,
          getLineWidth: updateTriggers.getLineWidth
        }
      }),
      boundsProps
    );
  }
}
