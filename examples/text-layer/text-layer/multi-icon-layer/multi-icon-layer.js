/* eslint-disable max-len */
import {IconLayer} from 'deck.gl';
// import {fp64ify, enable64bitSupport} from '../../../lib/utils/fp64';

import vs from './multi-icon-layer-vertex.glsl';
// import vs64 from './multi-icon-layer-vertex-64.glsl';

const defaultProps = {
  ...IconLayer.defaultProps,
  getLetterIndexInString: x => x.index || 0,
  getStringLength: x => x.len || 1
};

export default class MultiIconLayer extends IconLayer {
  // getShaders() {
  //   return enable64bitSupport(this.props) ?
  //     {vs: vs64, super.getShaders().fs, modules: ['project64']} :
  //     {vs, super.getShaders().fs};  // 'project' module added by default.
  // }
  getShaders() {
    return {vs, fs: super.getShaders().fs};
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
