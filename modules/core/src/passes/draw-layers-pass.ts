// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import LayersPass from './layers-pass';

export default class DrawLayersPass extends LayersPass {
  shouldDrawLayer(layer) {
    const {operation} = layer.props;
    return operation.includes('draw') || operation.includes('terrain');
  }
}
