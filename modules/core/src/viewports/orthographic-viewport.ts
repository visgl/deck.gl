// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport from '../viewports/viewport';

import {Matrix4, clamp, vec2} from '@math.gl/core';
import {pixelsToWorld} from '@math.gl/web-mercator';

import type {Padding} from './viewport';

const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 1]});

function getProjectionMatrix({
  width,
  height,
  near,
  far,
  padding
}: {
  width: number;
  height: number;
  near: number;
  far: number;
  padding: Padding | null;
}) {
  let left = -width / 2;
  let right = width / 2;
  let bottom = -height / 2;
  let top = height / 2;
  if (padding) {
    const {left: l = 0, right: r = 0, top: t = 0, bottom: b = 0} = padding;
    const offsetX = clamp((l + width - r) / 2, 0, width) - width / 2;
    const offsetY = clamp((t + height - b) / 2, 0, height) - height / 2;
    left -= offsetX;
    right -= offsetX;
    bottom += offsetY;
    top += offsetY;
  }

  return new Matrix4().ortho({
    left,
    right,
    bottom,
    top,
    near,
    far
  });
}

export type OrthographicViewportOptions = {
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
  constructor(props: OrthographicViewportOptions) {
    const {
      width,
      height,
      near = 0.1,
      far = 1000,
      zoom = 0,
      target = [0, 0, 0],
      padding = null,
      flipY = true
    } = props;
    const zoomX = Array.isArray(zoom) ? zoom[0] : zoom;
    const zoomY = Array.isArray(zoom) ? zoom[1] : zoom;
    const zoom_ = Math.min(zoomX, zoomY);
    const scale = Math.pow(2, zoom_);

    let distanceScales;
    if (zoomX !== zoomY) {
      const scaleX = Math.pow(2, zoomX);
      const scaleY = Math.pow(2, zoomY);

      distanceScales = {
        unitsPerMeter: [scaleX / scale, scaleY / scale, 1],
        metersPerUnit: [scale / scaleX, scale / scaleY, 1]
      };
    }

    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: undefined,
      position: target,
      viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
      projectionMatrix: getProjectionMatrix({
        width: width || 1,
        height: height || 1,
        padding,
        near,
        far
      }),
      zoom: zoom_,
      distanceScales
    });
  }

  projectFlat([X, Y]: number[]): [number, number] {
    const {unitsPerMeter} = this.distanceScales;
    return [X * unitsPerMeter[0], Y * unitsPerMeter[1]];
  }

  unprojectFlat([x, y]: number[]): [number, number] {
    const {metersPerUnit} = this.distanceScales;
    return [x * metersPerUnit[0], y * metersPerUnit[1]];
  }

  /* Needed by LinearInterpolator */
  panByPosition(coords: number[], pixel: number[]): OrthographicViewportOptions {
    const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
    const newCenter = vec2.add([], this.center, translate);

    return {target: this.unprojectFlat(newCenter)};
  }

  /**
   * Compute center & zoom for an OrthographicViewport so that `bounds` fills the viewport.
   * @param width  viewport width in px
   * @param height viewport height in px
   * @param bounds [[minX,minY],[maxX,maxY]] in the same world units you’re rendering
   * @returns { target: [number, number], zoom: number }
   *   target: center of the viewport in world units
   *   zoom: deck.gl orthographic zoom level (log2(scale))
   *   (deck.gl orthographic zoom is the log2 of the scale factor)
   */
  static fitBounds(options: {
    bounds: Readonly<[[number, number], [number, number]]>;
    width: number;
    height: number;
    zoomMode?: 'single' | 'per-axis';
  }): {target: [number, number]; zoom: number | [number, number]} {
    const {bounds, width, height, zoomMode = 'per-axis'} = options;
    const [[minX, minY], [maxX, maxY]] = bounds;

    // center of the box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // size of the box
    const boxW = maxX - minX;
    const boxH = maxY - minY;

    // scale (world units → screen pixels)
    const scaleX = width / boxW;
    const scaleY = height / boxH;

    // pick the smaller scale so the whole box fits
    const scale = Math.min(scaleX, scaleY);

    // deck.gl orthographic zoom is log2(scale)
    const zoom = Math.log2(scale);

    // 3) axis‐specific zooms (deck.gl’s orthographic zoom = log2(scale))
    const zoomX = Math.log2(scaleX);
    const zoomY = Math.log2(scaleY);

    return {
      target: [centerX, centerY],
      zoom: zoomMode === 'single' ? zoom : [zoomX, zoomY]
    };
  }
}
