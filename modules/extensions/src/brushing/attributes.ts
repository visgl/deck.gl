// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {AttributeManager} from '@deck.gl/core';

export function addBrushingAttributes(attributeManager: AttributeManager): void {
  attributeManager.add({
    brushingTargets: {
      size: 2,
      stepMode: 'dynamic',
      accessor: 'getBrushingTarget'
    }
  });
}
