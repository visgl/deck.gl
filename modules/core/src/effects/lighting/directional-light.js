import {DirectionalLight as BaseDirectionalLight} from '@luma.gl/core';

export default class DirectionalLight extends BaseDirectionalLight {
  constructor(props) {
    super(props);
    const {_shadow = false} = props;
    this.shadow = _shadow;
  }

  getProjectedLight() {
    return this;
  }
}
