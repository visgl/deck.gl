import {CompositeLayer, IconLayer} from 'deck.gl';
import {makeTextureAtlasFromLabels} from './label-utils';

/* Constants */
const defaultProps = {
  getLabel: x => x.label,
  getPosition: x => x.position,
  getSize: x => 1,
  getColor: x => [0, 0, 0, 255],
  fontSize: 24
};

/*
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Number} [props.axesOffset] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {Number} [props.fontSize] - size of the labels
 * @param {Array} [props.axesColor] - color of the gridlines, in [r,g,b,a]
 */
export default class LabelLayer extends CompositeLayer {
  initializeState() {}

  updateState({props, oldProps, changeFlags}) {
    if (changeFlags.dataChanged || props.fontSize !== oldProps.fontSize) {
      this.updateLabelAtlas(props);
    }
  }

  updateLabelAtlas() {
    const {gl} = this.context;
    const {data, getLabel, fontSize} = this.props;

    const {texture, mapping} = makeTextureAtlasFromLabels(gl, {data, getLabel, fontSize});
    // if (this.state.texture) {
    //   this.state.texture.delete();
    // }
    this.setState({texture, mapping});
  }

  renderLayers() {
    const {fontSize} = this.props;

    return new IconLayer(Object.assign({}, this.props, {
      id: 'label-icons',
      iconAtlas: this.state.texture,
      iconMapping: this.state.mapping,
      data: this.state.mapping,
      sizeScale: fontSize,
      getIcon: d => d.index,
      getPosition: d => this.props.getPosition(d.object),
      getColor: d => this.props.getColor(d.object),
      getSize: d => this.props.getSize(d.object)
    }));
  }
}

LabelLayer.layerName = 'LabelLayer';
LabelLayer.defaultProps = defaultProps;
