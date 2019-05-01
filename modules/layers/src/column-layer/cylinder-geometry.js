import TruncatedConeGeometry from './stroke-truncated-cone-geometry';
import {uid} from '@luma.gl/core';

export default class CylinderGeometry extends TruncatedConeGeometry {
  constructor(props = {}) {
    const {id = uid('cylinder-geometry'), radius = 1} = props;
    super({
      ...props,
      id,
      bottomRadius: radius,
      topRadius: radius
    });
  }
}
