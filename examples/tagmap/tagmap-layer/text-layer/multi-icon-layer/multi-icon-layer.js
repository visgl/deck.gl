/* eslint-disable max-len */
import {IconLayer, COORDINATE_SYSTEM} from 'deck.gl';
import vs from './multi-icon-layer-vertex.glsl';
import vs64 from './multi-icon-layer-vertex-64.glsl';

const defaultProps = {
  ...IconLayer.defaultProps,
  getLetterIndexInString: x => x.index || 0,
  getStringLength: x => x.len || 1
};

export default class MultiIconLayer extends IconLayer {

  // copied from src/lib/utils/fp64.js for now as it is not visible outside the deck.gl repo
  enable64bitSupport(props) {
    if (props.fp64) {
      if (props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        return true;
      }
    }
    return false;
  }

  getShaders() {
    return this.enable64bitSupport(this.props) ?
      {vs: vs64, fs: super.getShaders().fs, modules: ['project64']} :
      {vs, fs: super.getShaders().fs};  // 'project' module added by default.
  }

  initializeState() {
    super.initializeState();

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instanceLetterIndexInString: {size: 1, accessor: 'getLetterIndexInString', update: this.calculateinstanceLetterIndexInString},
      instanceStringLength: {size: 1, accessor: 'getStringLength', update: this.calculategetStringLength}
    });
  }

  calculateinstanceLetterIndexInString(attribute) {
    const {data, getLetterIndexInString} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getLetterIndexInString(object);
    }
  }

  calculategetStringLength(attribute) {
    const {data, getStringLength} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getStringLength(object);
    }
  }

}

MultiIconLayer.layerName = 'MultiIconLayer';
MultiIconLayer.defaultProps = defaultProps;
