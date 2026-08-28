// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import GeoCellLayer from "../geo-cell-layer/GeoCellLayer.js";
import { getS2Polygon } from "./s2-utils.js";
const defaultProps = {
    getS2Token: { type: 'accessor', value: (d) => d.token }
};
/** Render filled and/or stroked polygons based on the [S2](http://s2geometry.io/) geospatial indexing system. */
class S2Layer extends GeoCellLayer {
    indexToBounds() {
        const { data, getS2Token } = this.props;
        return {
            data,
            _normalize: false,
            positionFormat: 'XY',
            getPolygon: (x, objectInfo) => getS2Polygon(getS2Token(x, objectInfo))
        };
    }
}
S2Layer.layerName = 'S2Layer';
S2Layer.defaultProps = defaultProps;
export default S2Layer;
//# sourceMappingURL=s2-layer.js.map