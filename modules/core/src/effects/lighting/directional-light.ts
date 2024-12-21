// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Vector3} from '@math.gl/core';
import type Layer from '../../lib/layer';

const DEFAULT_LIGHT_COLOR = [255, 255, 255] as [number, number, number];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_LIGHT_DIRECTION = [0.0, 0.0, -1.0] as [number, number, number];

let idCount = 0;

export type DirectionalLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: [number, number, number];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
  /** Light direction in the common space
   * @default [0.0, 0.0, -1.0]
   */
  direction?: [number, number, number];
  /** (Experimental) render shadows cast by this light
   * @default false
   */
  _shadow?: boolean;
};

export class DirectionalLight {
  id: string;
  color: [number, number, number];
  intensity: number;
  type = 'directional' as const;
  direction: [number, number, number];
  shadow: boolean;

  constructor(props: DirectionalLightOptions = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;
    const {direction = DEFAULT_LIGHT_DIRECTION} = props;
    const {_shadow = false} = props;

    this.id = props.id || `directional-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = 'directional';
    this.direction = new Vector3(direction).normalize().toArray() as [number, number, number];
    this.shadow = _shadow;
  }

  getProjectedLight(opts: {layer: Layer}): DirectionalLight {
    return this;
  }
}
