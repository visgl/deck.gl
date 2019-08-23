import {LayerExtension, COORDINATE_SYSTEM} from '@deck.gl/core';

const POSITION_ATTRIB_PATTERN = /positions/i;

const geoProjectionShaderModule = {
  name: 'geo-projection',
  dependencies: ['project'],
  getUniforms: opts => {
    return (
      opts &&
      opts.viewport && {
        project_uCoordinateSystem: COORDINATE_SYSTEM.IDENTITY
      }
    );
  }
};

export default class GeoProjectionExtension extends LayerExtension {
  getShaders(extension) {
    return {
      modules: [geoProjectionShaderModule]
    };
  }

  initializeState(context, extension) {
    if (!this.getAttributeManager()) {
      return;
    }

    const {viewport} = context;
    // Check the signature of our custom viewport
    if (!viewport.getRawProjection) {
      throw new Error('GeoProjectionExtension: must be used with GeoProjectionView');
    }
    const projection = viewport.getRawProjection();

    extension._updatePositionAttributes.call(this, projection);
  }

  shouldUpdateState({context, changeFlags}, extension) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return false;
    }

    const {viewport} = context;
    const {lastRotation, lastProjection} = this.state;
    const projection = viewport.getRawProjection();
    const rotation = projection.rotate();
    const projectionChanged =
      lastProjection !== projection ||
      lastRotation[0] !== rotation[0] ||
      lastRotation[1] !== rotation[1] ||
      lastRotation[2] !== rotation[2];

    if (!projectionChanged) {
      return false;
    }
    extension._updatePositionAttributes.call(this, projection);
    // Tesselators rely on update triggers to recalculate attributes
    changeFlags.updateTriggersChanged = changeFlags.updateTriggersChanged || {};
    changeFlags.updateTriggersChanged.all = true;

    return true;
  }

  _updatePositionAttributes(projection) {
    const attributeManager = this.getAttributeManager();

    const attributes = attributeManager.getAttributes();
    for (const attributeName in attributes) {
      if (POSITION_ATTRIB_PATTERN.test(attributeName)) {
        const attribute = attributes[attributeName];
        attribute.userData.transform = projection;
        attribute.setNeedsUpdate('projection changed');
      }
    }

    this.setState({
      lastProjection: projection,
      lastRotation: projection.rotate()
    });
  }
}

GeoProjectionExtension.extensionName = 'GeoProjectionExtension';
