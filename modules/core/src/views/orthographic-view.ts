// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import View, {CommonViewState, CommonViewProps} from './view';
import OrthographicViewport from '../viewports/orthographic-viewport';
import OrthographicController from '../controllers/orthographic-controller';

/** independent zoom levels for X and Y axes
 * @deprecated use `zoomX` and `zoomY` instead */
type Deprecated2DZoom = [number, number];

export type OrthographicViewState = {
  /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
  target?: [number, number, number] | [number, number];
  /**  The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large.
   *   To apply independent zoom levels to the X and Y axes, use `zoomX` and `zoomY`.
   * @default 0
   */
  zoom?: number | Deprecated2DZoom;
  /** Which axes to apply zoom to. One of 'X', 'Y' or 'all'
   * @default 'all'
   */
  zoomAxis?: 'X' | 'Y' | 'all';
  /** The zoom level along X axis. Overrides `zoom` if supplied. */
  zoomX?: number;
  /** The zoom level along Y axis. Overrides `zoom` if supplied. */
  zoomY?: number;
  /** The min zoom level of the viewport.
   * @default -Infinity
   */
  minZoom?: number;
  /** The max zoom level of the viewport.
   * @default Infinity
   */
  maxZoom?: number;
  /** The min zoom level along X axis.
   * @default `minZoom`
   */
  maxZoomX?: number;
  /** The max zoom level along X axis.
   * @default `maxZoom`
   */
  minZoomX?: number;
  /** The min zoom level along Y axis.
   * @default `minZoom`
   */
  maxZoomY?: number;
  /** The max zoom level along Y axis.
   * @default `maxZoom`
   */
  minZoomY?: number;
} & CommonViewState;

export type OrthographicViewProps = {
  /** Distance of near clipping plane. Default `0.1`. */
  near?: number;
  /** Distance of far clipping plane. Default `1000`. */
  far?: number;
  /** Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`. */
  flipY?: boolean;
} & CommonViewProps<OrthographicViewState>;

export default class OrthographicView extends View<OrthographicViewState, OrthographicViewProps> {
  static displayName = 'OrthographicView';

  constructor(props: OrthographicViewProps = {}) {
    super(props);
  }

  getViewportType() {
    return OrthographicViewport;
  }

  get ControllerType() {
    return OrthographicController;
  }
}
