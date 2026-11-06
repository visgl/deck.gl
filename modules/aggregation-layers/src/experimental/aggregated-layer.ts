// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, Layer, UpdateParameters} from '@deck.gl/core';
import {GridAggregation} from './aggregation';

/** POC host for a Cartesian grid computation and an ordinary rendering layer. */
export class AggregatedLayer extends CompositeLayer<{
  aggregation: GridAggregation;
  renderLayer: Layer;
}> {
  static layerName = 'AggregatedLayer';
  state!: {aggregation: GridAggregation | null};
  static defaultProps = {
    aggregation: {type: 'object', value: null},
    renderLayer: {type: 'object', value: null}
  };

  initializeState(): void {
    this.setState({aggregation: null});
  }

  updateState(params: UpdateParameters<this>): void {
    super.updateState(params);
    this.props.aggregation.updateComponent(this.state.aggregation, () =>
      this.getCurrentLayer()?.setNeedsUpdate()
    );
    this.state.aggregation = this.props.aggregation;
  }

  finalizeState(): void {
    this.state.aggregation?.finalizeComponent();
  }

  renderLayers(): Layer {
    return this.props.renderLayer.clone({
      ...this.getSubLayerProps({id: 'cells'}),
      data: this.props.aggregation.bins
    });
  }
}
