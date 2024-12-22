import Viewport from '../viewports/viewport';
import type {Padding} from './viewport';
export declare type OrthographicViewportOptions = {
  /** Name of the viewport */
  id?: string;
  /** Left offset from the canvas edge, in pixels */
  x?: number;
  /** Top offset from the canvas edge, in pixels */
  y?: number;
  /** Viewport width in pixels */
  width?: number;
  /** Viewport height in pixels */
  height?: number;
  /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
  target?: [number, number, number] | [number, number];
  /**  The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large.
   *   To apply independent zoom levels to the X and Y axes, supply an array `[zoomX, zoomY]`. Default `0`. */
  zoom?: number | [number, number];
  /** Padding around the viewport, in pixels. */
  padding?: Padding | null;
  /** Distance of near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of far clipping plane. Default `1000`. */
  far?: number;
  /** Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`. */
  flipY?: boolean;
};
export default class OrthographicViewport extends Viewport {
  constructor(props: OrthographicViewportOptions);
  projectFlat([X, Y]: number[]): [number, number];
  unprojectFlat([x, y]: number[]): [number, number];
  panByPosition(coords: number[], pixel: number[]): OrthographicViewportOptions;
}
// # sourceMappingURL=orthographic-viewport.d.ts.map
