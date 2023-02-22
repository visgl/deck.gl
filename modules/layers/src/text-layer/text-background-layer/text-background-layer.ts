import {Layer, project32, picking, UNIT} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';

import vs from './text-background-layer-vertex.glsl';
import fs from './text-background-layer-fragment.glsl';

import type {
  LayerProps,
  LayerDataSource,
  Accessor,
  Unit,
  Position,
  Color,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';

type _TextBackgroundLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  billboard?: boolean;
  sizeScale?: number;
  sizeUnits?: Unit;
  sizeMinPixels?: number;
  sizeMaxPixels?: number;

  padding?: [number, number] | [number, number, number, number];

  getPosition?: Accessor<DataT, Position>;
  getSize?: Accessor<DataT, number>;
  getAngle?: Accessor<DataT, number>;
  getPixelOffset?: Accessor<DataT, [number, number]>;
  getBoundingRect?: Accessor<DataT, [number, number, number, number]>;
  getFillColor?: Accessor<DataT, Color>;
  getLineColor?: Accessor<DataT, Color>;
  getLineWidth?: Accessor<DataT, number>;
};

export type TextBackgroundLayerProps<DataT = any> = _TextBackgroundLayerProps<DataT> & LayerProps;

const defaultProps: DefaultProps<TextBackgroundLayerProps> = {
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

export default class TextBackgroundLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_TextBackgroundLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'TextBackgroundLayer';

  state!: {
    model: Model;
  };

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]});
  }

  initializeState() {
    this.getAttributeManager()!.addInstanced({
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

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {changeFlags} = params;
    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {billboard, sizeScale, sizeUnits, sizeMinPixels, sizeMaxPixels, getLineWidth} =
      this.props;
    let {padding} = this.props;

    if (padding.length < 4) {
      padding = [padding[0], padding[1], padding[0], padding[1]];
    }

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        billboard,
        stroked: Boolean(getLineWidth),
        padding,
        sizeUnits: UNIT[sizeUnits],
        sizeScale,
        sizeMinPixels,
        sizeMaxPixels
      })
      .draw();
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
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
