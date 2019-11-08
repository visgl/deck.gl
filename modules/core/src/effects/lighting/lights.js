import {Vector3} from 'math.gl';
import {projectPosition} from '../../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../../lib';

const DEFAULT_LIGHT_COLOR = [255, 255, 255];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_ATTENUATION = [0, 0, 1];
const DEFAULT_LIGHT_DIRECTION = [0.0, 0.0, -1.0];
const DEFAULT_LIGHT_POSITION = [0.0, 0.0, 1.0];

let idCount = 0;

export class AmbientLight {
  constructor(props = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;

    this.id = props.id || `ambient-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = 'ambient';
  }
}

export class DirectionalLight {
  constructor(props = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;
    const {direction = DEFAULT_LIGHT_DIRECTION} = props;
    const {_shadow = false} = props;

    this.id = props.id || `directional-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = 'directional';
    this.direction = new Vector3(direction).normalize().toArray();
    this.shadow = _shadow;
  }

  getProjectedLight() {
    return this;
  }
}

export class PointLight {
  constructor(props = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;
    const {position = DEFAULT_LIGHT_POSITION} = props;

    this.id = props.id || `point-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = 'point';
    this.position = position;
    this.attenuation = getAttenuation(props);
    this.projectedLight = Object.assign({}, this);
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

function getAttenuation(props) {
  if ('attenuation' in props) {
    return props.attenuation;
  }
  if ('intensity' in props) {
    return [0, 0, props.intensity];
  }
  return DEFAULT_ATTENUATION;
}
