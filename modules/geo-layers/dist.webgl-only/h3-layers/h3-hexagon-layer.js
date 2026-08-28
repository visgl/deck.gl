// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { getResolution, cellToLatLng, latLngToCell, isPentagon, gridDistance, getHexagonEdgeLengthAvg } from 'h3-js';
import { CompositeLayer, createIterable } from '@deck.gl/core';
import { ColumnLayer, PolygonLayer } from '@deck.gl/layers';
import { flattenPolygon, getHexagonCentroid, h3ToPolygon } from "./h3-utils.js";
// There is a cost to updating the instanced geometries when using highPrecision: false
// This constant defines the distance between two hexagons that leads to "significant
// distortion." Smaller value makes the column layer more sensitive to viewport change.
const UPDATE_THRESHOLD_KM = 10;
function mergeTriggers(getHexagon, coverage) {
    let trigger;
    if (getHexagon === undefined || getHexagon === null) {
        trigger = coverage;
    }
    else if (typeof getHexagon === 'object') {
        trigger = { ...getHexagon, coverage };
    }
    else {
        trigger = { getHexagon, coverage };
    }
    return trigger;
}
const defaultProps = {
    ...PolygonLayer.defaultProps,
    highPrecision: 'auto',
    coverage: { type: 'number', min: 0, max: 1, value: 1 },
    centerHexagon: null,
    getHexagon: { type: 'accessor', value: (x) => x.hexagon },
    extruded: true
};
/**
 * Render hexagons from the [H3](https://h3geo.org/) geospatial indexing system.
 */
class H3HexagonLayer extends CompositeLayer {
    initializeState() {
        H3HexagonLayer._checkH3Lib();
        this.state = {
            edgeLengthKM: 0,
            resolution: -1
        };
    }
    shouldUpdateState({ changeFlags }) {
        return this._shouldUseHighPrecision()
            ? changeFlags.propsOrDataChanged
            : changeFlags.somethingChanged;
    }
    updateState({ props, changeFlags }) {
        if (props.highPrecision !== true &&
            (changeFlags.dataChanged ||
                (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagon))) {
            const dataProps = this._calculateH3DataProps();
            this.setState(dataProps);
        }
        this._updateVertices(this.context.viewport);
    }
    _calculateH3DataProps() {
        let resolution = -1;
        let hasPentagon = false;
        let hasMultipleRes = false;
        const { iterable, objectInfo } = createIterable(this.props.data);
        for (const object of iterable) {
            objectInfo.index++;
            const hexId = this.props.getHexagon(object, objectInfo);
            // Take the resolution of the first hex
            const hexResolution = getResolution(hexId);
            if (resolution < 0) {
                resolution = hexResolution;
                if (!this.props.highPrecision)
                    break;
            }
            else if (resolution !== hexResolution) {
                hasMultipleRes = true;
                break;
            }
            if (isPentagon(hexId)) {
                hasPentagon = true;
                break;
            }
        }
        return {
            resolution,
            edgeLengthKM: resolution >= 0 ? getHexagonEdgeLengthAvg(resolution, 'km') : 0,
            hasMultipleRes,
            hasPentagon
        };
    }
    _shouldUseHighPrecision() {
        if (this.props.highPrecision === 'auto') {
            const { resolution, hasPentagon, hasMultipleRes } = this.state;
            const { viewport } = this.context;
            return (Boolean(viewport?.resolution) ||
                hasMultipleRes ||
                hasPentagon ||
                (resolution >= 0 && resolution <= 5));
        }
        return this.props.highPrecision;
    }
    _updateVertices(viewport) {
        if (this._shouldUseHighPrecision()) {
            return;
        }
        const { resolution, edgeLengthKM, centerHex } = this.state;
        if (resolution < 0) {
            return;
        }
        const hex = this.props.centerHexagon || latLngToCell(viewport.latitude, viewport.longitude, resolution);
        if (centerHex === hex) {
            return;
        }
        if (centerHex) {
            try {
                const distance = gridDistance(centerHex, hex);
                if (distance * edgeLengthKM < UPDATE_THRESHOLD_KM) {
                    return;
                }
            }
            catch {
                // gridDistance throws if the distance could not be computed
                // due to the two indexes very far apart or on opposite sides of a pentagon.
            }
        }
        const { unitsPerMeter } = viewport.distanceScales;
        let vertices = h3ToPolygon(hex);
        const [centerLat, centerLng] = cellToLatLng(hex);
        const [centerX, centerY] = viewport.projectFlat([centerLng, centerLat]);
        vertices = vertices.map(p => {
            const worldPosition = viewport.projectFlat(p);
            return [
                (worldPosition[0] - centerX) / unitsPerMeter[0],
                (worldPosition[1] - centerY) / unitsPerMeter[1]
            ];
        });
        this.setState({ centerHex: hex, vertices });
    }
    renderLayers() {
        return this._shouldUseHighPrecision() ? this._renderPolygonLayer() : this._renderColumnLayer();
    }
    _getForwardProps() {
        const { elevationScale, material, coverage, extruded, wireframe, stroked, filled, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, getFillColor, getElevation, getLineColor, getLineWidth, transitions, updateTriggers } = this.props;
        return {
            elevationScale,
            extruded,
            coverage,
            wireframe,
            stroked,
            filled,
            lineWidthUnits,
            lineWidthScale,
            lineWidthMinPixels,
            lineWidthMaxPixels,
            material,
            getElevation,
            getFillColor,
            getLineColor,
            getLineWidth,
            transitions,
            updateTriggers: {
                getFillColor: updateTriggers.getFillColor,
                getElevation: updateTriggers.getElevation,
                getLineColor: updateTriggers.getLineColor,
                getLineWidth: updateTriggers.getLineWidth
            }
        };
    }
    _renderPolygonLayer() {
        const { data, getHexagon, updateTriggers, coverage } = this.props;
        const SubLayerClass = this.getSubLayerClass('hexagon-cell-hifi', PolygonLayer);
        const forwardProps = this._getForwardProps();
        forwardProps.updateTriggers.getPolygon = mergeTriggers(updateTriggers.getHexagon, coverage);
        return new SubLayerClass(forwardProps, this.getSubLayerProps({
            id: 'hexagon-cell-hifi',
            updateTriggers: forwardProps.updateTriggers
        }), {
            data,
            _normalize: false,
            _windingOrder: 'CCW',
            positionFormat: 'XY',
            getPolygon: (object, objectInfo) => {
                const hexagonId = getHexagon(object, objectInfo);
                return flattenPolygon(h3ToPolygon(hexagonId, coverage));
            }
        });
    }
    _renderColumnLayer() {
        const { data, getHexagon, updateTriggers } = this.props;
        const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
        const forwardProps = this._getForwardProps();
        forwardProps.updateTriggers.getPosition = updateTriggers.getHexagon;
        return new SubLayerClass(forwardProps, this.getSubLayerProps({
            id: 'hexagon-cell',
            flatShading: true,
            updateTriggers: forwardProps.updateTriggers
        }), {
            data,
            diskResolution: 6, // generate an extruded hexagon as the base geometry
            radius: 1,
            vertices: this.state.vertices,
            getPosition: getHexagonCentroid.bind(null, getHexagon)
        });
    }
}
H3HexagonLayer.defaultProps = defaultProps;
H3HexagonLayer.layerName = 'H3HexagonLayer';
// See `main/bundle.ts`
H3HexagonLayer._checkH3Lib = () => { };
export default H3HexagonLayer;
//# sourceMappingURL=h3-hexagon-layer.js.map