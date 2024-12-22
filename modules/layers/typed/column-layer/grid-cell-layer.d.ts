import type {DefaultProps} from '@deck.gl/core';
import {CubeGeometry} from '@luma.gl/engine';
import ColumnLayer, {ColumnLayerProps} from './column-layer';
/** All properties supported by GridCellLayer. */
export declare type GridCellLayerProps<DataT = any> = _GridCellLayerProps & ColumnLayerProps<DataT>;
/** Properties added by GridCellLayer. */
declare type _GridCellLayerProps = {
  /**
   * @default 1000
   */
  cellSize?: number;
};
export default class GridCellLayer<DataT = any, ExtraPropsT = {}> extends ColumnLayer<
  DataT,
  ExtraPropsT & Required<_GridCellLayerProps>
> {
  static layerName: string;
  static defaultProps: DefaultProps<GridCellLayerProps<any>>;
  getGeometry(diskResolution: any): CubeGeometry;
  draw({uniforms}: {uniforms: any}): void;
}
export {};
// # sourceMappingURL=grid-cell-layer.d.ts.map
