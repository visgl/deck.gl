// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Color, DefaultProps, Layer, UpdateParameters, Attribute, LayerProps} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {Texture} from '@luma.gl/core';

import {textMatrixToTexture} from './utils';

import gridFragment from './grid-fragment.glsl';
import gridVertex from './grid-vertex.glsl';
import labelVertex from './label-vertex.glsl';
import labelFragment from './label-fragment.glsl';
import {Axis, TickFormat, Vec3} from './types';

type Tick = {
  axis: 'x' | 'y' | 'z';
  value: string;
  position: [number, number];
  text: string;
};

interface LabelTexture {
  labelHeight: number;
  labelWidths: number[];
  labelTexture: Texture;
}

const defaultProps: DefaultProps<AxesLayerProps> = {
  fontSize: 12,
  tickFormat: {type: 'function', value: (x: number) => x.toFixed(2)},
  padding: 0,
  color: {type: 'color', value: [0, 0, 0, 255]}
};

/** All props supported by AxesLayer. */
export type AxesLayerProps = _AxesLayerProps & LayerProps;

type _AxesLayerProps = {
  xAxis: Axis;
  yAxis: Axis;
  zAxis: Axis;
  fontSize?: number;
  tickFormat?: TickFormat;
  padding?: number;
  color?: Color;
};

/*
 * A layer that plots a surface based on a z=f(x,y) equation.
 */
export default class AxesLayer extends Layer<Required<_AxesLayerProps>> {
  static layerName = 'AxesLayer';
  static defaultProps = defaultProps;

  state!: {
    models: [Model, Model];
    modelsByName: {grids: Model; labels: Model};
    ticks: Tick[];
    gridDims: Vec3;
    gridCenter: Vec3;
    labelTexture: LabelTexture | null;
  };

  initializeState() {
    const attributeManager = this.getAttributeManager()!;

    /* eslint-disable @typescript-eslint/unbound-method */
    attributeManager.addInstanced({
      instancePositions: {size: 2, update: this.calculateInstancePositions, noAlloc: true},
      instanceNormals: {size: 3, update: this.calculateInstanceNormals, noAlloc: true},
      instanceOffsets: {size: 1, update: this.calculateInstanceOffsets, noAlloc: true}
    });
    /* eslint-enable @typescript-eslint/unbound-method */

    this.setState(this._getModels());
  }

  updateState({oldProps, props}: UpdateParameters<this>) {
    const attributeManager = this.getAttributeManager()!;

    if (
      oldProps.xAxis !== props.xAxis ||
      oldProps.yAxis !== props.yAxis ||
      oldProps.zAxis !== props.zAxis
    ) {
      const {xAxis, yAxis, zAxis, tickFormat} = props;

      const ticks = [
        ...getTicks(xAxis, tickFormat),
        ...getTicks(yAxis, tickFormat),
        ...getTicks(zAxis, tickFormat)
      ];

      const xRange = getRange(xAxis);
      const yRange = getRange(yAxis);
      const zRange = getRange(zAxis);

      this.setState({
        ticks,
        labelTexture: this.renderLabelTexture(ticks),
        gridDims: [xRange[1] - xRange[0], zRange[1] - zRange[0], yRange[1] - yRange[0]],
        gridCenter: [
          (xRange[0] + xRange[1]) / 2,
          (zRange[0] + zRange[1]) / 2,
          (yRange[0] + yRange[1]) / 2
        ]
      });

      attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {gridDims, gridCenter, modelsByName, ticks} = this.state;
    const {labelTexture, ...labelTextureUniforms} = this.state.labelTexture!;
    const {fontSize, color, padding} = this.props;

    if (labelTexture) {
      const baseUniforms = {
        fontSize,
        gridDims,
        gridCenter,
        gridOffset: padding,
        strokeColor: color
      };

      modelsByName.grids.setInstanceCount(ticks.length);
      modelsByName.labels.setInstanceCount(ticks.length);

      modelsByName.grids.setUniforms({...uniforms, ...baseUniforms});
      modelsByName.labels.setBindings({labelTexture});
      modelsByName.labels.setUniforms({
        ...uniforms,
        ...baseUniforms,
        ...labelTextureUniforms
      });

      modelsByName.grids.draw(this.context.renderPass);
      modelsByName.labels.draw(this.context.renderPass);
    }
  }

  _getModels() {
    /* grids:
     * for each x tick, draw rectangle on yz plane around the bounding box.
     * for each y tick, draw rectangle on zx plane around the bounding box.
     * for each z tick, draw rectangle on xy plane around the bounding box.
     * show/hide is toggled by the vertex shader
     */
    /*
     * rectangles are defined in 2d and rotated in the vertex shader
     *
     * (-1,1)      (1,1)
     *   +-----------+
     *   |           |
     *   |           |
     *   |           |
     *   |           |
     *   +-----------+
     * (-1,-1)     (1,-1)
     */

    // offset of each corner
    const gridPositions = [
      // left edge
      -1, -1, 0, -1, 1, 0,
      // top edge
      -1, 1, 0, 1, 1, 0,
      // right edge
      1, 1, 0, 1, -1, 0,
      // bottom edge
      1, -1, 0, -1, -1, 0
    ];
    // normal of each edge
    const gridNormals = [
      // left edge
      -1, 0, 0, -1, 0, 0,
      // top edge
      0, 1, 0, 0, 1, 0,
      // right edge
      1, 0, 0, 1, 0, 0,
      // bottom edge
      0, -1, 0, 0, -1, 0
    ];
    const {device} = this.context;

    const grids = new Model(device, {
      id: `${this.props.id}-grids`,
      vs: gridVertex,
      fs: gridFragment,
      disableWarnings: true,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'line-list',
        attributes: {
          positions: {value: new Float32Array(gridPositions), size: 3},
          normals: {value: new Float32Array(gridNormals), size: 3}
        },
        vertexCount: gridPositions.length / 3
      })
    });

    /* labels
     * one label is placed at each end of every grid line
     * show/hide is toggled by the vertex shader
     */
    let labelTexCoords: number[] = [];
    let labelPositions: number[] = [];
    let labelNormals: number[] = [];
    let labelIndices: number[] = [];
    for (let i = 0; i < 8; i++) {
      /*
       * each label is rendered as a rectangle
       *   0     2
       *    +--.+
       *    | / |
       *    +'--+
       *   1     3
       */
      labelTexCoords = labelTexCoords.concat([0, 0, 0, 1, 1, 0, 1, 1]);
      labelIndices = labelIndices.concat([
        i * 4 + 0,
        i * 4 + 1,
        i * 4 + 2,
        i * 4 + 2,
        i * 4 + 1,
        i * 4 + 3
      ]);

      // all four vertices of this label's rectangle is anchored at the same grid endpoint
      for (let j = 0; j < 4; j++) {
        labelPositions = labelPositions.concat(gridPositions.slice(i * 3, i * 3 + 3));
        labelNormals = labelNormals.concat(gridNormals.slice(i * 3, i * 3 + 3));
      }
    }

    const labels = new Model(device, {
      id: `${this.props.id}-labels`,
      vs: labelVertex,
      fs: labelFragment,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      disableWarnings: true,
      geometry: new Geometry({
        topology: 'triangle-list',
        attributes: {
          indices: new Uint16Array(labelIndices),
          positions: {value: new Float32Array(labelPositions), size: 3},
          texCoords: {value: new Float32Array(labelTexCoords), size: 2},
          normals: {value: new Float32Array(labelNormals), size: 3}
        }
      })
    });

    return {
      models: [grids, labels].filter(Boolean),
      modelsByName: {grids, labels}
    };
  }

  calculateInstancePositions(attribute: Attribute) {
    const {ticks} = this.state;

    const positions = ticks.flatMap(t => t.position);
    attribute.value = new Float32Array(positions);
  }

  calculateInstanceNormals(attribute: Attribute) {
    const {ticks} = this.state;

    const normals = ticks.flatMap(t => {
      switch (t.axis) {
        case 'x':
          return [1, 0, 0];
        case 'z':
          // Flip y and z
          return [0, 1, 0];
        case 'y':
        default:
          return [0, 0, 1];
      }
    });
    attribute.value = new Float32Array(normals);
  }

  calculateInstanceOffsets(attribute: Attribute) {
    const {ticks} = this.state;

    const offsets = ticks.flatMap(t => {
      return t.value === 'title' ? 2 : 0.5;
    });
    attribute.value = new Float32Array(offsets);
  }

  renderLabelTexture(ticks: Tick[]): LabelTexture | null {
    if (this.state.labelTexture) {
      this.state.labelTexture.labelTexture.destroy();
    }

    const labelsbyAxis: [x: string[], z: string[], y: string[]] = [[], [], []];
    for (const t of ticks) {
      switch (t.axis) {
        case 'x':
          labelsbyAxis[0].push(t.text);
          break;
        case 'z':
          labelsbyAxis[1].push(t.text);
          break;
        case 'y':
        default:
          labelsbyAxis[2].push(t.text);
          break;
      }
    }

    // attach a 2d texture of all the label texts
    const textureInfo = textMatrixToTexture(this.context.device, labelsbyAxis);
    if (textureInfo) {
      // success
      const {rowHeight, columnWidths, texture} = textureInfo;

      return {
        labelHeight: rowHeight,
        labelWidths: columnWidths,
        labelTexture: texture
      };
    }
    return null;
  }
}

function getRange(axis: Axis): [number, number] {
  const {min, max, scale} = axis;
  if (scale) {
    return [scale(min), scale(max)];
  }
  return [min, max];
}

function getTicks(axis: Axis, tickFormat: TickFormat): Tick[] {
  const {min, max} = axis;
  const ticks = axis.ticks ?? [min, max];
  const scale = axis.scale ?? (x => x);

  return [
    ...ticks.map(
      (t, i) =>
        ({
          axis: axis.name,
          value: String(t),
          position: [scale(t), i],
          text: tickFormat(t, axis)
        }) as Tick
    ),
    {
      axis: axis.name,
      value: 'title',
      position: [(scale(min) + scale(max)) / 2, ticks.length],
      text: axis.title ?? axis.name
    }
  ];
}
