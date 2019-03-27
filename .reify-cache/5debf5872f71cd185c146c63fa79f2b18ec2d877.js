"use strict";module.export({default:()=>Effect});class Effect {
  constructor(props = {}) {
    const {id = 'effect'} = props;
    this.id = id;
    this.props = {};
    Object.assign(this.props, props);
  }

  prepare() {}

  getParameters() {}
}
