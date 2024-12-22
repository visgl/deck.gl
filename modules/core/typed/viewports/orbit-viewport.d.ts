import Viewport from '../viewports/viewport';
export declare type OrbitViewportOptions = {
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
  /** Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`. */
  orbitAxis?: 'Y' | 'Z';
  /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
  target?: [number, number, number];
  /** The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`. */
  zoom?: number;
  /** Rotating angle around orbit axis. Default `0`. */
  rotationOrbit?: number;
  /** Rotating angle around orbit axis. Default `0`. */
  rotationX?: number;
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** Field of view covered by camera, in the perspective case. In degrees. Default `50`. */
  fovy?: number;
  /** Distance of near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of far clipping plane. Default `1000`. */
  far?: number;
  /** Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection). */
  orthographic?: boolean;
};
export default class OrbitViewport extends Viewport {
  projectedCenter: number[];
  constructor(props: OrbitViewportOptions);
  unproject(
    xyz: number[],
    {
      topLeft
    }?: {
      topLeft?: boolean;
    }
  ): [number, number, number];
  panByPosition(coords: number[], pixel: number[]): OrbitViewportOptions;
}
// # sourceMappingURL=orbit-viewport.d.ts.map
