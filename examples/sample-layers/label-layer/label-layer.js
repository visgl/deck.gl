import {CompositeLayer, IconLayer} from 'deck.gl';
import {makeTextureAtlasFromLabels} from './label-utils';

/* Constants */
const defaultProps = {
  getLabel: x => x.label,
  fontSize: 24,
  fp64: false
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
    return new IconLayer(Object.assign({}, this.props, {
      id: 'label-icons',
      iconAtlas: this.state.texture,
      iconMapping: this.state.mapping,
      data: this.state.mapping,
      sizeScale: 24,
      getIcon: d => d.index,
      getPosition: d => this.props.getPosition(d.object),
      getColor: d => this.props.getColor(d.object),
      getSize: d => this.props.getSize(d.object)
    }));
  }
}

LabelLayer.layerName = 'LabelLayer';
LabelLayer.defaultProps = defaultProps;
