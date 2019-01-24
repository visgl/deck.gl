import {PointLight as BasePointLight} from 'luma.gl';
import {COORDINATE_SYSTEM} from '../lib';

export default class PointLight extends BasePointLight {
  constructor(props) {
    super(props);

    const {coordinateSystem = COORDINATE_SYSTEM.LNGLAT} = props;
    this.coordinateSystem = coordinateSystem;
  }
}
