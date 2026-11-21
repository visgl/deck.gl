// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Model} from '@luma.gl/engine';
import type {TypedArray} from '@math.gl/core/matrix';

/**
 * Marks models that receive AttributeManager's typed GPU vectors.
 * luma.gl owns vector binding and constant buffers; input vectors remain borrowed.
 * Its default inferDrawCount: 'no' preserves deck.gl's explicit draw counts.
 */
export default class GPUVectorModel extends Model {
  // Extension attributes can use vertex stepping independently of model geometry
  // (e.g. DataFilter's counting indices alongside Scatterplot's four-vertex quad).
  static override defaultProps: typeof Model.defaultProps = {
    ...Model.defaultProps,
    enforceMatchingVectorLengths: false
  };

  /** Converts integer-backed constants to floats for WebGL float shader inputs. */
  override setConstantAttributes(
    attributes: Record<string, TypedArray>,
    options?: {disableWarnings?: boolean}
  ): void {
    if (this.device.type === 'webgl') {
      for (const [name, value] of Object.entries(attributes)) {
        // A WebGL generic attribute's numeric type must match the shader input.
        // The vector binder constructs constants from the storage format instead.
        if (
          this._attributeInfos[name]?.integer === false &&
          (value instanceof Int32Array || value instanceof Uint32Array)
        ) {
          attributes = {...attributes, [name]: new Float32Array(value)};
        }
      }
    }
    super.setConstantAttributes(attributes, options);
  }
}
