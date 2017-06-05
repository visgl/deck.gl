import {CompositeLayer} from 'deck.gl';
import AxesLayer from './axes-layer';
import SurfaceLayer from './surface-layer';

const defaultProps = {
  getPosition: SurfaceLayer.defaultProps.getPosition,
  getColor: SurfaceLayer.defaultProps.getColor,
  getXScale: SurfaceLayer.defaultProps.getXScale,
  getYScale: SurfaceLayer.defaultProps.getYScale,
  getZScale: SurfaceLayer.defaultProps.getZScale,
  uCount: SurfaceLayer.defaultProps.uCount,
  vCount: SurfaceLayer.defaultProps.vCount,
  lightStrength: SurfaceLayer.defaultProps.lightStrength,
  drawAxes: true,
  fontSize: AxesLayer.defaultProps.fontSize,
  xTicks: AxesLayer.defaultProps.xTicks,
  yTicks: AxesLayer.defaultProps.yTicks,
  zTicks: AxesLayer.defaultProps.zTicks,
  xTickFormat: AxesLayer.defaultProps.xTickFormat,
  yTickFormat: AxesLayer.defaultProps.yTickFormat,
  zTickFormat: AxesLayer.defaultProps.zTickFormat,
  xTitle: AxesLayer.defaultProps.xTitle,
  yTitle: AxesLayer.defaultProps.yTitle,
  zTitle: AxesLayer.defaultProps.zTitle,
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
        getXScale: this.props.getXScale,
        getYScale: this.props.getYScale,
        getZScale: this.props.getZScale,
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
        xTicks: this.props.xTicks,
        yTicks: this.props.yTicks,
        zTicks: this.props.zTicks,
        xTickFormat: this.props.xTickFormat,
        yTickFormat: this.props.yTickFormat,
        zTickFormat: this.props.zTickFormat,
        xTitle: this.props.xTitle,
        yTitle: this.props.yTitle,
        zTitle: this.props.zTitle,
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
