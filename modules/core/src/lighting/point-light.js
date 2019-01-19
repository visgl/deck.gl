import {PointLight as BasePointLight} from 'luma.gl';

export default class PointLight extends BasePointLight {
  constructor(props) {
    super(props);
    this.coordinateSystem = props.coordinateSystem;
  }
}
