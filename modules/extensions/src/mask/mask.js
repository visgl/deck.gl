import {COORDINATE_SYSTEM, LayerExtension, log} from '@deck.gl/core';
import mask from './shader-module';

const defaultProps = {
  maskId: ''
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

  draw({uniforms, context, moduleParameters}) {
    uniforms.mask_maskByInstance = this.state.maskByInstance;
    const {maskId} = this.props;
    const {maskChannels} = moduleParameters;
    const {viewport} = context;
    if (maskChannels && maskChannels[maskId]) {
      const {index, bounds, coordinateOrigin: fromCoordinateOrigin} = maskChannels[maskId];
      let {coordinateSystem: fromCoordinateSystem} = maskChannels[maskId];
      uniforms.mask_enabled = true;
      uniforms.mask_channel = index;

      if (fromCoordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
        fromCoordinateSystem = viewport.isGeospatial
          ? COORDINATE_SYSTEM.LNGLAT
          : COORDINATE_SYSTEM.CARTESIAN;
      }
      const opts = {modelMatrix: null, fromCoordinateOrigin, fromCoordinateSystem};
      const bl = this.projectPosition([bounds[0], bounds[1], 0], opts);
      const tr = this.projectPosition([bounds[2], bounds[3], 0], opts);
      uniforms.mask_bounds = [bl[0], bl[1], tr[0], tr[1]];
    } else {
      if (maskId) {
        log.warn(`Could not find a mask layer with id: ${maskId}`)();
      }
      uniforms.mask_enabled = false;
    }
  }
}

MaskExtension.extensionName = 'MaskExtension';
MaskExtension.defaultProps = defaultProps;
