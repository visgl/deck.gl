// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, project32, picking, UNIT} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';
import {Model} from '@luma.gl/engine';

import {scatterplotUniforms, ScatterplotProps} from './scatterplot-layer-uniforms';
import vs from './scatterplot-layer-vertex.glsl';
import fs from './scatterplot-layer-fragment.glsl';

import type {
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Accessor,
  Unit,
  Position,
  Color,
  DefaultProps
} from '@deck.gl/core';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

/** All props supported by the ScatterplotLayer */
export type ScatterplotLayerProps<DataT = unknown> = _ScatterplotLayerProps<DataT> & LayerProps;

/** Props added by the ScatterplotLayer */
type _ScatterplotLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The units of the radius, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'meters'
   */
  radiusUnits?: Unit;
  /**
   * Radius multiplier.
   * @default 1
   */
  radiusScale?: number;
  /**
   * The minimum radius in pixels. This prop can be used to prevent the circle from getting too small when zoomed out.
   * @default 0
   */
  radiusMinPixels?: number;
  /**
   * The maximum radius in pixels. This prop can be used to prevent the circle from getting too big when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  radiusMaxPixels?: number;

  /**
   * The units of the stroke width, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'meters'
   */
  lineWidthUnits?: Unit;
  /**
   * Stroke width multiplier.
   * @default 1
   */
  lineWidthScale?: number;
  /**
   * The minimum stroke width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.
   * @default 0
   */
  lineWidthMinPixels?: number;
  /**
   * The maximum stroke width in pixels. This prop can be used to prevent the circle from getting too thick when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;

  /**
   * Draw the outline of points.
   * @default false
   */
  stroked?: boolean;
  /**
   * Draw the filled area of points.
   * @default true
   */
  filled?: boolean;
  /**
   * If `true`, rendered circles always face the camera. If `false` circles face up (i.e. are parallel with the ground plane).
   * @default false
   */
  billboard?: boolean;
  /**
   * If `true`, circles are rendered with smoothed edges. If `false`, circles are rendered with rough edges. Antialiasing can cause artifacts on edges of overlapping circles.
   * @default true
   */
  antialiasing?: boolean;

  /**
   * Center position accessor.
   */
  getPosition?: Accessor<DataT, Position>;
  /**
   * Radius accessor.
   * @default 1
   */
  getRadius?: Accessor<DataT, number>;
  /**
   * Fill color accessor.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;
  /**
   * Stroke color accessor.
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;
  /**
   * Stroke width accessor.
   * @default 1
   */
  getLineWidth?: Accessor<DataT, number>;
  /**
   * @deprecated Use `getLineWidth` instead
   */
  strokeWidth?: number;
  /**
   * @deprecated Use `stroked` instead
   */
  outline?: boolean;
  /**
   * @deprecated Use `getFillColor` and `getLineColor` instead
   */
  getColor?: Accessor<DataT, Color>;
};

const defaultProps: DefaultProps<ScatterplotLayerProps> = {
  radiusUnits: 'meters',
  radiusScale: {type: 'number', min: 0, value: 1},
  radiusMinPixels: {type: 'number', min: 0, value: 0}, //  min point radius in pixels
  radiusMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER}, // max point radius in pixels

  lineWidthUnits: 'meters',
  lineWidthScale: {type: 'number', min: 0, value: 1},
  lineWidthMinPixels: {type: 'number', min: 0, value: 0},
  lineWidthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  stroked: false,
  filled: true,
  billboard: false,
  antialiasing: true,

  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getRadius: {type: 'accessor', value: 1},
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineWidth: {type: 'accessor', value: 1},

  // deprecated
  strokeWidth: {deprecatedFor: 'getLineWidth'},
  outline: {deprecatedFor: 'stroked'},
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

/** Render circles at given coordinates. */
export default class ScatterplotLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ScatterplotLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName: string = 'ScatterplotLayer';

  state!: {
    model?: Model;
  };

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, picking, scatterplotUniforms]
    });
  }

  initializeState() {
    this.getAttributeManager()!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceRadius: {
        size: 1,
        transition: true,
        accessor: 'getRadius',
        defaultValue: 1
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: 'unorm8',
        accessor: 'getFillColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: 'unorm8',
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

    if (params.changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {
      radiusUnits,
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      stroked,
      filled,
      billboard,
      antialiasing,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    } = this.props;
    const scatterplotProps: ScatterplotProps = {
      stroked,
      filled,
      billboard,
      antialiasing,
      radiusUnits: UNIT[radiusUnits],
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      lineWidthUnits: UNIT[lineWidthUnits],
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    };
    const model = this.state.model!;
    model.shaderInputs.setProps({scatterplot: scatterplotProps});
    model.draw(this.context.renderPass);
  }

  protected _getModel() {
    // a square that minimally cover the unit circle
    const positions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
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
