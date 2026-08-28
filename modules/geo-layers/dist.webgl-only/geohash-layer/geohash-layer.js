// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import GeoCellLayer from "../geo-cell-layer/GeoCellLayer.js";
import { getGeohashPolygon } from "./geohash-utils.js";
const defaultProps = {
    getGeohash: { type: 'accessor', value: (d) => d.geohash }
};
/** Render filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system. */
class GeohashLayer extends GeoCellLayer {
    indexToBounds() {
        const { data, getGeohash } = this.props;
        return {
            data,
            _normalize: false,
            positionFormat: 'XY',
            getPolygon: (x, objectInfo) => getGeohashPolygon(getGeohash(x, objectInfo))
        };
    }
}
GeohashLayer.layerName = 'GeohashLayer';
GeohashLayer.defaultProps = defaultProps;
export default GeohashLayer;
//# sourceMappingURL=geohash-layer.js.map