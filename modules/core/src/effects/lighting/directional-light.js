import {DirectionalLight as BaseDirectionalLight} from '@luma.gl/core';

export default class DirectionalLight extends BaseDirectionalLight {
  constructor(props) {
    super(props);
    const {shadow = false} = props;
    this.shadow = shadow;
  }

  getProjectedLight() {
    return this;
  }
}
