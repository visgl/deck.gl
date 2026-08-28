// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { UNIT } from '@deck.gl/core';
import { CubeGeometry } from '@luma.gl/engine';
import ColumnLayer from "./column-layer.js";
const defaultProps = {
    cellSize: { type: 'number', min: 0, value: 1000 },
    offset: { type: 'array', value: [1, 1] }
};
class GridCellLayer extends ColumnLayer {
    _updateGeometry() {
        const geometry = new CubeGeometry();
        this._setFillGeometry(geometry);
    }
    draw({ uniforms }) {
        const { elevationScale, extruded, offset, coverage, cellSize, angle, radiusUnits } = this.props;
        const fillModel = this.state.fillModel;
        const columnProps = {
            radius: cellSize / 2,
            radiusUnits: UNIT[radiusUnits],
            angle,
            offset,
            extruded,
            stroked: false,
            coverage,
            elevationScale,
            edgeDistance: 1,
            isStroke: false,
            widthUnits: 0,
            widthScale: 0,
            widthMinPixels: 0,
            widthMaxPixels: 0
        };
        fillModel.shaderInputs.setProps({ column: columnProps });
        fillModel.draw(this.context.renderPass);
    }
}
GridCellLayer.layerName = 'GridCellLayer';
GridCellLayer.defaultProps = defaultProps;
export default GridCellLayer;
//# sourceMappingURL=grid-cell-layer.js.map