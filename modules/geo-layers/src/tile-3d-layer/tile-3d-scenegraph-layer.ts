// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {UpdateParameters} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import type TileProcessingScheduler from './tile-processing-scheduler';

/** Defers creation through the ordinary layer update so attributes stay synchronized. */
export default class Tile3DScenegraphLayer<DataT> extends ScenegraphLayer<
  DataT,
  {tileProcessingScheduler: TileProcessingScheduler}
> {
  static layerName = 'Tile3DScenegraphLayer';

  state!: ScenegraphLayer<DataT>['state'] & {scenegraphPending?: boolean};

  updateState(parameters: UpdateParameters<this>): void {
    const retryScenegraph =
      this.state.scenegraphPending &&
      parameters.props.scenegraph === parameters.oldProps.scenegraph;
    super.updateState(parameters);
    if (retryScenegraph) {
      this._updateScenegraph();
    }
  }

  protected _updateScenegraph(): void {
    this.state.scenegraphPending = !this.props.tileProcessingScheduler.run(this, () => {
      super._updateScenegraph();
    });
  }
}
