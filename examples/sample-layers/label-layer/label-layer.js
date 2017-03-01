import {CompositeLayer, IconLayer} from 'deck.gl';
import {labelsToTextureAtlas} from './label-utils';

/* Constants */
const defaultProps = {
  getLabel: x => x.label,
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

    const {texture, mapping} = labelsToTextureAtlas({gl, data, getLabel, fontSize});
    if (this.state.texture) {
      this.state.texture.delete();
    }
    this.setState({texture, mapping});
  }

  renderLayers() {
    return new IconLayer(Object.assign({}, this.props, {
      iconAtlas: this.state.texture,
      iconMapping: this.state.mapping,
      data: this.state.mapping,
      sizeScale: 24,
      getIcon: d => d.index,
      getSize: d => 1,
      opacity: 0.8,
      pickable: true
    }));
  }
}

LabelLayer.layerName = 'LabelLayer';
LabelLayer.defaultProps = defaultProps;
