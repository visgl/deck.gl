// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {DirectionalLight} from './directional-light';
import {getSunDirection} from '@math.gl/sun';

import type Layer from '../../lib/layer';

export type SunLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: [number, number, number];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
  /**
   * The time at which to position the sun. Either a Date object or a timestamp (milliseconds elapsed since unix time 0)
   */
  timestamp: number | Date;
  /** (Experimental) render shadows casted by this light
   * @default false
   */
  _shadow?: boolean;
};

export default class SunLight extends DirectionalLight {
  timestamp: number | Date;

  constructor(opts: SunLightOptions) {
    super(opts);

    this.timestamp = opts.timestamp;
  }

  getProjectedLight({layer}: {layer: Layer}): DirectionalLight {
    const {viewport} = layer.context;
    const isGlobe = viewport.resolution && viewport.resolution > 0;

    if (isGlobe) {
      // Rotate vector to align with the direction of the globe projection (up at lon:0,lat:0 is [0, -1, 0])
      const [x, y, z] = getSunDirection(this.timestamp, 0, 0);
      this.direction = [x, -z, y];
    } else {
      // @ts-expect-error longitude and latitude are not defined on all viewports
      const {latitude, longitude} = viewport;
      this.direction = getSunDirection(this.timestamp, latitude, longitude) as [
        number,
        number,
        number
      ];
    }

    return this;
  }
}
