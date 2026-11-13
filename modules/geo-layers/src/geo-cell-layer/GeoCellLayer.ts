// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, Layer, LayersList, DefaultProps, ArrowAccessor, Color} from '@deck.gl/core';
import type {FixedSizeList, Float, Int} from 'apache-arrow';
import {PolygonLayer, PolygonLayerProps} from '@deck.gl/layers';

const defaultProps: DefaultProps<GeoCellLayerProps> = {
  ...PolygonLayer.defaultProps,
  data: {type: 'data', value: [], async: true, materializeIterator: true},
  getFillColor: {type: 'accessor', arrow: true, value: [0, 0, 0, 255]},
  getLineColor: {type: 'accessor', arrow: true, value: [0, 0, 0, 255]},
  getLineWidth: {type: 'accessor', arrow: true, value: 1},
  getElevation: {type: 'accessor', arrow: true, value: 1000}
};

/** All properties supported by GeoCellLayer. */
export type GeoCellLayerProps<DataT = unknown> = Omit<
  PolygonLayerProps<DataT>,
  'getFillColor' | 'getLineColor' | 'getLineWidth' | 'getElevation'
> & {
  /** Fill color constant, callback, or Arrow RGB/RGBA column in source-feature order. */
  getFillColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;
  /** Outline color constant, callback, or Arrow RGB/RGBA column in source-feature order. */
  getLineColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;
  /** Outline width constant, callback, or Arrow numeric column in source-feature order. */
  getLineWidth?: ArrowAccessor<DataT, number, Int | Float>;
  /** Elevation constant, callback, or Arrow numeric column in source-feature order. */
  getElevation?: ArrowAccessor<DataT, number, Int | Float>;
};

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
      lineAntialiasing,
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
        lineAntialiasing,
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
        dataComparator:
          boundsProps.data === this.props.data ? this.props.dataComparator : undefined,
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
