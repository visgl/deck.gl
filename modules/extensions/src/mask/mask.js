import {LayerExtension} from '@deck.gl/core';
import mask from './shader-module';

const defaultProps = {
  maskEnabled: true
};

export default class MaskExtension extends LayerExtension {
  getShaders() {
    // Infer by geometry if 'maskByInstance' prop isn't explictly set
    let maskByInstance = 'instancePositions' in this.getAttributeManager().attributes;
    // Users can override by setting the `maskByInstance` prop
    if ('maskByInstance' in this.props) {
      maskByInstance = this.props.maskByInstance;
    }
    this.state.maskByInstance = maskByInstance;

    return {
      modules: [mask]
    };
  }

  draw({uniforms, moduleParameters}) {
    uniforms.mask_maskByInstance = this.state.maskByInstance;
    const {maskBounds} = moduleParameters;
    if (maskBounds) {
      const bl = this.projectPosition([maskBounds[0], maskBounds[1], 0]);
      const tr = this.projectPosition([maskBounds[2], maskBounds[3], 0]);
      uniforms.mask_bounds = [bl[0], bl[1], tr[0], tr[1]];
    }
  }
}

MaskExtension.extensionName = 'MaskExtension';
MaskExtension.defaultProps = defaultProps;
