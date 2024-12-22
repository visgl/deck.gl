import {Geometry} from '@luma.gl/engine';
declare type ColumnGeometryProps = {
  id?: string;
  radius: number;
  height?: number;
  nradial?: number;
  vertices?: number[];
};
export default class ColumnGeometry extends Geometry {
  constructor(props: ColumnGeometryProps);
}
export {};
// # sourceMappingURL=column-geometry.d.ts.map
