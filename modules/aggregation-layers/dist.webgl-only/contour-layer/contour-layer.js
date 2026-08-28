// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { COORDINATE_SYSTEM, project32, Viewport, _deepEqual } from '@deck.gl/core';
import { PathLayer, SolidPolygonLayer } from '@deck.gl/layers';
import { WebGLAggregator, CPUAggregator } from "../common/aggregator/index.js";
import AggregationLayer from "../common/aggregation-layer.js";
import { generateContours } from "./contour-utils.js";
import { getAggregatorValueReader } from "./value-reader.js";
import { getBinIdRange } from "../common/utils/bounds-utils.js";
import { Matrix4 } from '@math.gl/core';
import { binOptionsUniforms } from "./bin-options-uniforms.js";
const DEFAULT_COLOR = [255, 255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const defaultProps = {
    // grid aggregation
    cellSize: { type: 'number', min: 1, value: 1000 },
    gridOrigin: { type: 'array', compare: true, value: [0, 0] },
    getPosition: { type: 'accessor', value: (x) => x.position },
    getWeight: { type: 'accessor', value: 1 },
    gpuAggregation: true,
    aggregation: 'SUM',
    // contour lines
    contours: {
        type: 'object',
        value: [{ threshold: 1 }],
        optional: true,
        compare: 3
    },
    zOffset: 0.005
};
/** Aggregate data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains. */
class GridLayer extends AggregationLayer {
    getAggregatorType() {
        return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device)
            ? 'gpu'
            : 'cpu';
    }
    createAggregator(type) {
        if (type === 'cpu') {
            return new CPUAggregator({
                dimensions: 2,
                getBin: {
                    sources: ['positions'],
                    getValue: ({ positions }, index, opts) => {
                        const viewport = this.state.aggregatorViewport;
                        // project to common space
                        const p = viewport.projectPosition(positions);
                        const { cellSizeCommon, cellOriginCommon } = opts;
                        return [
                            Math.floor((p[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
                            Math.floor((p[1] - cellOriginCommon[1]) / cellSizeCommon[1])
                        ];
                    }
                },
                getValue: [{ sources: ['counts'], getValue: ({ counts }) => counts }],
                onUpdate: this._onAggregationUpdate.bind(this)
            });
        }
        return new WebGLAggregator(this.context.device, {
            dimensions: 2,
            channelCount: 1,
            bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
            ...super.getShaders({
                modules: [project32, binOptionsUniforms],
                vs: /* glsl */ `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out float value) {
    value = counts;
  }
  `
            }),
            onUpdate: this._onAggregationUpdate.bind(this)
        });
    }
    initializeState() {
        super.initializeState();
        const attributeManager = this.getAttributeManager();
        attributeManager.add({
            positions: {
                size: 3,
                accessor: 'getPosition',
                type: 'float64',
                fp64: this.use64bitPositions()
            },
            counts: { size: 1, accessor: 'getWeight' }
        });
    }
    updateState(params) {
        const aggregatorChanged = super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const { aggregator } = this.state;
        if (aggregatorChanged ||
            changeFlags.dataChanged ||
            props.cellSize !== oldProps.cellSize ||
            !_deepEqual(props.gridOrigin, oldProps.gridOrigin, 1) ||
            props.aggregation !== oldProps.aggregation) {
            this._updateBinOptions();
            const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
            aggregator.setProps({
                // @ts-expect-error only used by GPUAggregator
                binIdRange,
                pointCount: this.getNumInstances(),
                operations: [props.aggregation],
                binOptions: {
                    cellSizeCommon,
                    cellOriginCommon
                }
            });
        }
        if (!_deepEqual(oldProps.contours, props.contours, 2)) {
            // Recalculate contours
            this.setState({ contourData: null });
        }
        return aggregatorChanged;
    }
    _updateBinOptions() {
        const bounds = this.getBounds();
        const cellSizeCommon = [1, 1];
        let cellOriginCommon = [0, 0];
        let binIdRange = [
            [0, 1],
            [0, 1]
        ];
        let viewport = this.context.viewport;
        if (bounds && Number.isFinite(bounds[0][0])) {
            let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
            const { cellSize, gridOrigin } = this.props;
            const { unitsPerMeter } = viewport.getDistanceScales(centroid);
            cellSizeCommon[0] = unitsPerMeter[0] * cellSize;
            cellSizeCommon[1] = unitsPerMeter[1] * cellSize;
            // Offset common space to center at the origin of the grid cell where the data center is in
            // This improves precision without affecting the cell positions
            const centroidCommon = viewport.projectFlat(centroid);
            cellOriginCommon = [
                Math.floor((centroidCommon[0] - gridOrigin[0]) / cellSizeCommon[0]) * cellSizeCommon[0] +
                    gridOrigin[0],
                Math.floor((centroidCommon[1] - gridOrigin[1]) / cellSizeCommon[1]) * cellSizeCommon[1] +
                    gridOrigin[1]
            ];
            centroid = viewport.unprojectFlat(cellOriginCommon);
            const ViewportType = viewport.constructor;
            // We construct a viewport for the GPU aggregator's project module
            // This viewport is determined by data
            // removes arbitrary precision variance that depends on initial view state
            viewport = viewport.isGeospatial
                ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 })
                : new Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
            // Round to the nearest 32-bit float to match CPU and GPU results
            cellOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
            binIdRange = getBinIdRange({
                dataBounds: bounds,
                getBinId: (p) => {
                    const positionCommon = viewport.projectFlat(p);
                    return [
                        Math.floor((positionCommon[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
                        Math.floor((positionCommon[1] - cellOriginCommon[1]) / cellSizeCommon[1])
                    ];
                }
            });
        }
        this.setState({ cellSizeCommon, cellOriginCommon, binIdRange, aggregatorViewport: viewport });
    }
    draw(opts) {
        // Replaces render time viewport with our own
        if (opts.shaderModuleProps.project) {
            opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
        }
        super.draw(opts);
    }
    _onAggregationUpdate() {
        const { aggregator, binIdRange } = this.state;
        this.setState({
            aggregatedValueReader: getAggregatorValueReader({ aggregator, binIdRange, channel: 0 }),
            contourData: null
        });
    }
    _getContours() {
        const { aggregatedValueReader } = this.state;
        if (!aggregatedValueReader) {
            return null;
        }
        if (!this.state.contourData) {
            const { binIdRange } = this.state;
            const { contours } = this.props;
            const contourData = generateContours({
                contours,
                getValue: aggregatedValueReader,
                xRange: binIdRange[0],
                yRange: binIdRange[1]
            });
            this.state.contourData = contourData;
        }
        return this.state.contourData;
    }
    onAttributeChange(id) {
        const { aggregator } = this.state;
        switch (id) {
            case 'positions':
                aggregator.setNeedsUpdate();
                this._updateBinOptions();
                const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
                aggregator.setProps({
                    // @ts-expect-error only used by GPUAggregator
                    binIdRange,
                    binOptions: {
                        cellSizeCommon,
                        cellOriginCommon
                    }
                });
                break;
            case 'counts':
                aggregator.setNeedsUpdate(0);
                break;
            default:
            // This should not happen
        }
    }
    renderLayers() {
        const contourData = this._getContours();
        if (!contourData) {
            return null;
        }
        const { lines, polygons } = contourData;
        const { zOffset } = this.props;
        const { cellOriginCommon, cellSizeCommon } = this.state;
        const LinesSubLayerClass = this.getSubLayerClass('lines', PathLayer);
        const BandsSubLayerClass = this.getSubLayerClass('bands', SolidPolygonLayer);
        const modelMatrix = new Matrix4()
            .translate([cellOriginCommon[0], cellOriginCommon[1], 0])
            .scale([cellSizeCommon[0], cellSizeCommon[1], zOffset]);
        // Contour lines layer
        const lineLayer = lines &&
            lines.length > 0 &&
            new LinesSubLayerClass(this.getSubLayerProps({
                id: 'lines'
            }), {
                data: lines,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                modelMatrix,
                getPath: d => d.vertices,
                getColor: d => d.contour.color ?? DEFAULT_COLOR,
                getWidth: d => d.contour.strokeWidth ?? DEFAULT_STROKE_WIDTH,
                widthUnits: 'pixels'
            });
        // Contour bands layer
        const bandsLayer = polygons &&
            polygons.length > 0 &&
            new BandsSubLayerClass(this.getSubLayerProps({
                id: 'bands'
            }), {
                data: polygons,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                modelMatrix,
                getPolygon: d => d.vertices,
                getFillColor: d => d.contour.color ?? DEFAULT_COLOR
            });
        return [lineLayer, bandsLayer];
    }
    getPickingInfo(params) {
        const info = params.info;
        const { object } = info;
        if (object) {
            info.object = {
                contour: object.contour
            };
        }
        return info;
    }
}
GridLayer.layerName = 'ContourLayer';
GridLayer.defaultProps = defaultProps;
export default GridLayer;
//# sourceMappingURL=contour-layer.js.map