// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import GeoCellLayer from "../geo-cell-layer/GeoCellLayer.js";
import { cellToBoundary, hexToU64 } from 'a5-js';
import { flattenPolygon } from "../h3-layers/h3-utils.js";
const defaultProps = {
    getPentagon: { type: 'accessor', value: (d) => d.pentagon }
};
/** Render filled and/or stroked polygons based on the [A5](https://a5geo.org) geospatial indexing system. */
class A5Layer extends GeoCellLayer {
    indexToBounds() {
        const { data, getPentagon } = this.props;
        return {
            data,
            _normalize: false,
            _windingOrder: 'CCW',
            positionFormat: 'XY',
            getPolygon: (x, objectInfo) => {
                const pentagon = getPentagon(x, objectInfo);
                const boundary = cellToBoundary(typeof pentagon === 'string' ? hexToU64(pentagon) : pentagon, { closedRing: true, segments: 'auto' });
                return flattenPolygon(boundary);
            }
        };
    }
}
A5Layer.layerName = 'A5Layer';
A5Layer.defaultProps = defaultProps;
export default A5Layer;
//# sourceMappingURL=a5-layer.js.map