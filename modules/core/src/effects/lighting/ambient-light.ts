// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const DEFAULT_LIGHT_COLOR = [255, 255, 255] as [number, number, number];
const DEFAULT_LIGHT_INTENSITY = 1.0;

let idCount = 0;

export type AmbientLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: [number, number, number];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
};

export class AmbientLight {
  id: string;
  color: [number, number, number];
  intensity: number;
  type = 'ambient' as const;

  constructor(props: AmbientLightOptions = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;

    this.id = props.id || `ambient-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
  }
}
