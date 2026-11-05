// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Model} from '@luma.gl/engine';

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
}
