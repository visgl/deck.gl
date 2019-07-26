import {DirectionalLight as BaseDirectionalLight} from '@luma.gl/core';

export default class DirectionalLight extends BaseDirectionalLight {
  constructor(props) {
    super(props);
    const {castShadow = false} = props;
    this.castShadow = castShadow;
  }

  getProjectedLight() {
    return this;
  }
}
