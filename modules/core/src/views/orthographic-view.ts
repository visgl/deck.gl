// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import View, {CommonViewState, CommonViewProps} from './view';
import OrthographicViewport from '../viewports/orthographic-viewport';
import OrthographicController from '../controllers/orthographic-controller';

export type OrthographicViewState = {
  /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
  target?: [number, number, number] | [number, number];
  /**  The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large.
   *   To apply independent zoom levels to the X and Y axes, supply an array `[zoomX, zoomY]`. Default `0`. */
  zoom?: number | [number, number];
  /** The min zoom level of the viewport. Default `-Infinity`. */
  minZoom?: number;
  /** The max zoom level of the viewport. Default `Infinity`. */
  maxZoom?: number;
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
