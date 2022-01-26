import {LayerExtension, log} from '@deck.gl/core';
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
    const {maskEnabled = true, maskId} = this.props;
    const {maskChannels} = moduleParameters;
    if (maskChannels && maskChannels[maskId]) {
      const {channel, maskBounds} = maskChannels[maskId];

      const bl = this.projectPosition([maskBounds[0], maskBounds[1], 0]);
      const tr = this.projectPosition([maskBounds[2], maskBounds[3], 0]);
      uniforms.mask_enabled = maskEnabled;
      uniforms.mask_channel = channel;
      uniforms.mask_bounds = [bl[0], bl[1], tr[0], tr[1]];
    } else {
      log.warn(`Could not find a mask layer with id: ${maskId}`)();
      uniforms.mask_enabled = false;
    }
  }
}

MaskExtension.extensionName = 'MaskExtension';
MaskExtension.defaultProps = defaultProps;
