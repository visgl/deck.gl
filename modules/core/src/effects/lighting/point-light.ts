import {projectPosition} from '../../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../../lib/constants';

import type Layer from '../../lib/layer';

const DEFAULT_LIGHT_COLOR = [255, 255, 255];
const DEFAULT_LIGHT_INTENSITY = 1.0;
const DEFAULT_ATTENUATION = [0, 0, 1];
const DEFAULT_LIGHT_POSITION = [0.0, 0.0, 1.0];

let idCount = 0;

export type PointLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: number[];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
  /** Light position [x, y, z] in the common space
   * @default [0.0, 0.0, 1.0]
   */
  position?: number[];
  /** Light attenuation
   * @default [0.0, 0.0, 1.0]
   */
  attenuation?: number[];
};

export class PointLight {
  id: string;
  color: number[];
  intensity: number;
  type = 'point';
  position: number[];
  attenuation: number[];

  protected projectedLight: PointLight;

  constructor(props: PointLightOptions = {}) {
    const {color = DEFAULT_LIGHT_COLOR} = props;
    const {intensity = DEFAULT_LIGHT_INTENSITY} = props;
    const {position = DEFAULT_LIGHT_POSITION} = props;

    this.id = props.id || `point-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = 'point';
    this.position = position;
    this.attenuation = getAttenuation(props);
    this.projectedLight = {...this};
  }

  getProjectedLight({layer}: {layer: Layer}): PointLight {
    const {projectedLight} = this;
    const viewport = layer.context.viewport;
    const {coordinateSystem, coordinateOrigin} = layer.props;
    const position = projectPosition(this.position, {
      viewport,
      coordinateSystem,
      coordinateOrigin,
      fromCoordinateSystem: viewport.isGeospatial
        ? COORDINATE_SYSTEM.LNGLAT
        : COORDINATE_SYSTEM.CARTESIAN,
      fromCoordinateOrigin: [0, 0, 0]
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = position;
    return projectedLight;
  }
}

function getAttenuation(props: PointLightOptions): number[] {
  if (props.attenuation) {
    return props.attenuation;
  }
  if ('intensity' in props) {
    return [0, 0, props.intensity || 0];
  }
  return DEFAULT_ATTENUATION;
}
