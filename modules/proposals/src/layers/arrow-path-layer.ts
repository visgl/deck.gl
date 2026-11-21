// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer} from '@deck.gl/core';
import {
  ArrowPathRendererLayer,
  type ArrowPathLayerProps
} from './path-layer/arrow-path-renderer-layer';
import {StoragePathLayer} from './path-layer/path-layer';

export type {
  ArrowPathColorInput,
  ArrowPathLayerProps,
  ArrowPathWidthInput
} from './path-layer/arrow-path-renderer-layer';

/** Arrow path entry point backed by StoragePathLayer. */
export class ArrowPathLayer extends CompositeLayer<ArrowPathLayerProps> {
  static override layerName = 'ArrowPathLayer';
  static override defaultProps = ArrowPathRendererLayer.defaultProps;

  /** Passes Arrow path columns to the unified path layer. */
  override renderLayers(): StoragePathLayer {
    return new StoragePathLayer({
      ...this.props,
      ...this.getSubLayerProps({id: 'path'})
    });
  }

  /** Returns the active path models. */
  override getModels() {
    return this.getSubLayers().flatMap(layer => layer.getModels());
  }
}
