// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import type Attribute from './attribute/attribute';

/** Layer-owned previous-position storage. One temporal target may own a layer's history. */
export default class MotionVectors {
  /** Target that owns this layer's previous positions. */
  targetId: string | null = null;
  private previous: Buffer | null = null;
  private source: Buffer | null = null;
  private layoutKey = '';
  private valid = false;

  /** Binds the previous buffer using the exact current position layout, including fp64 lows. */
  bind(
    model: Pick<Model, 'bufferLayout' | 'setBufferLayout' | 'setAttributes'>,
    attribute: Attribute,
    instanceCount = 0
  ): void {
    const source = attribute.getBuffer();
    if (!source) return;
    const layout = attribute.getBufferLayout();
    const layoutKey = JSON.stringify([layout, instanceCount]);
    const canCopy = Boolean(source.usage & Buffer.COPY_SRC) && source.byteLength % 4 === 0;
    if (
      source !== this.source ||
      layoutKey !== this.layoutKey ||
      this.previous?.byteLength !== source.byteLength
    ) {
      this.previous?.destroy();
      this.previous = canCopy
        ? source.device.createBuffer({
            byteLength: source.byteLength,
            usage: Buffer.VERTEX | Buffer.COPY_DST
          })
        : null;
      this.source = source;
      this.layoutKey = layoutKey;
      this.valid = false;
    }
    const previousLayout = {
      ...layout,
      name: 'instancePreviousPositions',
      attributes: layout.attributes?.map(a => ({
        ...a,
        attribute: a.attribute.replace('instancePositions', 'instancePreviousPositions')
      }))
    };
    model.setBufferLayout([
      ...model.bufferLayout.filter(l => l.name !== previousLayout.name),
      previousLayout
    ]);
    model.setAttributes({instancePreviousPositions: this.valid ? this.previous! : source});
  }

  /** Copies after all object viewports have submitted, preserving history throughout the pass. */
  copy(): void {
    if (this.previous && this.source) {
      this.valid = true;
      this.source.device.commandEncoder.copyBufferToBuffer({
        sourceBuffer: this.source,
        destinationBuffer: this.previous,
        size: this.source.byteLength
      });
    }
  }

  /** Invalidates history after a cut; the next draw uses current positions. */
  reset(): void {
    this.valid = false;
  }

  /** Releases only the owned snapshot, never the attribute's buffer. */
  destroy(): void {
    this.previous?.destroy();
    this.previous = null;
    this.valid = false;
  }
}
