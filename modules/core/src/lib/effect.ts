// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Deck from './deck';
import type Layer from './layer';
import type {LayersPassRenderOptions} from '../passes/layers-pass';
import type {Device} from '@luma.gl/core';
import type {Framebuffer} from '@luma.gl/core';

export type PreRenderOptions = LayersPassRenderOptions;
export type PostRenderOptions = LayersPassRenderOptions & {
  inputBuffer: Framebuffer;
  swapBuffer: Framebuffer;
};
export type EffectContext = {
  deck: Deck<any>;
  device: Device;
};

export interface Effect {
  id: string;
  props: any;
  /** If true, this effect will also be used when rendering to the picking buffer */
  useInPicking?: boolean;
  /** Effects with smaller value gets executed first. If not provided, will get executed in the order added. */
  order?: number;

  // / Render methods
  /** Called before layers are rendered to screen */
  preRender(opts: PreRenderOptions): void;
  /** Called after layers are rendered to screen */
  postRender?(opts: PostRenderOptions): Framebuffer | null;
  /** Module settings passed to models */
  getShaderModuleProps?(layer: Layer, otherShaderModuleProps: Record<string, any>): any;

  // / Lifecycle methods
  /** Called when this effect is added */
  setup(context: EffectContext): void;
  /** Called when the effect's props are updated. */
  setProps?(props: any): void;
  /** Called when this effect is removed */
  cleanup(context: EffectContext): void;
}
