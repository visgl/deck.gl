// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { log, createIterable, project32, Viewport } from '@deck.gl/core';
import { WebGLAggregator, CPUAggregator } from "../common/aggregator/index.js";
import AggregationLayer from "../common/aggregation-layer.js";
import { defaultColorRange } from "../common/utils/color-utils.js";
import { AttributeWithScale } from "../common/utils/scale-utils.js";
import { getBinIdRange } from "../common/utils/bounds-utils.js";
import HexagonCellLayer from "./hexagon-cell-layer.js";
import { pointToHexbin, HexbinVertices, getHexbinCentroid, pointToHexbinGLSL } from "./hexbin.js";
import { binOptionsUniforms } from "./bin-options-uniforms.js";
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const defaultProps = {
    gpuAggregation: true,
    // color
    colorDomain: null,
    colorRange: defaultColorRange,
    getColorValue: { type: 'accessor', value: null }, // default value is calculated from `getColorWeight` and `colorAggregation`
    getColorWeight: { type: 'accessor', value: 1 },
    colorAggregation: 'SUM',
    lowerPercentile: { type: 'number', min: 0, max: 100, value: 0 },
    upperPercentile: { type: 'number', min: 0, max: 100, value: 100 },
    colorScaleType: 'quantize',
    onSetColorDomain: noop,
    // elevation
    elevationDomain: null,
    elevationRange: [0, 1000],
    getElevationValue: { type: 'accessor', value: null }, // default value is calculated from `getElevationWeight` and `elevationAggregation`
    getElevationWeight: { type: 'accessor', value: 1 },
    elevationAggregation: 'SUM',
    elevationScale: { type: 'number', min: 0, value: 1 },
    elevationLowerPercentile: { type: 'number', min: 0, max: 100, value: 0 },
    elevationUpperPercentile: { type: 'number', min: 0, max: 100, value: 100 },
    elevationScaleType: 'linear',
    onSetElevationDomain: noop,
    // hexbin
    radius: { type: 'number', min: 1, value: 1000 },
    coverage: { type: 'number', min: 0, max: 1, value: 1 },
    getPosition: { type: 'accessor', value: (x) => x.position },
    hexagonAggregator: { type: 'function', optional: true, value: null },
    extruded: false,
    // Optional material for 'lighting' shader module
    material: true
};
/** Aggregate data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains. */
class HexagonLayer extends AggregationLayer {
    getAggregatorType() {
        const { gpuAggregation, hexagonAggregator, getColorValue, getElevationValue } = this.props;
        if (gpuAggregation && (hexagonAggregator || getColorValue || getElevationValue)) {
            // If these features are desired by the app, the user should explicitly use CPU aggregation
            log.warn('Features not supported by GPU aggregation, falling back to CPU')();
            return 'cpu';
        }
        if (
        // GPU aggregation is requested
        gpuAggregation &&
            // GPU aggregation is supported by the device
            WebGLAggregator.isSupported(this.context.device)) {
            return 'gpu';
        }
        return 'cpu';
    }
    createAggregator(type) {
        if (type === 'cpu') {
            const { hexagonAggregator, radius } = this.props;
            return new CPUAggregator({
                dimensions: 2,
                getBin: {
                    sources: ['positions'],
                    getValue: ({ positions }, index, opts) => {
                        if (hexagonAggregator) {
                            return hexagonAggregator(positions, radius);
                        }
                        const viewport = this.state.aggregatorViewport;
                        // project to common space
                        const p = viewport.projectPosition(positions);
                        const { radiusCommon, hexOriginCommon } = opts;
                        return pointToHexbin([p[0] - hexOriginCommon[0], p[1] - hexOriginCommon[1]], radiusCommon);
                    }
                },
                getValue: [
                    { sources: ['colorWeights'], getValue: ({ colorWeights }) => colorWeights },
                    { sources: ['elevationWeights'], getValue: ({ elevationWeights }) => elevationWeights }
                ]
            });
        }
        return new WebGLAggregator(this.context.device, {
            dimensions: 2,
            channelCount: 2,
            bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
            ...super.getShaders({
                modules: [project32, binOptionsUniforms],
                vs: /* glsl */ `
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;
  
  ${pointToHexbinGLSL}

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    binId = pointToHexbin(positionCommon.xy, binOptions.radiusCommon);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `
            })
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
            colorWeights: { size: 1, accessor: 'getColorWeight' },
            elevationWeights: { size: 1, accessor: 'getElevationWeight' }
        });
    }
    // eslint-disable-next-line complexity
    updateState(params) {
        const aggregatorChanged = super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const { aggregator } = this.state;
        if ((changeFlags.dataChanged || !this.state.dataAsArray) &&
            (props.getColorValue || props.getElevationValue)) {
            // Convert data to array
            this.state.dataAsArray = Array.from(createIterable(props.data).iterable);
        }
        if (aggregatorChanged ||
            changeFlags.dataChanged ||
            props.radius !== oldProps.radius ||
            props.getColorValue !== oldProps.getColorValue ||
            props.getElevationValue !== oldProps.getElevationValue ||
            props.colorAggregation !== oldProps.colorAggregation ||
            props.elevationAggregation !== oldProps.elevationAggregation) {
            this._updateBinOptions();
            const { radiusCommon, hexOriginCommon, binIdRange, dataAsArray } = this.state;
            aggregator.setProps({
                // @ts-expect-error only used by GPUAggregator
                binIdRange,
                pointCount: this.getNumInstances(),
                operations: [props.colorAggregation, props.elevationAggregation],
                binOptions: {
                    radiusCommon,
                    hexOriginCommon
                },
                onUpdate: this._onAggregationUpdate.bind(this)
            });
            if (dataAsArray) {
                const { getColorValue, getElevationValue } = this.props;
                aggregator.setProps({
                    // @ts-expect-error only used by CPUAggregator
                    customOperations: [
                        getColorValue &&
                            ((indices) => getColorValue(indices.map(i => dataAsArray[i]), { indices, data: props.data })),
                        getElevationValue &&
                            ((indices) => getElevationValue(indices.map(i => dataAsArray[i]), { indices, data: props.data }))
                    ]
                });
            }
        }
        if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getColorValue) {
            aggregator.setNeedsUpdate(0);
        }
        if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getElevationValue) {
            aggregator.setNeedsUpdate(1);
        }
        return aggregatorChanged;
    }
    _updateBinOptions() {
        const bounds = this.getBounds();
        let radiusCommon = 1;
        let hexOriginCommon = [0, 0];
        let binIdRange = [
            [0, 1],
            [0, 1]
        ];
        let viewport = this.context.viewport;
        if (bounds && Number.isFinite(bounds[0][0])) {
            let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
            const { radius } = this.props;
            const { unitsPerMeter } = viewport.getDistanceScales(centroid);
            radiusCommon = unitsPerMeter[0] * radius;
            // Use the centroid of the hex at the center of the data
            // This offsets the common space without changing the bins
            const centerHex = pointToHexbin(viewport.projectFlat(centroid), radiusCommon);
            centroid = viewport.unprojectFlat(getHexbinCentroid(centerHex, radiusCommon));
            const ViewportType = viewport.constructor;
            // We construct a viewport for the GPU aggregator's project module
            // This viewport is determined by data
            // removes arbitrary precision variance that depends on initial view state
            viewport = viewport.isGeospatial
                ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 })
                : new Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
            hexOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
            binIdRange = getBinIdRange({
                dataBounds: bounds,
                getBinId: (p) => {
                    const positionCommon = viewport.projectFlat(p);
                    positionCommon[0] -= hexOriginCommon[0];
                    positionCommon[1] -= hexOriginCommon[1];
                    return pointToHexbin(positionCommon, radiusCommon);
                },
                padding: 1
            });
        }
        this.setState({ radiusCommon, hexOriginCommon, binIdRange, aggregatorViewport: viewport });
    }
    draw(opts) {
        // Replaces render time viewport with our own
        if (opts.shaderModuleProps.project) {
            opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
        }
        super.draw(opts);
    }
    _onAggregationUpdate({ channel }) {
        const props = this.getCurrentLayer().props;
        const { aggregator } = this.state;
        if (channel === 0) {
            const result = aggregator.getResult(0);
            this.setState({
                colors: new AttributeWithScale(result, aggregator.binCount)
            });
            props.onSetColorDomain(aggregator.getResultDomain(0));
        }
        else if (channel === 1) {
            const result = aggregator.getResult(1);
            this.setState({
                elevations: new AttributeWithScale(result, aggregator.binCount)
            });
            props.onSetElevationDomain(aggregator.getResultDomain(1));
        }
    }
    onAttributeChange(id) {
        const { aggregator } = this.state;
        switch (id) {
            case 'positions':
                aggregator.setNeedsUpdate();
                this._updateBinOptions();
                const { radiusCommon, hexOriginCommon, binIdRange } = this.state;
                aggregator.setProps({
                    // @ts-expect-error only used by GPUAggregator
                    binIdRange,
                    binOptions: {
                        radiusCommon,
                        hexOriginCommon
                    }
                });
                break;
            case 'colorWeights':
                aggregator.setNeedsUpdate(0);
                break;
            case 'elevationWeights':
                aggregator.setNeedsUpdate(1);
                break;
            default:
            // This should not happen
        }
    }
    renderLayers() {
        const { aggregator, radiusCommon, hexOriginCommon } = this.state;
        const { elevationScale, colorRange, elevationRange, extruded, coverage, material, transitions, colorScaleType, lowerPercentile, upperPercentile, colorDomain, elevationScaleType, elevationLowerPercentile, elevationUpperPercentile, elevationDomain } = this.props;
        const CellLayerClass = this.getSubLayerClass('cells', HexagonCellLayer);
        const binAttribute = aggregator.getBins();
        const colors = this.state.colors?.update({
            scaleType: colorScaleType,
            lowerPercentile,
            upperPercentile
        });
        const elevations = this.state.elevations?.update({
            scaleType: elevationScaleType,
            lowerPercentile: elevationLowerPercentile,
            upperPercentile: elevationUpperPercentile
        });
        if (!colors || !elevations) {
            return null;
        }
        return new CellLayerClass(this.getSubLayerProps({
            id: 'cells'
        }), {
            data: {
                length: aggregator.binCount,
                attributes: {
                    getBin: binAttribute,
                    getColorValue: colors.attribute,
                    getElevationValue: elevations.attribute
                }
            },
            // Data has changed shallowly, but we likely don't need to update the attributes
            dataComparator: (data, oldData) => data.length === oldData.length,
            updateTriggers: {
                getBin: [binAttribute],
                getColorValue: [colors.attribute],
                getElevationValue: [elevations.attribute]
            },
            diskResolution: 6,
            vertices: HexbinVertices,
            radius: radiusCommon,
            hexOriginCommon,
            elevationScale,
            colorRange,
            colorScaleType,
            elevationRange,
            extruded,
            coverage,
            material,
            colorDomain: colors.domain || colorDomain || aggregator.getResultDomain(0),
            elevationDomain: elevations.domain || elevationDomain || aggregator.getResultDomain(1),
            colorCutoff: colors.cutoff,
            elevationCutoff: elevations.cutoff,
            transitions: transitions && {
                getFillColor: transitions.getColorValue || transitions.getColorWeight,
                getElevation: transitions.getElevationValue || transitions.getElevationWeight
            },
            // Extensions are already handled by the GPUAggregator, do not pass it down
            extensions: []
        });
    }
    getPickingInfo(params) {
        const info = params.info;
        const { index } = info;
        if (index >= 0) {
            const bin = this.state.aggregator.getBin(index);
            let object;
            if (bin) {
                const centroidCommon = getHexbinCentroid(bin.id, this.state.radiusCommon);
                const centroid = this.context.viewport.unprojectFlat(centroidCommon);
                object = {
                    col: bin.id[0],
                    row: bin.id[1],
                    position: centroid,
                    colorValue: bin.value[0],
                    elevationValue: bin.value[1],
                    count: bin.count
                };
                if (bin.pointIndices) {
                    object.pointIndices = bin.pointIndices;
                    object.points = Array.isArray(this.props.data)
                        ? bin.pointIndices.map(i => this.props.data[i])
                        : [];
                }
            }
            info.object = object;
        }
        return info;
    }
}
HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;
export default HexagonLayer;
//# sourceMappingURL=hexagon-layer.js.map