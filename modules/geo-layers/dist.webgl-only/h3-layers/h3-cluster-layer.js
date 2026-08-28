// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { cellsToMultiPolygon } from 'h3-js';
import { createIterable } from '@deck.gl/core';
import { default as H3HexagonLayer } from "./h3-hexagon-layer.js";
import GeoCellLayer from "../geo-cell-layer/GeoCellLayer.js";
import { normalizeLongitudes } from "./h3-utils.js";
const defaultProps = {
    getHexagons: { type: 'accessor', value: (d) => d.hexagons }
};
class H3ClusterLayer extends GeoCellLayer {
    initializeState() {
        H3HexagonLayer._checkH3Lib();
    }
    updateState({ props, changeFlags }) {
        if (changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagons)) {
            const { data, getHexagons } = props;
            const polygons = [];
            const { iterable, objectInfo } = createIterable(data);
            for (const object of iterable) {
                objectInfo.index++;
                const hexagons = getHexagons(object, objectInfo);
                const multiPolygon = cellsToMultiPolygon(hexagons, true);
                for (const polygon of multiPolygon) {
                    // Normalize polygons to prevent wrapping over the anti-meridian
                    for (const ring of polygon) {
                        normalizeLongitudes(ring);
                    }
                    polygons.push(this.getSubLayerRow({ polygon }, object, objectInfo.index));
                }
            }
            this.setState({ polygons });
        }
    }
    indexToBounds() {
        const { getElevation, getFillColor, getLineColor, getLineWidth } = this.props;
        return {
            data: this.state.polygons,
            getPolygon: d => d.polygon,
            getElevation: this.getSubLayerAccessor(getElevation),
            getFillColor: this.getSubLayerAccessor(getFillColor),
            getLineColor: this.getSubLayerAccessor(getLineColor),
            getLineWidth: this.getSubLayerAccessor(getLineWidth)
        };
    }
}
H3ClusterLayer.layerName = 'H3ClusterLayer';
H3ClusterLayer.defaultProps = defaultProps;
export default H3ClusterLayer;
//# sourceMappingURL=h3-cluster-layer.js.map