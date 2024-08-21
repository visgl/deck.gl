// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Texture} from '@luma.gl/core';
import {UpdateParameters, DefaultProps, Color} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';
import {defaultColorRange, colorRangeToTexture} from '../utils/color-utils';
import vs from './hexagon-cell-layer-vertex.glsl';

const defaultProps: DefaultProps<_HexagonCellLayerProps> = {
  colorRange: defaultColorRange,
  elevationRange: [0, 1000]
};

/** Proprties added by HexagonCellLayer. */
export type _HexagonCellLayerProps = {
  cellSizeCommon: [number, number];
  cellOriginCommon: [number, number];
  colorDomain: () => [number, number];
  colorRange?: Color[];
  elevationDomain: () => [number, number];
  elevationRange: [number, number];
};

export default class HexagonCellLayer<ExtraPropsT extends {} = {}> extends ColumnLayer<
  null,
  ExtraPropsT & Required<_HexagonCellLayerProps>
> {
  static layerName = 'HexagonCellLayer';
  static defaultProps = defaultProps as any;

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

  draw({uniforms}) {
    // Use dynamic domain from the aggregator
    const colorDomain = this.props.colorDomain();
    const elevationDomain = this.props.elevationDomain();
    const {radius, elevationRange, elevationScale, extruded, coverage} = this.props;
    const fillModel = this.state.fillModel!;

    if (fillModel.vertexArray.indexBuffer) {
      // indices are for drawing wireframe, disable them
      // TODO - this should be handled in ColumnLayer?
      fillModel.setIndexBuffer(null);
    }
    fillModel.setVertexCount(this.state.fillVertexCount);
    fillModel.setUniforms(uniforms);
    fillModel.setUniforms({
      extruded,
      coverage,
      colorDomain,
      elevationDomain,
      radius,
      elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale]
    });
    fillModel.draw(this.context.renderPass);
  }
}
