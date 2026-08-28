// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import GeoCellLayer from "../geo-cell-layer/GeoCellLayer.js";
import { getQuadkeyPolygon } from "./quadkey-utils.js";
const defaultProps = {
    getQuadkey: { type: 'accessor', value: (d) => d.quadkey }
};
/** Render filled and/or stroked polygons based on the [Quadkey](https://towardsdatascience.com/geospatial-indexing-with-quadkeys-d933dff01496) geospatial indexing system. */
class QuadkeyLayer extends GeoCellLayer {
    indexToBounds() {
        const { data, extruded, getQuadkey } = this.props;
        // To avoid z-fighting reduce polygon footprint when extruding
        const coverage = extruded ? 0.99 : 1;
        return {
            data,
            _normalize: false,
            positionFormat: 'XY',
            getPolygon: (x, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo), coverage),
            updateTriggers: { getPolygon: coverage }
        };
    }
}
QuadkeyLayer.layerName = 'QuadkeyLayer';
QuadkeyLayer.defaultProps = defaultProps;
export default QuadkeyLayer;
//# sourceMappingURL=quadkey-layer.js.map