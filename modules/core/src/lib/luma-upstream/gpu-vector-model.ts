// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Model} from '@luma.gl/engine';

/**
 * Marks models that receive AttributeManager's typed GPU vectors.
 * luma.gl owns vector binding and constant buffers; input vectors remain borrowed.
 * Its default inferDrawCount: 'no' preserves deck.gl's explicit draw counts.
 */
export default class GPUVectorModel extends Model {}
