// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  UpdateParameters,
  GetPickingInfoParams
} from '@deck.gl/core';

import AxesLayer from './axes-layer';
import SurfaceLayer from './surface-layer';
import {Axes, TickFormat, Vec3, PlotLayerPickingInfo} from './types';

/** All props supported by PlotLayer. */
export type PlotLayerProps = _PlotLayerProps & CompositeLayerProps;

type _PlotLayerProps = {
  // SurfaceLayer props
  /** Function called to get surface coordinate [x, y, z] from [u, v] */
  getPosition: (uv: [u: number, v: number]) => [x: number, y: number, z: number];
  /** Function called to get surface color [r, g, b, a] from [x, y, z] */
  getColor?: Color | ((position: [x: number, y: number, z: number]) => Color);
  /** Callback to supply additional axis settings */
  onAxesChange?: (axes: Axes) => void;
  /** Number of U samples between [0, 1] */
  uCount?: number;
  /** Number of V samples between [0, 1] */
  vCount?: number;
  /** Front light strength */
  lightStrength?: number;

  // AxesLayer props
  /** Whether to draw axes */
  drawAxes?: boolean;
  /** Label size */
  fontSize?: number;
  /** Function called to convert tick value to string */
  tickFormat?: TickFormat;
  /** Padding between the axes and the graph surface */
  axesPadding?: number;
  /** Color of the axes */
  axesColor?: Color;
};

const defaultProps: DefaultProps<PlotLayerProps> = {
  // SurfaceLayer props
  getPosition: {type: 'function', value: uv => [0, 0, 0]},
  getColor: {type: 'accessor', value: [128, 128, 128, 255]},
  onAxesChange: {type: 'function', value: axes => axes},
  uCount: 100,
  vCount: 100,
  lightStrength: 0.1,

  // AxesLayer props
  drawAxes: true,
  fontSize: 12,
  tickFormat: {type: 'function', value: (x: number) => x.toFixed(2)},
  axesPadding: 0,
  axesColor: {type: 'color', value: [0, 0, 0, 255]}
};

/**
 * A layer that plots a surface based on a z=f(x,y) equation.
 */
export default class PlotLayer extends CompositeLayer<Required<_PlotLayerProps>> {
  static layerName = 'PlotLayer';
  static defaultProps = defaultProps;

  state!: {
    axes: Axes;
    samples: Vec3[];
  };

  getPickingInfo(opts: GetPickingInfoParams) {
    const info = opts.info as PlotLayerPickingInfo;
    if (info.uv) {
      info.sample = this.props.getPosition(info.uv);
    }
    return info;
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>) {
    if (
      props.uCount !== oldProps.uCount ||
      props.vCount !== oldProps.vCount ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getPosition)
    ) {
      this.getSamples();
    }
  }

  // eslint-disable-next-line max-statements
  getSamples() {
    const {uCount, vCount, getPosition, onAxesChange} = this.props;
    const samples: Vec3[] = new Array(uCount * vCount);

    // calculate z range
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let zMin = Infinity;
    let zMax = -Infinity;

    let i = 0;
    for (let vIndex = 0; vIndex < vCount; vIndex++) {
      for (let uIndex = 0; uIndex < uCount; uIndex++) {
        const u = uIndex / (uCount - 1);
        const v = vIndex / (vCount - 1);
        const p = getPosition([u, v]);
        samples[i++] = p;

        const [x, y, z] = p;
        if (isFinite(x)) {
          xMin = Math.min(xMin, x);
          xMax = Math.max(xMax, x);
        }
        if (isFinite(y)) {
          yMin = Math.min(yMin, y);
          yMax = Math.max(yMax, y);
        }
        if (isFinite(z)) {
          zMin = Math.min(zMin, z);
          zMax = Math.max(zMax, z);
        }
      }
    }

    const axes: Axes = {
      x: {name: 'x', min: xMin, max: xMax},
      y: {name: 'y', min: yMin, max: yMax},
      z: {name: 'z', min: zMin, max: zMax}
    };
    onAxesChange(axes);

    this.setState({axes, samples});
  }

  renderLayers() {
    const {
      axes: {x: xAxis, y: yAxis, z: zAxis},
      samples
    } = this.state;
    const {
      getColor,
      uCount,
      vCount,
      lightStrength,
      fontSize,
      tickFormat,
      axesPadding,
      axesColor,
      drawAxes,
      updateTriggers
    } = this.props;

    return [
      new SurfaceLayer<Vec3>(
        {
          data: samples,
          getPosition: p => p,
          getColor,
          uCount,
          vCount,
          xAxis,
          yAxis,
          zAxis,
          lightStrength
        },
        this.getSubLayerProps({
          id: 'surface',
          updateTriggers
        })
      ),
      new AxesLayer(
        {
          xAxis,
          yAxis,
          zAxis,
          fontSize,
          tickFormat,
          padding: axesPadding,
          color: axesColor
        },
        this.getSubLayerProps({
          id: 'axes'
        }),
        {
          visible: drawAxes,
          pickable: false
        }
      )
    ];
  }
}
