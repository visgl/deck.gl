// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { ArcLayer } from '@deck.gl/layers';
const defaultProps = {
    getHeight: { type: 'accessor', value: 0 },
    greatCircle: true
};
// This layer has been merged into the core ArcLayer
// Keeping for backward-compatibility
/** @deprecated Use ArcLayer with `greatCircle: true` instead */
class GreatCircleLayer extends ArcLayer {
}
GreatCircleLayer.layerName = 'GreatCircleLayer';
GreatCircleLayer.defaultProps = defaultProps;
export default GreatCircleLayer;
//# sourceMappingURL=great-circle-layer.js.map