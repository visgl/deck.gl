import {CompositeLayer} from 'deck.gl';
import AxesLayer from './axes-layer';
import SurfaceLayer from './surface-layer';

const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
  getZ: () => 0,
  getColor: () => DEFAULT_COLOR,
  xMin: -1,
  xMax: 1,
  yMin: -1,
  yMax: 1,
  xResolution: 100,
  yResolution: 100,
  lightStrength: 1,
  drawAxes: true,
  fontSize: 24,
  ticksCount: 6,
  axesOffset: 0,
  axesColor: [0, 0, 0, 255]
};

/*
 * @classdesc
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Function} [props.getZ] - method called to get z from (x,y) values
 * @param {Function} [props.getColor] - method called to get color from (x,y,z)
      returns [r,g,b,a].
 * @param {Number} [props.xMin] - low bound of x
 * @param {Number} [props.xMax] - high bound of x
 * @param {Number} [props.yMin] - low bound of y
 * @param {Number} [props.yMax] - high bound of y
 * @param {Integer} [props.xResolution] - number of samples within x range
 * @param {Integer} [props.yResolution] - number of samples within y range
 * @param {Number} [props.lightStrength] - front light strength
 * @param {Boolean} [props.drawAxes] - whether to draw axes
 * @param {Integer} [props.ticksCount] - number of ticks along each axis, see
      https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks
 * @param {Number} [props.axesOffset] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {Number} [props.fontSize] - size of the labels
 * @param {Array} [props.axesColor] - color of the gridlines, in [r,g,b,a]
 */
export default class PlotLayer extends CompositeLayer {

  initializeState() {
    this.state = {
      bounds: [[0, 0], [0, 0], [0, 0]]
    };
  }

  updateState() {
  }

  _updateBounds(bounds) {
    this.setState({bounds});
  }

  renderLayers() {
    return [
      new SurfaceLayer({
        getZ: this.props.getZ,
        getColor: this.props.getColor,
        xMin: this.props.xMin,
        xMax: this.props.xMax,
        yMin: this.props.yMin,
        yMax: this.props.yMax,
        xResolution: this.props.xResolution,
        yResolution: this.props.yResolution,
        opacity: this.props.opacity,
        pickable: this.props.pickable,
        visible: this.props.visible,
        onHover: this.props.onHover,
        onClick: this.props.onClick,
        onUpdate: this._updateBounds.bind(this),
        updateTriggers: this.props.updateTriggers
      }),
      new AxesLayer({
        data: this.state.bounds,
        fontSize: this.props.fontSize,
        ticksCount: this.props.ticksCount,
        axesOffset: this.props.axesOffset,
        axesColor: this.props.axesColor,
        visible: this.props.drawAxes,
        pickable: false
      })
    ];
  }

}

PlotLayer.layerName = 'PlotLayer';
PlotLayer.defaultProps = defaultProps;
