// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import {UpdateParameters, Color} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';
import {CubeGeometry} from '@luma.gl/engine';
import {colorRangeToTexture} from '../common/utils/color-utils';
import vs from './grid-cell-layer-vertex.glsl';

/** Proprties added by GridCellLayer. */
type GridCellLayerProps = {
  cellSizeCommon: [number, number];
  cellOriginCommon: [number, number];
  colorDomain: () => [number, number];
  colorRange?: Color[];
  elevationDomain: () => [number, number];
  elevationRange: [number, number];
};

export class GridCellLayer<ExtraPropsT extends {} = {}> extends ColumnLayer<
  null,
  ExtraPropsT & Required<GridCellLayerProps>
> {
  static layerName = 'GridCellLayer';

  state!: ColumnLayer['state'] & {
    colorTexture: Texture;
  };

  getShaders() {
    return {
      ...super.getShaders(),
      vs
    };
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager()!;
    attributeManager.remove([
      'instanceElevations',
      'instanceFillColors',
      'instanceLineColors',
      'instanceStrokeWidths'
    ]);
    attributeManager.addInstanced({
      instancePositions: {
        size: 2,
        type: 'float32',
        accessor: 'getBin'
      },
      instanceColorValues: {
        size: 1,
        type: 'float32',
        accessor: 'getColorValue'
      },
      instanceElevationValues: {
        size: 1,
        type: 'float32',
        accessor: 'getElevationValue'
      }
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    const {props, oldProps} = params;
    const model = this.state.fillModel!;

    if (oldProps.colorRange !== props.colorRange) {
      this.state.colorTexture?.destroy();
      this.state.colorTexture = colorRangeToTexture(this.context.device, props.colorRange);
      model.setBindings({colorRange: this.state.colorTexture});
    }
  }

  finalizeState(context) {
    super.finalizeState(context);

    this.state.colorTexture?.destroy();
  }

  protected _updateGeometry() {
    const geometry = new CubeGeometry();
    this.state.fillModel!.setGeometry(geometry);
  }

  draw({uniforms}) {
    // Use dynamic domain from the aggregator
    const colorDomain = this.props.colorDomain();
    const elevationDomain = this.props.elevationDomain();
    const {cellOriginCommon, cellSizeCommon, elevationRange, elevationScale, extruded, coverage} =
      this.props;
    const fillModel = this.state.fillModel!;
    fillModel.setUniforms(uniforms);
    fillModel.setUniforms({
      extruded,
      coverage,
      colorDomain,
      elevationDomain,
      cellOriginCommon,
      cellSizeCommon,
      elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale]
    });
    fillModel.draw(this.context.renderPass);
  }
}
