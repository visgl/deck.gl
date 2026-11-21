// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Built-in white light in byte RGB. */
export const DEFAULT_AMBIENT_LIGHT_COLOR = [255, 255, 255] as [number, number, number];
const DEFAULT_LIGHT_INTENSITY = 1.0;

let idCount = 0;

export type AmbientLightOptions = {
  id?: string;
  /** Light color as RGB. Channels are 0–1 with Deck normalizedColors and 0–255 otherwise.
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
    const {color = DEFAULT_AMBIENT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;

    this.id = props.id || `ambient-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
  }
}
