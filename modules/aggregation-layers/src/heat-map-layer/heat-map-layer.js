// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import GL from '@luma.gl/constants';
import {Model, Geometry, Buffer, Transform, Texture2D} from '@luma.gl/core';
import {CompositeLayer, WebMercatorViewport} from '@deck.gl/core';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION} from '../utils/aggregation-operation-utils';
import TriangleLayer from './triangle-layer';
import {parseGridData, getGridParams, getCellSize, pointToDensityGridData} from '../utils/gpu-grid-aggregation/grid-aggregation-utils';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import {tesselateRectangle, getTriangleVertices} from '../utils/rectangle-tesselation';
import kde_vs from './kde-vs.glsl';
import kde_fs from './kde-fs.glsl';
const USE_EARTHQUACKE_DATA = true;
const LNG_LENGTH = 40;
const LAT_LENGTH = 15;

const defaultProps = {
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: x => 1},

  granularity: 'high', // defines aggregation cell size

  radiusPixels: {type: 'number', min: 1, max: 50, value: 50},
  radiusScaleFactor: {type: 'number', min: 0, value: 2}, // controls scaling of radiusPixels with zoom change
  radiusMinPixels: {type: 'number', min: 1, value: 1},
  radiusMaxPixels: {type: 'number', min: 1, value: 30},

  colorRange: defaultColorRange,

  // debug props
  linearFilter: true,
  renderGirdTexture: false,
  renderBoundingBox: false,
  disableTessilation: false,
  screenSpaceAggregation: true
};

export default class HeatMapLayer extends CompositeLayer {
  initializeState() {
    const {gl} = this.context;
    const options = {
      id: `${this.id}-gpu-aggregator`,
      shaderCache: this.context.shaderCache
    };
    const defaultTexture = new Texture2D(gl);
    this.state = {
      gpuGridAggregator: new GPUGridAggregator(gl, options),
      transform: new Transform(gl, {
        vs: kde_vs,
        fs: kde_fs,
        elementCount: 1,
        _sourceTextures: {
          inTexture: defaultTexture
        },
        _targetTextureVarying: 'outTexture',
      }),
      heatTexture: null,
      boundingBox: null,
      cellSize: null, // [lngSize, latSize], depends on viewport.zoom
      zoom: null,
      triPositionBuffer: null,
      triTexCoordBuffer: null,
      defaultTexture
    };
  }

  shouldUpdateState({changeFlags}) {
    // Need to be updated when viewport changed too.
    return changeFlags.somethingChanged;
  }

  updateState(opts) {
    super.updateState(opts);

    const changeFlags = this.getChangeFlags(opts);
    let updateHeatMapSource = false;
    let updateHeatMapRadius = false;
    if (changeFlags.dataChanged) {
      this.parseData();
    }
    if (changeFlags.cellSizeChanged) {
      const {heatTexture} = this.state;
      if (heatTexture) {
        heatTexture.delete();
        this.setState({heatTexture: null});
      }
      this.updateCellSize();
    }
    if (changeFlags.dataChanged || changeFlags.cellSizeChanged) {
        this.updateAggregation(changeFlags);
        updateHeatMapSource = true;
    }

    if (
      opts.oldProps.radiusPixels !== opts.props.radiusPixels ||
      changeFlags.zoomChanged
    ) {
      this.updateRadiusPixels(opts);
      updateHeatMapRadius = true;
    }

    if (updateHeatMapSource || updateHeatMapRadius) {
        this.updateHeatMap(updateHeatMapSource);
    }
    // _TODO: Check radiusPixels and update heatTexture
  }

  updateRadiusPixels({oldProps, props, changeFlags}) {
    const {zoom, radiusPixels} = this.state;
    const {radiusScaleFactor, radiusMinPixels, radiusMaxPixels} = props;
    if (radiusPixels === undefined || oldProps.radiusPixels !== props.radiusPixels) {
      this.setState({
        radiusPixels: props.radiusPixels,
        zoom: this.context.viewport.zoom
      });
    } else {
      // change current radisuPixels based on zoom change
      const currentZoom = this.context.viewport.zoom;
      const zoomDelta = currentZoom - zoom;
      let newRadiusPixels = radiusPixels - radiusScaleFactor * zoomDelta;
      newRadiusPixels = Math.min(radiusMaxPixels, newRadiusPixels);
      newRadiusPixels = Math.max(radiusMinPixels, newRadiusPixels);
      this.setState({radiusPixels: newRadiusPixels, zoom: currentZoom});
    }
  }

  finalizeState() {
    super.finalizeState();
    const {gpuGridAggregator, transform, defaultTexture, triPositionBuffer, triTexCoordBuffer} = this.state;
    gpuGridAggregator.delete();
    transform.delete();
    defaultTexture.delete();
    triPositionBuffer.delete();
    triTexCoordBuffer.delete();
  }

  getChangeFlags(opts) {
    const {oldProps, props} = opts;
    const {zoom} = this.context.viewport;
    // const {cellSize, radiusPixels} = props;
    // console.log(`zoom: ${zoom} cellSize: ${cellSize} radiusPixels: ${radiusPixels}`);
    // console.log(`zoom: ${zoom} cellSize: ${1062 - 350 * Math.log(zoom+1) + 5}`);
    // const cellSize = 1062 - 350 * Math.log(zoom+1) + 5;
    const changeFlags = {};
    if (this.isDataChanged(opts)) {
      changeFlags.dataChanged = true;
    }
    if (oldProps.granulatiry !== props.granularity) {
      changeFlags.cellSizeChanged = true;
    }
    if (this.state.zoom === undefined || zoom !== this.state.zoom) {
      changeFlags.zoomChanged = true;
    }
    // forward viewport changed flag
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;

    // DEBUG only, remove
    if (this.isDebugFlagChanged(opts)) {
      changeFlags.dataChanged = true;
      changeFlags.cellSizeChanged = true;
      changeFlags.zoomChanged = true;
      changeFlags.viewportChanged = true;
    }
    return changeFlags;
  }

  isDebugFlagChanged({oldProps, props}) {
    if (
      oldProps.linearFilter !== props.linearFilter ||
      oldProps.renderGirdTexture !== props.renderGirdTexture ||
      oldProps.renderBoundingBox !== props.renderBoundingBox ||
      oldProps.disableTessilation !== props.disableTessilation ||
      oldProps.screenSpaceAggregation !== props.screenSpaceAggregation
    ) {
      return true;
    }
    return false;
  }

  isDataChanged({changeFlags}) {
    // Flags affecting aggregation data
    if (changeFlags.dataChanged) {
      return true;
    }
    if (
      changeFlags.updateTriggersChanged &&
      (changeFlags.updateTriggersChanged.all ||
        changeFlags.updateTriggersChanged.getPosition ||
        changeFlags.updateTriggersChanged.getWeight)
    ) {
      return true;
    }
    return false;
  }

  getAttributes({boundingBox}) {
    const {xMin, yMin, xMax, yMax} = boundingBox;
    const {disableTessilation} = this.props;
    let triPositions;
    let triTexCoords;
    if (disableTessilation) {
      triPositions = getTriangleVertices(Object.assign({},boundingBox, {addZ: true}));
      triTexCoords = getTriangleVertices();
    } else {
      triPositions = tesselateRectangle(boundingBox, {xLength: LNG_LENGTH, yLength: LAT_LENGTH, addZ: true});
      triTexCoords = tesselateRectangle({xMin:0, yMin:0, xMax:1, yMax:1}, {xLength: LNG_LENGTH/(xMax - xMin), yLength: LAT_LENGTH/(yMax - yMin)})
    }
    return {triPositions, triTexCoords};
  }
  parseData(){
    const {
      data,
      getPosition,
      getWeight,
    } = this.props;
    const {gl} = this.context;
    const weightParams = {
      color: {
        getWeight,
        operation: AGGREGATION_OPERATION.SUM,
        needMin: true,
        needMax: true,
        combineMaxMin: true
      }
    };
    const {positions, positions64xyLow, weights, boundingBox} = parseGridData(data, getPosition, weightParams);
    const {triPositions, triTexCoords} = this.getAttributes({boundingBox});
    this.setState({
      positions,
      positions64xyLow,
      weights,
      boundingBox,
      triPositionBuffer: new Buffer(gl, new Float32Array(triPositions)),
      triTexCoordBuffer: new Buffer(gl, new Float32Array(triTexCoords)),
      triangleCount: triPositions.length / 3,
    });
  }

  updateCellSize() {
    // FOR now use constact cellSize
    const {boundingBox} = this.state;
    const cellSize =  getCellSize({cellSizeMeters: USE_EARTHQUACKE_DATA ? 10000 : 20, boundingBox})
    this.setState({cellSize});
  }

  updateAggregation(changeFlags) {
    const {
      data,
      getPosition,
      getWeight,
      screenSpaceAggregation
    } = this.props;

    if (screenSpaceAggregation) {
      const {boundingBox, cellSize, gpuGridAggregator, positions, positions64xyLow, weights} = this.state;
      let viewport = this.context.viewport;

      const bounds = [[boundingBox.xMin, boundingBox.yMin], [boundingBox.xMax, boundingBox.yMax]];
      const width = viewport.height * (boundingBox.xMax - boundingBox.xMin) / (boundingBox.yMax - boundingBox.yMin);
      viewport = new WebMercatorViewport(Object.assign({}, viewport, {width}));
      viewport = viewport.fitBounds(bounds);


      // const {width, height, gridTransformMatrix} = getGridParams({boundingBox, cellSize, viewport});
      const aggregationResults = gpuGridAggregator.run({
        positions,
        positions64xyLow,
        weights,
        cellSize: [1, 1],
        viewport,
        // width,
        // height,
        // gridTransformMatrix,
        useGPU: true,
        changeFlags,
        fp64:false, // TODO failing when enabled
        projectPoints: true
      });
      this.setState({aggregationTexture: aggregationResults.color.aggregationTexture});
    } else {

      let viewport = this.context.viewport;

      const {boundingBox, cellSize, gpuGridAggregator, positions, positions64xyLow, weights} = this.state;
      // const bounds = [[boundingBox.xMin, boundingBox.yMin], [boundingBox.xMax, boundingBox.yMax]];
      // const width = viewport.height * (boundingBox.xMax - boundingBox.xMin) / (boundingBox.yMax - boundingBox.yMin);
      // viewport = new WebMercatorViewport(Object.assign({}, viewport, {width}));
      // viewport = viewport.fitBounds(bounds);

      const weightParams = {
        color: {
          getWeight,
          operation: AGGREGATION_OPERATION.SUM,
          needMin: true,
          needMax: true,
          combineMaxMin: true
        }
      };

      const aggregationResults = pointToDensityGridData({
        data,
        getPosition,
        cellSizeMeters: USE_EARTHQUACKE_DATA ? 10000 : 20,
        gpuGridAggregator,
        gpuAggregation: true,
        aggregationFlags: {dataChanged: true},
        weightParams,
        // fp64 false,
        // coordinateSystem COORDINATE_SYSTEM.LNGLAT,
        // viewport = null,
        // boundingBox = null,

        viewport: screenSpaceAggregation ? viewport : null,
        projectPoints: screenSpaceAggregation
      });

      this.setState({aggregationTexture: aggregationResults.weights.color.aggregationTexture});
      // console.log(`aggregationTexture maxMin data: ${aggregationResults.weights.color.maxMinBuffer.getData()}`);
    }
  }


  calculateMaxValue(texture) {
    const {gl} = this.context;
    const vs_max = `\
#version 300 es
in vec4 inTexture;
out vec4 outTexture;

void main()
{
outTexture = inTexture;
gl_Position = vec4(0, 0, 0, 1.);
}
`;

    const target = new Texture2D(gl, {
      data: new Float32Array(4).fill(0),
      format: GL.RGBA32F,
      type: GL.FLOAT,
      border: 0,
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST
      },
      pixelStore: {
        [GL.UNPACK_FLIP_Y_WEBGL]: false
      },
      dataFormat: GL.RGBA,
      width: 1,
      height: 1
    });

    const {width, height} = texture;
    const transform = new Transform(gl, {
      _sourceTextures: {
        inTexture: texture
      },
      _targetTexture: target,
      _targetTextureVarying: 'outTexture',
      vs: vs_max,
      //  fs,
      elementCount: width * height
    });

    transform.run({
      parameters: {
        blend: true,
        depthTest: false,
        blendFunc: [GL.ONE, GL.ONE],
        blendEquation: GL.MAX
      }
    });
    // return transform._getTargetTexture();
    // TODO: reading the texgture, use texture with sample or read it into Buffer
    return transform.getData();
  }

  updateHeatMap(updateSource = false) {
    const {linearFilter} = this.props;
    const {transform, radiusPixels} = this.state;

    if (updateSource) {
      const {width, height} = this.state.aggregationTexture;
      transform.update({
        _sourceTextures: {
          inTexture: this.state.aggregationTexture
        },
        _targetTexture: this.state.heatTexture || 'inTexture',
        elementCount: width * height
      });
    }
    // console.log(`updateHeatMap: radiusPixels: ${radiusPixels}`);
    transform.run({
      uniforms: {radiusPixels},
      parameters: {
        blend: true,
        depthTest: false,
        blendFunc: [GL.ONE, GL.ONE],
        blendEquation: GL.FUNC_ADD
      }
    });

    const heatTexture = transform._getTargetTexture();

    // const heatTexture = this.state.aggregationTexture;
    // TODO: cleanup after verifying minMax before after running gaussing kernel
    const maxValues = this.calculateMaxValue(heatTexture);
    console.log(`Heatmap maxValues: ${maxValues}`);
    let filter = GL.LINEAR;
    if (!linearFilter || this.context.viewport.zoom > 18) {
      filter = GL.NEAREST;
    }
    heatTexture.setParameters({
      [GL.TEXTURE_MAG_FILTER]: filter, // GL.LINEAR, // NEAREST, // LINEAR,
      [GL.TEXTURE_MIN_FILTER]: filter // GL.LINEAR // NEAREST // LINEAR
    });
    this.setState({heatTexture, maxValues});
  }

  renderLayers() {
    const {heatTexture, maxValues, aggregationTexture, triPositionBuffer, triTexCoordBuffer, triangleCount} = this.state;
    const {renderBoundingBox, renderGirdTexture, colorRange} = this.props;
    // const colorRange = colorRangeToFlatArray(this.props.colorRange, Float32Array, 255);
    const sampleTexture = renderGirdTexture ? aggregationTexture : heatTexture;

    // const sampleTexture = renderGirdTexture ? aggregationTexture : heatTexture;

    return new TriangleLayer({
      id: 'heatmap-triangle-layer',
      data: {
        positions: triPositionBuffer,
        texCoords: triTexCoordBuffer
      },
      wireframe: renderBoundingBox,
      count: triangleCount,
      // TODO (finalize these props)
      maxValues,
      colorRange,
      texture: sampleTexture
    })
  };
}

HeatMapLayer.layerName = 'HeatMapLayer';
HeatMapLayer.defaultProps = defaultProps;
