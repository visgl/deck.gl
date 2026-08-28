// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer, createIterable, log } from '@deck.gl/core';
import SolidPolygonLayer from "../solid-polygon-layer/solid-polygon-layer.js";
import PathLayer from "../path-layer/path-layer.js";
import * as Polygon from "../solid-polygon-layer/polygon.js";
import { replaceInRange } from "../utils.js";
const defaultLineColor = [0, 0, 0, 255];
const defaultFillColor = [0, 0, 0, 255];
const defaultProps = {
    stroked: true,
    filled: true,
    extruded: false,
    elevationScale: 1,
    wireframe: false,
    _normalize: true,
    _windingOrder: 'CW',
    lineWidthUnits: 'meters',
    lineWidthScale: 1,
    lineWidthMinPixels: 0,
    lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
    lineJointRounded: false,
    lineMiterLimit: 4,
    lineAntialiasing: false,
    getPolygon: { type: 'accessor', value: (f) => f.polygon },
    // Polygon fill color
    getFillColor: { type: 'accessor', value: defaultFillColor },
    // Point, line and polygon outline color
    getLineColor: { type: 'accessor', value: defaultLineColor },
    // Line and polygon outline accessors
    getLineWidth: { type: 'accessor', value: 1 },
    // Polygon extrusion accessor
    getElevation: { type: 'accessor', value: 1000 },
    // Optional material for 'lighting' shader module
    material: true
};
/** A composite layer that renders filled, stroked and/or extruded polygons. */
class PolygonLayer extends CompositeLayer {
    initializeState() {
        this.state = {
            paths: [],
            pathsDiff: null
        };
        if (this.props.getLineDashArray) {
            log.removed('getLineDashArray', 'PathStyleExtension')();
        }
    }
    updateState({ changeFlags }) {
        const geometryChanged = changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged &&
                (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));
        if (geometryChanged && Array.isArray(changeFlags.dataChanged)) {
            const paths = this.state.paths.slice();
            const pathsDiff = changeFlags.dataChanged.map(dataRange => replaceInRange({
                data: paths,
                getIndex: p => p.__source.index,
                dataRange,
                replace: this._getPaths(dataRange)
            }));
            this.setState({ paths, pathsDiff });
        }
        else if (geometryChanged) {
            this.setState({
                paths: this._getPaths(),
                pathsDiff: null
            });
        }
    }
    _getPaths(dataRange = {}) {
        const { data, getPolygon, positionFormat, _normalize } = this.props;
        const paths = [];
        const positionSize = positionFormat === 'XY' ? 2 : 3;
        const { startRow, endRow } = dataRange;
        const { iterable, objectInfo } = createIterable(data, startRow, endRow);
        for (const object of iterable) {
            objectInfo.index++;
            let polygon = getPolygon(object, objectInfo);
            if (_normalize) {
                polygon = Polygon.normalize(polygon, positionSize);
            }
            const { holeIndices } = polygon;
            const positions = polygon.positions || polygon;
            if (holeIndices) {
                // split the positions array into `holeIndices.length + 1` rings
                // holeIndices[-1] falls back to 0
                // holeIndices[holeIndices.length] falls back to positions.length
                for (let i = 0; i <= holeIndices.length; i++) {
                    const path = positions.slice(holeIndices[i - 1] || 0, holeIndices[i] || positions.length);
                    paths.push(this.getSubLayerRow({ path }, object, objectInfo.index));
                }
            }
            else {
                paths.push(this.getSubLayerRow({ path: positions }, object, objectInfo.index));
            }
        }
        return paths;
    }
    /* eslint-disable complexity */
    renderLayers() {
        // Layer composition props
        const { data, _dataDiff, stroked, filled, extruded, wireframe, _normalize, _windingOrder, elevationScale, transitions, positionFormat } = this.props;
        // Rendering props underlying layer
        const { lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, lineJointRounded, lineMiterLimit, lineAntialiasing, lineDashJustified } = this.props;
        // Accessor props for underlying layers
        const { getFillColor, getLineColor, getLineWidth, getLineDashArray, getElevation, getPolygon, updateTriggers, material } = this.props;
        const { paths, pathsDiff } = this.state;
        const FillLayer = this.getSubLayerClass('fill', SolidPolygonLayer);
        const StrokeLayer = this.getSubLayerClass('stroke', PathLayer);
        // Filled Polygon Layer
        const polygonLayer = this.shouldRenderSubLayer('fill', paths) &&
            new FillLayer({
                _dataDiff,
                extruded,
                elevationScale,
                filled,
                wireframe,
                _normalize,
                _windingOrder,
                getElevation,
                getFillColor,
                getLineColor: extruded && wireframe ? getLineColor : defaultLineColor,
                material,
                transitions
            }, this.getSubLayerProps({
                id: 'fill',
                updateTriggers: updateTriggers && {
                    getPolygon: updateTriggers.getPolygon,
                    getElevation: updateTriggers.getElevation,
                    getFillColor: updateTriggers.getFillColor,
                    // using a legacy API to invalid lineColor attributes
                    // if (extruded && wireframe) has changed
                    lineColors: extruded && wireframe,
                    getLineColor: updateTriggers.getLineColor
                }
            }), {
                data,
                positionFormat,
                getPolygon
            });
        // Polygon line layer
        const polygonLineLayer = !extruded &&
            stroked &&
            this.shouldRenderSubLayer('stroke', paths) &&
            new StrokeLayer({
                _dataDiff: pathsDiff && (() => pathsDiff),
                widthUnits: lineWidthUnits,
                widthScale: lineWidthScale,
                widthMinPixels: lineWidthMinPixels,
                widthMaxPixels: lineWidthMaxPixels,
                jointRounded: lineJointRounded,
                miterLimit: lineMiterLimit,
                antialiasing: lineAntialiasing,
                dashJustified: lineDashJustified,
                // Already normalized
                _pathType: 'loop',
                transitions: transitions && {
                    getWidth: transitions.getLineWidth,
                    getColor: transitions.getLineColor,
                    getPath: transitions.getPolygon
                },
                getColor: this.getSubLayerAccessor(getLineColor),
                getWidth: this.getSubLayerAccessor(getLineWidth),
                getDashArray: this.getSubLayerAccessor(getLineDashArray)
            }, this.getSubLayerProps({
                id: 'stroke',
                updateTriggers: updateTriggers && {
                    getWidth: updateTriggers.getLineWidth,
                    getColor: updateTriggers.getLineColor,
                    getDashArray: updateTriggers.getLineDashArray
                }
            }), {
                data: paths,
                positionFormat,
                getPath: x => x.path
            });
        return [
            // If not extruded: flat fill layer is drawn below outlines
            !extruded && polygonLayer,
            polygonLineLayer,
            // If extruded: draw fill layer last for correct blending behavior
            extruded && polygonLayer
        ];
    }
}
PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
export default PolygonLayer;
//# sourceMappingURL=polygon-layer.js.map