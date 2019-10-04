import {PointLight as BasePointLight} from '@luma.gl/core';
import {projectPosition} from '../../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../../lib';

export default class PointLight extends BasePointLight {
  constructor(props) {
    super(props);
    this.projectedLight = new BasePointLight(props);
  }

  getProjectedLight({layer}) {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin} = layer.props;
    const position = projectPosition(this.position, {
      viewport,
      coordinateSystem,
      coordinateOrigin,
      fromCoordinateSystem: viewport.isGeospatial
        ? COORDINATE_SYSTEM.LNGLAT
        : COORDINATE_SYSTEM.IDENTITY,
      fromCoordinateOrigin: [0, 0, 0]
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = position;
    return projectedLight;
  }
}
