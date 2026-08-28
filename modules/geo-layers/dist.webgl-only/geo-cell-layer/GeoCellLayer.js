// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';
const defaultProps = {
    ...PolygonLayer.defaultProps
};
class GeoCellLayer extends CompositeLayer {
    /** Implement to generate props to create geometry. */
    indexToBounds() {
        return null;
    }
    renderLayers() {
        // Rendering props underlying layer
        const { elevationScale, extruded, wireframe, filled, stroked, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, lineAntialiasing, lineJointRounded, lineMiterLimit, lineDashJustified, getElevation, getFillColor, getLineColor, getLineWidth } = this.props;
        // Accessor props for underlying layers
        const { updateTriggers, material, transitions } = this.props;
        // Filled Polygon Layer
        const CellLayer = this.getSubLayerClass('cell', PolygonLayer);
        const { updateTriggers: boundsUpdateTriggers, ...boundsProps } = this.indexToBounds() || {};
        return new CellLayer({
            filled,
            wireframe,
            extruded,
            elevationScale,
            stroked,
            lineWidthUnits,
            lineWidthScale,
            lineWidthMinPixels,
            lineWidthMaxPixels,
            lineAntialiasing,
            lineJointRounded,
            lineMiterLimit,
            lineDashJustified,
            material,
            transitions,
            getElevation,
            getFillColor,
            getLineColor,
            getLineWidth
        }, this.getSubLayerProps({
            id: 'cell',
            updateTriggers: updateTriggers && {
                ...boundsUpdateTriggers,
                getElevation: updateTriggers.getElevation,
                getFillColor: updateTriggers.getFillColor,
                getLineColor: updateTriggers.getLineColor,
                getLineWidth: updateTriggers.getLineWidth
            }
        }), boundsProps);
    }
}
GeoCellLayer.layerName = 'GeoCellLayer';
GeoCellLayer.defaultProps = defaultProps;
export default GeoCellLayer;
//# sourceMappingURL=GeoCellLayer.js.map