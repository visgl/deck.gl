// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import View, {CommonViewState, CommonViewProps} from './view';
import OrbitViewport from '../viewports/orbit-viewport';
import OrbitController from '../controllers/orbit-controller';

export type OrbitViewState = {
  /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
  target: [number, number, number];
  /** The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`. */
  zoom: number;
  /** Rotating angle around orbit axis. Default `0`. */
  rotationOrbit?: number;
  /** Rotating angle around orbit axis. Default `0`. */
  rotationX?: number;
  /** The min zoom level of the viewport. Default `-Infinity`. */
  minZoom?: number;
  /** The max zoom level of the viewport. Default `Infinity`. */
  maxZoom?: number;
  /** The min rotating angle around X axis. Default `-90`. */
  minRotationX?: number;
  /** The max rotating angle around X axis. Default `90`. */
  maxRotationX?: number;
} & CommonViewState;

export type OrbitViewProps = {
  /** Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`. */
  orbitAxis?: 'Y' | 'Z';
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
} & CommonViewProps<OrbitViewState>;

export default class OrbitView extends View<OrbitViewState, OrbitViewProps> {
  static displayName = 'OrbitView';

  constructor(props: OrbitViewProps = {}) {
    super(props);
    this.props.orbitAxis = props.orbitAxis || 'Z';
  }

  getViewportType() {
    return OrbitViewport;
  }

  get ControllerType() {
    return OrbitController;
  }
}
