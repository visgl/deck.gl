// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  project32,
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  Unit,
  Position,
  Accessor,
  Color,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';
import {Model} from '@luma.gl/engine';

import {lineUniforms, LineProps} from './line-layer-uniforms';
import vs from './line-layer-vertex.glsl';
import fs from './line-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<LineLayerProps> = {
  getSourcePosition: {type: 'accessor', value: (x: any) => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: (x: any) => x.targetPosition},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getWidth: {type: 'accessor', value: 1},

  widthUnits: 'pixels',
  widthScale: {type: 'number', value: 1, min: 0},
  widthMinPixels: {type: 'number', value: 0, min: 0},
  widthMaxPixels: {type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0}
};

/** All properties supported by LineLayer. */
export type LineLayerProps<DataT = unknown> = _LineLayerProps<DataT> & LayerProps;

/** Properties added by LineLayer. */
type _LineLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'pixels'
   */
  widthUnits?: Unit;

  /**
   * The scaling multiplier for the width of each line.
   * @default 1
   */
  widthScale?: number;

  /**
   * The minimum line width in pixels.
   * @default 0
   */
  widthMinPixels?: number;

  /**
   * The maximum line width in pixels.
   * @default Number.MAX_SAFE_INTEGER
   */
  widthMaxPixels?: number;

  /**
   * Source position of each object.
   * @default object => object.sourcePosition
   */
  getSourcePosition?: Accessor<DataT, Position>;

  /**
   * Target position of each object.
   * @default object => object.targetPosition
   */
  getTargetPosition?: Accessor<DataT, Position>;

  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;

  /**
   * Width of each object
   * @default 1
   */
  getWidth?: Accessor<DataT, number>;
};

/**
 * A layer that renders straight lines joining pairs of source and target coordinates.
 */
export default class LineLayer<DataT = any, ExtraProps extends {} = {}> extends Layer<
  ExtraProps & Required<_LineLayerProps<DataT>>
> {
  static layerName = 'LineLayer';
  static defaultProps = defaultProps;

  state!: {
    model?: Model;
  };

  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds([
      'instanceSourcePositions',
      'instanceTargetPositions'
    ]);
  }

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking, lineUniforms]});
  }

  // This layer has its own wrapLongitude logic
  get wrapLongitude(): boolean {
    return false;
  }

  initializeState() {
    const attributeManager = this.getAttributeManager()!;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getSourcePosition'
      },
      instanceTargetPositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getTargetPosition'
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: 'getWidth',
        defaultValue: 1
      }
    });
    /* eslint-enable max-len */
  }

  updateState(params: UpdateParameters<this>): void {
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw({uniforms}): void {
    const {widthUnits, widthScale, widthMinPixels, widthMaxPixels, wrapLongitude} = this.props;
    const model = this.state.model!;
    const lineProps: LineProps = {
      widthUnits: UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      useShortestPath: wrapLongitude ? 1 : 0
    };
    model.shaderInputs.setProps({line: lineProps});
    model.draw(this.context.renderPass);

    if (wrapLongitude) {
      // Render a second copy for the clipped lines at the 180th meridian
      model.shaderInputs.setProps({line: {...lineProps, useShortestPath: -1}});
      model.draw(this.context.renderPass);
    }
  }

  protected _getModel(): Model {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'triangle-strip',
        attributes: {
          positions: {size: 3, value: new Float32Array(positions)}
        }
      }),
      isInstanced: true
    });
  }
}
