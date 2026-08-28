// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { project32 } from '@deck.gl/core';
import { WebGLAggregator, CPUAggregator } from "../common/aggregator/index.js";
import AggregationLayer from "../common/aggregation-layer.js";
import ScreenGridCellLayer from "./screen-grid-cell-layer.js";
import { binOptionsUniforms } from "./bin-options-uniforms.js";
import { defaultColorRange } from "../common/utils/color-utils.js";
const defaultProps = {
    cellSizePixels: { type: 'number', value: 100, min: 1 },
    cellMarginPixels: { type: 'number', value: 2, min: 0 },
    colorRange: defaultColorRange,
    colorScaleType: 'linear',
    getPosition: { type: 'accessor', value: (d) => d.position },
    getWeight: { type: 'accessor', value: 1 },
    gpuAggregation: true,
    aggregation: 'SUM'
};
/** Aggregates data into histogram bins and renders them as a grid. */
class ScreenGridLayer extends AggregationLayer {
    getAggregatorType() {
        return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device)
            ? 'gpu'
            : 'cpu';
    }
    createAggregator(type) {
        if (type === 'cpu' || !WebGLAggregator.isSupported(this.context.device)) {
            return new CPUAggregator({
                dimensions: 2,
                getBin: {
                    sources: ['positions'],
                    getValue: ({ positions }, index, opts) => {
                        const viewport = this.context.viewport;
                        const p = viewport.project(positions);
                        const cellSizePixels = opts.cellSizePixels;
                        if (p[0] < 0 || p[0] >= viewport.width || p[1] < 0 || p[1] >= viewport.height) {
                            // Not on screen
                            return null;
                        }
                        return [Math.floor(p[0] / cellSizePixels), Math.floor(p[1] / cellSizePixels)];
                    }
                },
                getValue: [{ sources: ['counts'], getValue: ({ counts }) => counts }]
            });
        }
        return new WebGLAggregator(this.context.device, {
            dimensions: 2,
            channelCount: 1,
            bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
            ...super.getShaders({
                modules: [project32, binOptionsUniforms],
                vs: `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;
  
  void getBin(out ivec2 binId) {
    vec4 pos = project_position_to_clipspace(positions, positions64Low, vec3(0.0));
    vec2 screenCoords = vec2(pos.x / pos.w + 1.0, 1.0 - pos.y / pos.w) / 2.0 * project.viewportSize.xy / project.devicePixelRatio;
    vec2 gridCoords = floor(screenCoords / binOptions.cellSizePixels);
    binId = ivec2(gridCoords);
  }
  void getValue(out float weight) {
    weight = counts;
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
            // this attribute is used in gpu aggregation path only
            counts: { size: 1, accessor: 'getWeight' }
        });
    }
    shouldUpdateState({ changeFlags }) {
        return changeFlags.somethingChanged;
    }
    updateState(params) {
        const aggregatorChanged = super.updateState(params);
        const { props, oldProps, changeFlags } = params;
        const { cellSizePixels, aggregation } = props;
        if (aggregatorChanged ||
            changeFlags.dataChanged ||
            changeFlags.updateTriggersChanged ||
            changeFlags.viewportChanged ||
            aggregation !== oldProps.aggregation ||
            cellSizePixels !== oldProps.cellSizePixels) {
            const { width, height } = this.context.viewport;
            const { aggregator } = this.state;
            if (aggregator instanceof WebGLAggregator) {
                aggregator.setProps({
                    binIdRange: [
                        [0, Math.ceil(width / cellSizePixels)],
                        [0, Math.ceil(height / cellSizePixels)]
                    ]
                });
            }
            aggregator.setProps({
                pointCount: this.getNumInstances(),
                operations: [aggregation],
                binOptions: {
                    cellSizePixels
                }
            });
        }
        if (changeFlags.viewportChanged) {
            // Rerun aggregation on viewport change
            this.state.aggregator.setNeedsUpdate();
        }
        return aggregatorChanged;
    }
    onAttributeChange(id) {
        const { aggregator } = this.state;
        switch (id) {
            case 'positions':
                aggregator.setNeedsUpdate();
                break;
            case 'counts':
                aggregator.setNeedsUpdate(0);
                break;
            default:
            // This should not happen
        }
    }
    renderLayers() {
        const { aggregator } = this.state;
        const CellLayerClass = this.getSubLayerClass('cells', ScreenGridCellLayer);
        const binAttribute = aggregator.getBins();
        const weightAttribute = aggregator.getResult(0);
        return new CellLayerClass(this.props, this.getSubLayerProps({
            id: 'cell-layer'
        }), {
            data: {
                length: aggregator.binCount,
                attributes: {
                    getBin: binAttribute,
                    getWeight: weightAttribute
                }
            },
            // Data has changed shallowly, but we likely don't need to update the attributes
            dataComparator: (data, oldData) => data.length === oldData.length,
            updateTriggers: {
                getBin: [binAttribute],
                getWeight: [weightAttribute]
            },
            parameters: {
                depthWriteEnabled: false,
                ...this.props.parameters
            },
            // Evaluate domain at draw() time
            colorDomain: () => this.props.colorDomain || aggregator.getResultDomain(0),
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
                object = {
                    col: bin.id[0],
                    row: bin.id[1],
                    value: bin.value[0],
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
ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;
export default ScreenGridLayer;
//# sourceMappingURL=screen-grid-layer.js.map