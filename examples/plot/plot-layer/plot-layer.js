import {CompositeLayer} from 'deck.gl';
import AxesLayer from './axes-layer';
import SurfaceLayer from './surface-layer';

const defaultProps = {
  getPosition: SurfaceLayer.defaultProps.getPosition,
  getColor: SurfaceLayer.defaultProps.getColor,
  getScale: SurfaceLayer.defaultProps.getScale,
  uCount: SurfaceLayer.defaultProps.uCount,
  vCount: SurfaceLayer.defaultProps.vCount,
  lightStrength: SurfaceLayer.defaultProps.lightStrength,
  drawAxes: true,
  fontSize: AxesLayer.defaultProps.fontSize,
  ticksCount: AxesLayer.defaultProps.ticksCount,
  formatTick: AxesLayer.defaultProps.formatTick,
  axesPadding: AxesLayer.defaultProps.padding,
  axesColor: AxesLayer.defaultProps.color
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
 * @param {Integer} [props.ticksCount] - number of ticks along each axis, see
      https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks
 * @param {Number} [props.axesPadding] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {Number} [props.fontSize] - size of the labels
 * @param {Array} [props.axesColor] - color of the gridlines, in [r,g,b,a]
 */
export default class PlotLayer extends CompositeLayer {

  _updateScales({xScale, yScale, zScale}) {
    this.setState({xScale, yScale, zScale});
  }

  renderLayers() {
    const {xScale, yScale, zScale} = this.state;

    return [
      new SurfaceLayer({
        getPosition: this.props.getPosition,
        getColor: this.props.getColor,
        uCount: this.props.uCount,
        vCount: this.props.vCount,
        getScale: this.props.getScale,
        opacity: this.props.opacity,
        pickable: this.props.pickable,
        visible: this.props.visible,
        lightStrength: this.props.lightStrength,
        onHover: this.props.onHover,
        onClick: this.props.onClick,
        onUpdate: this._updateScales.bind(this),
        updateTriggers: this.props.updateTriggers
      }),
      xScale && new AxesLayer({
        xScale,
        yScale,
        zScale,
        fontSize: this.props.fontSize,
        ticksCount: this.props.ticksCount,
        formatTick: this.props.formatTick,
        padding: this.props.axesPadding,
        color: this.props.axesColor,
        visible: this.props.drawAxes,
        pickable: false
      })
    ].filter(Boolean);
  }

}

PlotLayer.layerName = 'PlotLayer';
PlotLayer.defaultProps = defaultProps;
