import {Layer, project32, picking} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';

import vs from './text-background-layer-vertex.glsl';
import fs from './text-background-layer-fragment.glsl';

const defaultProps = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: 'pixels',
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,

  padding: {type: 'array', value: [0, 0, 0, 0]},

  getPosition: {type: 'accessor', value: x => x.position},
  getSize: {type: 'accessor', value: 1},
  getAngle: {type: 'accessor', value: 0},
  getPixelOffset: {type: 'accessor', value: [0, 0]},
  getBoundingRect: {type: 'accessor', value: [0, 0, 0, 0]},
  getFillColor: {type: 'accessor', value: [0, 0, 0, 255]},
  getLineColor: {type: 'accessor', value: [0, 0, 0, 255]},
  getLineWidth: {type: 'accessor', value: 1}
};

export default class TextBackgroundLayer extends Layer {
  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]});
  }

  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceSizes: {
        size: 1,
        transition: true,
        accessor: 'getSize',
        defaultValue: 1
      },
      instanceAngles: {
        size: 1,
        transition: true,
        accessor: 'getAngle'
      },
      instanceRects: {
        size: 4,
        accessor: 'getBoundingRect'
      },
      instancePixelOffsets: {
        size: 2,
        transition: true,
        accessor: 'getPixelOffset'
      },
      instanceFillColors: {
        size: 4,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getFillColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: 4,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getLineColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: 'getLineWidth',
        defaultValue: 1
      }
    });
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager().invalidateAll();
    }
  }

  draw({uniforms}) {
    const {viewport} = this.context;
    const {
      billboard,
      sizeScale,
      sizeUnits,
      sizeMinPixels,
      sizeMaxPixels,
      getLineWidth
    } = this.props;
    let {padding} = this.props;

    const sizeScaleMultiplier = sizeUnits === 'pixels' ? viewport.metersPerPixel : 1;
    if (padding.length < 4) {
      padding = [padding[0], padding[1], padding[0], padding[1]];
    }

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        billboard,
        stroked: Boolean(getLineWidth),
        padding,
        sizeScale: sizeScale * sizeScaleMultiplier,
        sizeMinPixels,
        sizeMaxPixels
      })
      .draw();
  }

  _getModel(gl) {
    // a square that minimally cover the unit circle
    const positions = [0, 0, 1, 0, 1, 1, 0, 1];

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount: 4,
        attributes: {
          positions: {size: 2, value: new Float32Array(positions)}
        }
      }),
      isInstanced: true
    });
  }
}

TextBackgroundLayer.layerName = 'TextBackgroundLayer';
TextBackgroundLayer.defaultProps = defaultProps;
