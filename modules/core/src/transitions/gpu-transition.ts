// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Transition from './transition';
import {cloneAttribute, getAttributeBufferLength} from './gpu-transition-utils';

import type {Device, Buffer} from '@luma.gl/core';
import type {Timeline} from '@luma.gl/engine';
import type Attribute from '../lib/attribute/attribute';
import type {TransitionSettings} from '../lib/attribute/transition-settings';
import type {NumericArray} from '../types/types';

export interface GPUTransition {
  get type(): string;
  get inProgress(): boolean;
  get attributeInTransition(): Attribute;

  /** Called when an attribute's values have changed and we need to start animating towards the new values */
  start(transitionSettings: TransitionSettings, numInstances: number): void;
  /** Called while transition is in progress */
  update(): boolean;
  /** Called when transition is interrupted */
  cancel(): void;
  /** Called when transition is disposed */
  delete(): void;
}

export abstract class GPUTransitionBase<SettingsT extends TransitionSettings>
  implements GPUTransition
{
  abstract get type(): string;

  device: Device;
  attribute: Attribute;
  transition: Transition;
  settings?: SettingsT;
  /** The attribute that holds the buffer in transition */
  attributeInTransition: Attribute;
  protected buffers: Buffer[] = [];
  /** The vertex count of the last buffer.
   * Buffer may be larger than the actual length we want to use
   * because we only reallocate buffers when they grow, not when they shrink,
   * due to performance costs */
  protected currentLength: number = 0;
  /** The start indices of the last buffer. */
  protected currentStartIndices: NumericArray | null;

  constructor({
    device,
    attribute,
    timeline
  }: {
    device: Device;
    attribute: Attribute;
    timeline: Timeline;
  }) {
    this.device = device;
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = cloneAttribute(attribute);
    this.currentStartIndices = attribute.startIndices;
  }

  get inProgress(): boolean {
    return this.transition.inProgress;
  }

  start(transitionSettings: SettingsT, numInstances: number, duration: number = Infinity) {
    this.settings = transitionSettings;
    this.currentStartIndices = this.attribute.startIndices;
    this.currentLength = getAttributeBufferLength(this.attribute, numInstances);
    this.transition.start({...transitionSettings, duration});
  }

  update(): boolean {
    const updated = this.transition.update();
    if (updated) {
      this.onUpdate();
    }
    return updated;
  }

  abstract onUpdate(): void;

  protected setBuffer(buffer: Buffer) {
    this.attributeInTransition.setData({
      buffer,
      normalized: this.attribute.settings.normalized,
      // Retain placeholder value to generate correct shader layout
      value: this.attributeInTransition.value as NumericArray
    });
  }

  cancel(): void {
    this.transition.cancel();
  }

  delete(): void {
    this.cancel();
    for (const buffer of this.buffers) {
      buffer.destroy();
    }
    this.buffers.length = 0;
  }
}
