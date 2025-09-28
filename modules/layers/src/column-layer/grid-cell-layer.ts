// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {DefaultProps} from '@deck.gl/core';
import {UNIT} from '@deck.gl/core';
import {CubeGeometry} from '@luma.gl/engine';
import ColumnLayer, {ColumnLayerProps} from './column-layer';
import {ColumnProps} from './column-layer-uniforms';

const defaultProps: DefaultProps<GridCellLayerProps> = {
  cellSize: {type: 'number', min: 0, value: 1000},
  offset: {type: 'array', value: [1, 1]}
};

/** All properties supported by GridCellLayer. */
export type GridCellLayerProps<DataT = unknown> = _GridCellLayerProps & ColumnLayerProps<DataT>;

/** Properties added by GridCellLayer. */
type _GridCellLayerProps = {
  /**
   * @default 1000
   */
  cellSize?: number;
};

export default class GridCellLayer<DataT = any, ExtraPropsT extends {} = {}> extends ColumnLayer<
  DataT,
  ExtraPropsT & Required<_GridCellLayerProps>
> {
  static layerName = 'GridCellLayer';
  static defaultProps = defaultProps;

  protected _updateGeometry() {
    const geometry = new CubeGeometry();
    this.state.fillModel!.setGeometry(geometry);
  }

  draw({uniforms}) {
    const {elevationScale, extruded, offset, coverage, cellSize, angle, radiusUnits} = this.props;
    const fillModel = this.state.fillModel!;
    const columnProps: ColumnProps = {
      radius: cellSize / 2,
      radiusUnits: UNIT[radiusUnits],
      angle,
      offset,
      extruded,
      stroked: false,
      coverage,
      elevationScale,
      edgeDistance: 1,
      isStroke: false,
      widthUnits: 0,
      widthScale: 0,
      widthMinPixels: 0,
      widthMaxPixels: 0
    };
    fillModel.shaderInputs.setProps({column: columnProps});
    fillModel.draw(this.context.renderPass);
  }
}
