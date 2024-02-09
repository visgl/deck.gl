import {
  Accessor,
  AccessorContext,
  AccessorFunction,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  COORDINATE_SYSTEM,
  DefaultProps,
} from '@deck.gl/core';
import {ScaleLinear, scaleLinear} from 'd3-scale';

import AxesLayer from './axes-layer';
import SurfaceLayer from './surface-layer';
import {Range, TickFormat, Vec3} from './types';

const DEFAULT_GET_SCALE = {type: 'function', value: () => scaleLinear()} as const;
const DEFAULT_TICK_FORMAT = {type: 'function', value: (x: number) => x.toFixed(2)} as const;
const DEFAULT_TICK_COUNT = 6;
const DEFAULT_COLOR: Color = [0, 0, 0, 255];

/** All props supported by PlotLayer. */
export type PlotLayerProps<DataT extends Vec3 = Vec3> = _PlotLayerProps<DataT> & CompositeLayerProps;

type _PlotLayerProps<DataT extends Vec3 = Vec3> = {
  // SurfaceLayer props
  getPosition: AccessorFunction<DataT, Vec3>;
  getColor: AccessorFunction<DataT, Color>;
  getXScale: AccessorFunction<Range, ScaleLinear<number, number>>;
  getYScale: AccessorFunction<Range, ScaleLinear<number, number>>;
  getZScale: AccessorFunction<Range, ScaleLinear<number, number>>;
  uCount: number;
  vCount: number;
  lightStrength: number;

  // AxesLayer props
  drawAxes?: boolean;
  fontSize?: number;
  xScale?: ScaleLinear<number, number>;
  yScale?: ScaleLinear<number, number>;
  zScale?: ScaleLinear<number, number>;
  xTicks: number;
  yTicks: number;
  zTicks: number;
  xTickFormat: TickFormat<DataT>;
  yTickFormat: TickFormat<DataT>;
  zTickFormat: TickFormat<DataT>;
  axesPadding: 0;
  axesColor: Color;
  xTitle: string;
  yTitle: string;
  zTitle: string;
};

const defaultProps: DefaultProps<PlotLayerProps> = {
  // SurfaceLayer props
  getPosition: {type: 'accessor', value: ([u, v]) => [0, 0, 0]},
  getColor: {type: 'accessor', value: ([x, y, z]) => DEFAULT_COLOR},
  getXScale: DEFAULT_GET_SCALE,
  getYScale: DEFAULT_GET_SCALE,
  getZScale: DEFAULT_GET_SCALE,
  uCount: 100,
  vCount: 100,
  lightStrength: 0.1,

  // AxesLayer props
  drawAxes: true,
  fontSize: 12,
  xTicks: DEFAULT_TICK_COUNT,
  yTicks: DEFAULT_TICK_COUNT,
  zTicks: DEFAULT_TICK_COUNT,
  xTickFormat: DEFAULT_TICK_FORMAT as unknown as TickFormat,
  yTickFormat: DEFAULT_TICK_FORMAT as unknown as TickFormat,
  zTickFormat: DEFAULT_TICK_FORMAT as unknown as TickFormat,
  xTitle: 'x',
  yTitle: 'y',
  zTitle: 'z',
  axesPadding: 0,
  axesColor: [0, 0, 0, 255],
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
};

/*
 * @classdesc
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Function} [props.getPosition] - method called to get [x, y, z] from (u,v) values
 * @param {Function} [props.getColor] - method called to get color from (x,y,z)
      returns [r,g,b,a].
 * @param {Integer} [props.uCount] - number of samples within x range
 * @param {Integer} [props.vCount] - number of samples within y range
 * @param {Number} [props.lightStrength] - front light strength
 * @param {Boolean} [props.drawAxes] - whether to draw axes

 * @param {Function} [props.getXScale] - returns a d3 scale from (params = {min, max})
 * @param {Function} [props.getYScale] - returns a d3 scale from (params = {min, max})
 * @param {Function} [props.getZScale] - returns a d3 scale from (params = {min, max})
 * @param {Number | [Number]} [props.xTicks] - either tick counts or an array of tick values
 * @param {Number | [Number]} [props.yTicks] - either tick counts or an array of tick values
 * @param {Number | [Number]} [props.zTicks] - either tick counts or an array of tick values
 * @param {Function} [props.xTickFormat] - returns a string from value
 * @param {Function} [props.yTickFormat] - returns a string from value
 * @param {Function} [props.zTickFormat] - returns a string from value
 * @param {String} [props.xTitle] - x axis title
 * @param {String} [props.yTitle] - y axis title
 * @param {String} [props.zTitle] - z axis title

 * @param {Number} [props.axesPadding] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {Number} [props.fontSize] - size of the labels
 * @param {Array} [props.axesColor] - color of the gridlines, in [r,g,b,a]
 */
export default class PlotLayer<DataT extends Vec3 = Vec3, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_PlotLayerProps<DataT>>
> {
  static layerName = 'PlotLayer';
  static defaultProps = defaultProps;

  state!: CompositeLayer['state'] & {
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    zScale: ScaleLinear<number, number>;
  };

  updateState() {
    const {uCount, vCount, getPosition, getXScale, getYScale, getZScale} = this.props;

    // calculate z range
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let zMin = Infinity;
    let zMax = -Infinity;

    for (let vIndex = 0; vIndex < vCount; vIndex++) {
      for (let uIndex = 0; uIndex < uCount; uIndex++) {
        const u = uIndex / (uCount - 1);
        const v = vIndex / (vCount - 1);
        const [x, y, z] = getPosition([u, v, 0] as DataT, {} as AccessorContext<DataT>);

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

    const xScale = getXScale({min: xMin, max: xMax}, {} as AccessorContext<Range>);
    const yScale = getYScale({min: yMin, max: yMax}, {} as AccessorContext<Range>);
    const zScale = getZScale({min: zMin, max: zMax}, {} as AccessorContext<Range>);

    this.setState({xScale, yScale, zScale});
  }

  renderLayers() {
    const {xScale, yScale, zScale} = this.state;
    const {
      getPosition,
      getColor,
      uCount,
      vCount,
      lightStrength,
      fontSize,
      xTicks,
      yTicks,
      zTicks,
      xTickFormat,
      yTickFormat,
      zTickFormat,
      xTitle,
      yTitle,
      zTitle,
      axesPadding,
      axesColor,
      drawAxes,
      updateTriggers
    } = this.props;

    return [
      new SurfaceLayer(
        {
          getPosition: getPosition as AccessorFunction<Vec3, Vec3>,
          getColor: getColor as Accessor<Vec3, Color>,
          uCount,
          vCount,
          xScale,
          yScale,
          zScale,
          lightStrength
        },
        this.getSubLayerProps({
          id: 'surface',
          updateTriggers
        })
      ),
      new AxesLayer(
        {
          xScale,
          yScale,
          zScale,
          fontSize,
          xTicks,
          yTicks,
          zTicks,
          xTickFormat,
          yTickFormat,
          zTickFormat,
          xTitle,
          yTitle,
          zTitle,
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
